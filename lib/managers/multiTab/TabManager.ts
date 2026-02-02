/**
 * TabManager - Manages multi-tab coordination including leader election
 */

import { EventEmitter } from 'events';
import { Logger } from '../../logger';
import { InterTabChannel } from './InterTabChannel';
import {
  TabMessageType,
  TabMessage,
  TabState,
  MultiTabConfig,
  DEFAULT_MULTI_TAB_CONFIG,
  LeaderClaimPayload,
  LoginRequestPayload,
  LoginSuccessPayload,
  LoginFailedPayload,
  IncomingCallPayload,
  AnswerCallPayload,
  RejectCallPayload,
  IgnoreCallPayload,
  HangupCallPayload,
  MakeCallPayload,
  CallRingingPayload,
  CallAnsweredPayload,
  CallEndedPayload,
  CallFailedPayload,
  SendDtmfPayload,
  ConnectionChangePayload,
} from './types';
import { ExtraHeaders } from '../../client';
import { CallInfo } from '../callSession';

const Plivo = { log: Logger };

/**
 * Events emitted by TabManager
 */
export interface TabManagerEvents {
  // Leader events
  'becameLeader': () => void;
  'lostLeadership': () => void;
  'leaderChanged': (leaderId: string) => void;

  // Login events (for followers)
  'loginRequest': (payload: LoginRequestPayload, tabId: string) => void;
  'loginSuccess': (payload: LoginSuccessPayload) => void;
  'loginFailed': (payload: LoginFailedPayload) => void;
  'logoutRequest': (tabId: string) => void;
  'logoutComplete': () => void;

  // Incoming call events (for followers)
  'incomingCall': (payload: IncomingCallPayload) => void;
  'incomingCallCanceled': (payload: IncomingCallPayload) => void;

  // Call action events (for leader)
  'answerCallRequest': (payload: AnswerCallPayload) => void;
  'rejectCallRequest': (payload: RejectCallPayload) => void;
  'ignoreCallRequest': (payload: IgnoreCallPayload) => void;
  'hangupCallRequest': (payload: HangupCallPayload) => void;
  'makeCallRequest': (payload: MakeCallPayload) => void;

  // Call state events (for followers)
  'callRinging': (payload: CallRingingPayload) => void;
  'callAnswered': (payload: CallAnsweredPayload) => void;
  'callEnded': (payload: CallEndedPayload) => void;
  'callFailed': (payload: CallFailedPayload) => void;

  // Media control events (for leader)
  'muteRequest': () => void;
  'unmuteRequest': () => void;
  'dtmfRequest': (payload: SendDtmfPayload) => void;

  // Connection events
  'connectionChange': (payload: ConnectionChangePayload) => void;
}

export class TabManager extends EventEmitter {
  private channel: InterTabChannel;
  private config: MultiTabConfig;
  private state: TabState;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private leaderCheckInterval: ReturnType<typeof setInterval> | null = null;
  private electionTimeout: ReturnType<typeof setTimeout> | null = null;
  private isElectionInProgress: boolean = false;
  private pendingLeaderClaims: Map<string, number> = new Map();

  constructor(config: Partial<MultiTabConfig> = {}) {
    super();
    this.config = { ...DEFAULT_MULTI_TAB_CONFIG, ...config };
    this.channel = new InterTabChannel(this.config.channelName);

    this.state = {
      tabId: this.channel.getTabId(),
      isLeader: false,
      leaderId: null,
      lastLeaderHeartbeat: 0,
      isLoggedIn: false,
      username: null,
      hasActiveCall: false,
      activeCallUUID: null,
    };

    this.setupMessageHandlers();
    this.setupBeforeUnload();
  }

  /**
   * Setup message handlers for all message types
   */
  private setupMessageHandlers(): void {
    // Leader election messages
    this.channel.on(TabMessageType.LEADER_CLAIM, this.handleLeaderClaim.bind(this));
    this.channel.on(TabMessageType.LEADER_HEARTBEAT, this.handleLeaderHeartbeat.bind(this));
    this.channel.on(TabMessageType.LEADER_ACK, this.handleLeaderAck.bind(this));
    this.channel.on(TabMessageType.LEADER_LEAVING, this.handleLeaderLeaving.bind(this));
    this.channel.on(TabMessageType.REQUEST_LEADER_STATUS, this.handleLeaderStatusRequest.bind(this));

    // Login/logout messages
    this.channel.on(TabMessageType.LOGIN_REQUEST, this.handleLoginRequest.bind(this));
    this.channel.on(TabMessageType.LOGIN_SUCCESS, this.handleLoginSuccess.bind(this));
    this.channel.on(TabMessageType.LOGIN_FAILED, this.handleLoginFailed.bind(this));
    this.channel.on(TabMessageType.LOGOUT_REQUEST, this.handleLogoutRequest.bind(this));
    this.channel.on(TabMessageType.LOGOUT_COMPLETE, this.handleLogoutComplete.bind(this));

    // Call messages
    this.channel.on(TabMessageType.INCOMING_CALL, this.handleIncomingCall.bind(this));
    this.channel.on(TabMessageType.INCOMING_CALL_CANCELED, this.handleIncomingCallCanceled.bind(this));
    this.channel.on(TabMessageType.ANSWER_CALL, this.handleAnswerCall.bind(this));
    this.channel.on(TabMessageType.REJECT_CALL, this.handleRejectCall.bind(this));
    this.channel.on(TabMessageType.IGNORE_CALL, this.handleIgnoreCall.bind(this));
    this.channel.on(TabMessageType.HANGUP_CALL, this.handleHangupCall.bind(this));
    this.channel.on(TabMessageType.MAKE_CALL, this.handleMakeCall.bind(this));
    this.channel.on(TabMessageType.CALL_RINGING, this.handleCallRinging.bind(this));
    this.channel.on(TabMessageType.CALL_ANSWERED, this.handleCallAnswered.bind(this));
    this.channel.on(TabMessageType.CALL_ENDED, this.handleCallEnded.bind(this));
    this.channel.on(TabMessageType.CALL_FAILED, this.handleCallFailed.bind(this));

    // Media control messages
    this.channel.on(TabMessageType.MUTE_CALL, this.handleMuteCall.bind(this));
    this.channel.on(TabMessageType.UNMUTE_CALL, this.handleUnmuteCall.bind(this));
    this.channel.on(TabMessageType.SEND_DTMF, this.handleSendDtmf.bind(this));

    // Connection messages
    this.channel.on(TabMessageType.CONNECTION_CHANGE, this.handleConnectionChange.bind(this));
  }

  /**
   * Setup beforeunload handler
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.state.isLeader) {
        // Notify other tabs that leader is leaving
        this.channel.postMessage(TabMessageType.LEADER_LEAVING);
      }
      this.cleanup();
    });
  }

  /**
   * Initialize the tab manager and start leader election
   */
  public async initialize(): Promise<void> {
    Plivo.log.info(`MULTI_TAB | Initializing TabManager, tabId: ${this.state.tabId}`);

    // Request leader status from any existing tabs
    this.channel.postMessage(TabMessageType.REQUEST_LEADER_STATUS);

    // Wait a short time for responses
    await this.delay(500);

    // If no leader responded, start election
    if (!this.state.leaderId) {
      this.startLeaderElection();
    }
  }

  /**
   * Start leader election process
   */
  private startLeaderElection(): void {
    if (this.isElectionInProgress) {
      Plivo.log.debug('MULTI_TAB | Election already in progress');
      return;
    }

    Plivo.log.info('MULTI_TAB | Starting leader election');
    this.isElectionInProgress = true;
    this.pendingLeaderClaims.clear();

    // Claim leadership with our priority
    const priority = this.channel.getTabPriority();
    this.pendingLeaderClaims.set(this.state.tabId, priority);

    this.channel.postMessage(TabMessageType.LEADER_CLAIM, {
      priority,
    } as LeaderClaimPayload);

    // Wait for other claims, then determine winner
    this.electionTimeout = setTimeout(() => {
      this.resolveLeaderElection();
    }, 1000);
  }

  /**
   * Resolve leader election based on collected claims
   */
  private resolveLeaderElection(): void {
    this.isElectionInProgress = false;
    this.electionTimeout = null;

    // Find the tab with lowest priority (earliest timestamp)
    let lowestPriority = Infinity;
    let winnerId = this.state.tabId;

    this.pendingLeaderClaims.forEach((priority, tabId) => {
      if (priority < lowestPriority) {
        lowestPriority = priority;
        winnerId = tabId;
      }
    });

    Plivo.log.info(`MULTI_TAB | Election resolved. Winner: ${winnerId}`);

    if (winnerId === this.state.tabId) {
      this.becomeLeader();
    } else {
      this.state.leaderId = winnerId;
      this.state.lastLeaderHeartbeat = Date.now();
      this.startLeaderCheck();
    }
  }

  /**
   * Become the leader tab
   */
  private becomeLeader(): void {
    Plivo.log.info('MULTI_TAB | This tab is now the leader');
    this.state.isLeader = true;
    this.state.leaderId = this.state.tabId;

    // Send acknowledgment to other tabs
    this.channel.postMessage(TabMessageType.LEADER_ACK, {
      leaderId: this.state.tabId,
    });

    // Start heartbeat
    this.startHeartbeat();

    // Emit event
    this.emit('becameLeader');
  }

  /**
   * Start sending heartbeat messages
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.state.isLeader) {
        this.channel.postMessage(TabMessageType.LEADER_HEARTBEAT, {
          isLoggedIn: this.state.isLoggedIn,
          username: this.state.username,
          hasActiveCall: this.state.hasActiveCall,
          activeCallUUID: this.state.activeCallUUID,
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start checking for leader liveness
   */
  private startLeaderCheck(): void {
    if (this.leaderCheckInterval) {
      clearInterval(this.leaderCheckInterval);
    }

    this.leaderCheckInterval = setInterval(() => {
      if (!this.state.isLeader && this.state.leaderId) {
        const timeSinceLastHeartbeat = Date.now() - this.state.lastLeaderHeartbeat;
        if (timeSinceLastHeartbeat > this.config.leaderTimeout) {
          Plivo.log.warn('MULTI_TAB | Leader timeout detected, starting new election');
          this.state.leaderId = null;
          this.startLeaderElection();
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Handle leader claim message
   */
  private handleLeaderClaim(message: TabMessage): void {
    const payload = message.payload as LeaderClaimPayload;
    Plivo.log.debug(`MULTI_TAB | Received leader claim from ${message.tabId} with priority ${payload.priority}`);

    if (this.isElectionInProgress) {
      // Add to our collection of claims
      this.pendingLeaderClaims.set(message.tabId, payload.priority);
    } else if (this.state.isLeader) {
      // We're already leader, send acknowledgment
      this.channel.postMessage(TabMessageType.LEADER_ACK, {
        leaderId: this.state.tabId,
      });
    }
  }

  /**
   * Handle leader heartbeat message
   */
  private handleLeaderHeartbeat(message: TabMessage): void {
    if (message.tabId === this.state.leaderId || !this.state.leaderId) {
      this.state.leaderId = message.tabId;
      this.state.lastLeaderHeartbeat = Date.now();

      // Sync state from leader
      if (message.payload) {
        this.state.isLoggedIn = message.payload.isLoggedIn;
        this.state.username = message.payload.username;
        this.state.hasActiveCall = message.payload.hasActiveCall;
        this.state.activeCallUUID = message.payload.activeCallUUID;
      }
    }
  }

  /**
   * Handle leader acknowledgment
   */
  private handleLeaderAck(message: TabMessage): void {
    if (!this.state.isLeader) {
      this.state.leaderId = message.payload.leaderId;
      this.state.lastLeaderHeartbeat = Date.now();
      this.startLeaderCheck();
      Plivo.log.info(`MULTI_TAB | Acknowledged leader: ${this.state.leaderId}`);
    }
  }

  /**
   * Handle leader leaving notification
   */
  private handleLeaderLeaving(message: TabMessage): void {
    if (message.tabId === this.state.leaderId) {
      Plivo.log.info('MULTI_TAB | Leader is leaving, starting new election');
      this.state.leaderId = null;
      this.emit('lostLeadership');
      this.startLeaderElection();
    }
  }

  /**
   * Handle leader status request
   */
  private handleLeaderStatusRequest(message: TabMessage): void {
    if (this.state.isLeader) {
      // Respond with leader acknowledgment
      this.channel.postMessage(TabMessageType.LEADER_ACK, {
        leaderId: this.state.tabId,
      });
    }
  }

  /**
   * Handle login request (leader only)
   */
  private handleLoginRequest(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as LoginRequestPayload;
      this.emit('loginRequest', payload, message.tabId);
    }
  }

  /**
   * Handle login success (followers)
   */
  private handleLoginSuccess(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as LoginSuccessPayload;
      this.state.isLoggedIn = true;
      this.state.username = payload.username;
      this.emit('loginSuccess', payload);
    }
  }

  /**
   * Handle login failed (followers)
   */
  private handleLoginFailed(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as LoginFailedPayload;
      this.state.isLoggedIn = false;
      this.emit('loginFailed', payload);
    }
  }

  /**
   * Handle logout request (leader only)
   */
  private handleLogoutRequest(message: TabMessage): void {
    if (this.state.isLeader) {
      this.emit('logoutRequest', message.tabId);
    }
  }

  /**
   * Handle logout complete (followers)
   */
  private handleLogoutComplete(message: TabMessage): void {
    this.state.isLoggedIn = false;
    this.state.username = null;
    this.emit('logoutComplete');
  }

  /**
   * Handle incoming call (followers)
   */
  private handleIncomingCall(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as IncomingCallPayload;
      this.emit('incomingCall', payload);
    }
  }

  /**
   * Handle incoming call canceled (followers)
   */
  private handleIncomingCallCanceled(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as IncomingCallPayload;
      this.emit('incomingCallCanceled', payload);
    }
  }

  /**
   * Handle answer call request (leader only)
   */
  private handleAnswerCall(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as AnswerCallPayload;
      this.emit('answerCallRequest', payload);
    }
  }

  /**
   * Handle reject call request (leader only)
   */
  private handleRejectCall(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as RejectCallPayload;
      this.emit('rejectCallRequest', payload);
    }
  }

  /**
   * Handle ignore call request (leader only)
   */
  private handleIgnoreCall(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as IgnoreCallPayload;
      this.emit('ignoreCallRequest', payload);
    }
  }

  /**
   * Handle hangup call request (leader only)
   */
  private handleHangupCall(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as HangupCallPayload;
      this.emit('hangupCallRequest', payload);
    }
  }

  /**
   * Handle make call request (leader only)
   */
  private handleMakeCall(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as MakeCallPayload;
      this.emit('makeCallRequest', payload);
    }
  }

  /**
   * Handle call ringing (followers)
   */
  private handleCallRinging(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as CallRingingPayload;
      this.emit('callRinging', payload);
    }
  }

  /**
   * Handle call answered (all tabs)
   */
  private handleCallAnswered(message: TabMessage): void {
    const payload = message.payload as CallAnsweredPayload;
    this.state.hasActiveCall = true;
    this.state.activeCallUUID = payload.callUUID;
    if (!this.state.isLeader) {
      this.emit('callAnswered', payload);
    }
  }

  /**
   * Handle call ended (all tabs)
   */
  private handleCallEnded(message: TabMessage): void {
    const payload = message.payload as CallEndedPayload;
    this.state.hasActiveCall = false;
    this.state.activeCallUUID = null;
    if (!this.state.isLeader) {
      this.emit('callEnded', payload);
    }
  }

  /**
   * Handle call failed (followers)
   */
  private handleCallFailed(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as CallFailedPayload;
      this.emit('callFailed', payload);
    }
  }

  /**
   * Handle mute call request (leader only)
   */
  private handleMuteCall(message: TabMessage): void {
    if (this.state.isLeader) {
      this.emit('muteRequest');
    }
  }

  /**
   * Handle unmute call request (leader only)
   */
  private handleUnmuteCall(message: TabMessage): void {
    if (this.state.isLeader) {
      this.emit('unmuteRequest');
    }
  }

  /**
   * Handle send DTMF request (leader only)
   */
  private handleSendDtmf(message: TabMessage): void {
    if (this.state.isLeader) {
      const payload = message.payload as SendDtmfPayload;
      this.emit('dtmfRequest', payload);
    }
  }

  /**
   * Handle connection change (followers)
   */
  private handleConnectionChange(message: TabMessage): void {
    if (!this.state.isLeader) {
      const payload = message.payload as ConnectionChangePayload;
      this.emit('connectionChange', payload);
    }
  }

  // ==================== Public API ====================

  /**
   * Check if this tab is the leader
   */
  public isLeader(): boolean {
    return this.state.isLeader;
  }

  /**
   * Get the current tab ID
   */
  public getTabId(): string {
    return this.state.tabId;
  }

  /**
   * Get the leader tab ID
   */
  public getLeaderId(): string | null {
    return this.state.leaderId;
  }

  /**
   * Get current tab state
   */
  public getState(): TabState {
    return { ...this.state };
  }

  /**
   * Check if user is logged in (synced across tabs)
   */
  public isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }

  // ==================== Message Sending API ====================

  /**
   * Request login (follower -> leader)
   */
  public requestLogin(username: string, password?: string, accessToken?: string): void {
    if (this.state.isLeader) {
      Plivo.log.warn('MULTI_TAB | Leader should not call requestLogin');
      return;
    }

    this.channel.postMessage(TabMessageType.LOGIN_REQUEST, {
      username,
      password,
      accessToken,
      isAccessToken: !!accessToken,
    } as LoginRequestPayload);
  }

  /**
   * Broadcast login success (leader -> all)
   */
  public broadcastLoginSuccess(username: string): void {
    if (!this.state.isLeader) return;

    this.state.isLoggedIn = true;
    this.state.username = username;
    this.channel.postMessage(TabMessageType.LOGIN_SUCCESS, {
      username,
    } as LoginSuccessPayload);
  }

  /**
   * Broadcast login failed (leader -> all)
   */
  public broadcastLoginFailed(reason: string): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.LOGIN_FAILED, {
      reason,
    } as LoginFailedPayload);
  }

  /**
   * Request logout (follower -> leader)
   */
  public requestLogout(): void {
    if (this.state.isLeader) {
      Plivo.log.warn('MULTI_TAB | Leader should not call requestLogout');
      return;
    }

    this.channel.postMessage(TabMessageType.LOGOUT_REQUEST);
  }

  /**
   * Broadcast logout complete (leader -> all)
   */
  public broadcastLogoutComplete(): void {
    if (!this.state.isLeader) return;

    this.state.isLoggedIn = false;
    this.state.username = null;
    this.channel.postMessage(TabMessageType.LOGOUT_COMPLETE);
  }

  /**
   * Broadcast incoming call (leader -> all)
   */
  public broadcastIncomingCall(
    callerId: string,
    callerName: string,
    callUUID: string,
    extraHeaders: ExtraHeaders,
    callInfo: CallInfo,
  ): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.INCOMING_CALL, {
      callerId,
      callerName,
      callUUID,
      extraHeaders,
      callInfo,
    } as IncomingCallPayload);
  }

  /**
   * Broadcast incoming call canceled (leader -> all)
   */
  public broadcastIncomingCallCanceled(
    callerId: string,
    callerName: string,
    callUUID: string,
    extraHeaders: ExtraHeaders,
    callInfo: CallInfo,
  ): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.INCOMING_CALL_CANCELED, {
      callerId,
      callerName,
      callUUID,
      extraHeaders,
      callInfo,
    } as IncomingCallPayload);
  }

  /**
   * Request to answer a call (follower -> leader)
   */
  public requestAnswerCall(callUUID: string, actionOnOtherIncomingCalls?: string): void {
    this.channel.postMessage(TabMessageType.ANSWER_CALL, {
      callUUID,
      requestingTabId: this.state.tabId,
      actionOnOtherIncomingCalls,
    } as AnswerCallPayload);
  }

  /**
   * Request to reject a call (follower -> leader)
   */
  public requestRejectCall(callUUID: string): void {
    this.channel.postMessage(TabMessageType.REJECT_CALL, {
      callUUID,
    } as RejectCallPayload);
  }

  /**
   * Request to ignore a call (follower -> leader)
   */
  public requestIgnoreCall(callUUID: string): void {
    this.channel.postMessage(TabMessageType.IGNORE_CALL, {
      callUUID,
    } as IgnoreCallPayload);
  }

  /**
   * Request to hangup call (follower -> leader)
   */
  public requestHangupCall(callUUID?: string): void {
    this.channel.postMessage(TabMessageType.HANGUP_CALL, {
      callUUID,
    } as HangupCallPayload);
  }

  /**
   * Request to make a call (follower -> leader)
   */
  public requestMakeCall(phoneNumber: string, extraHeaders: ExtraHeaders): void {
    this.channel.postMessage(TabMessageType.MAKE_CALL, {
      phoneNumber,
      extraHeaders,
      requestingTabId: this.state.tabId,
    } as MakeCallPayload);
  }

  /**
   * Broadcast call ringing (leader -> all)
   */
  public broadcastCallRinging(callUUID: string, callInfo: CallInfo): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.CALL_RINGING, {
      callUUID,
      callInfo,
    } as CallRingingPayload);
  }

  /**
   * Broadcast call answered (leader -> all)
   */
  public broadcastCallAnswered(callUUID: string, answeringTabId: string, callInfo: CallInfo): void {
    if (!this.state.isLeader) return;

    this.state.hasActiveCall = true;
    this.state.activeCallUUID = callUUID;
    this.channel.postMessage(TabMessageType.CALL_ANSWERED, {
      callUUID,
      answeringTabId,
      callInfo,
    } as CallAnsweredPayload);
  }

  /**
   * Broadcast call ended (leader -> all)
   */
  public broadcastCallEnded(callUUID: string, originator: string, reason: string, callInfo: CallInfo): void {
    if (!this.state.isLeader) return;

    this.state.hasActiveCall = false;
    this.state.activeCallUUID = null;
    this.channel.postMessage(TabMessageType.CALL_ENDED, {
      callUUID,
      originator,
      reason,
      callInfo,
    } as CallEndedPayload);
  }

  /**
   * Broadcast call failed (leader -> all)
   */
  public broadcastCallFailed(callUUID: string, reason: string, callInfo?: CallInfo): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.CALL_FAILED, {
      callUUID,
      reason,
      callInfo,
    } as CallFailedPayload);
  }

  /**
   * Request mute (follower -> leader)
   */
  public requestMute(): void {
    this.channel.postMessage(TabMessageType.MUTE_CALL);
  }

  /**
   * Request unmute (follower -> leader)
   */
  public requestUnmute(): void {
    this.channel.postMessage(TabMessageType.UNMUTE_CALL);
  }

  /**
   * Request send DTMF (follower -> leader)
   */
  public requestSendDtmf(digit: string | number): void {
    this.channel.postMessage(TabMessageType.SEND_DTMF, {
      digit,
    } as SendDtmfPayload);
  }

  /**
   * Broadcast connection change (leader -> all)
   */
  public broadcastConnectionChange(state: string, reason: string): void {
    if (!this.state.isLeader) return;

    this.channel.postMessage(TabMessageType.CONNECTION_CHANGE, {
      state,
      reason,
    } as ConnectionChangePayload);
  }

  /**
   * Update local state (for leader tab)
   */
  public updateState(updates: Partial<TabState>): void {
    this.state = { ...this.state, ...updates };
  }

  // ==================== Utility Methods ====================

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    Plivo.log.debug('MULTI_TAB | Cleaning up TabManager');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.leaderCheckInterval) {
      clearInterval(this.leaderCheckInterval);
      this.leaderCheckInterval = null;
    }

    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }

    this.channel.close();
    this.removeAllListeners();
  }
}

export default TabManager;

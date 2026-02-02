/**
 * Multi-tab communication types and interfaces
 */

import { ExtraHeaders } from '../../client';
import { CallInfo } from '../callSession';

/**
 * Message types for inter-tab communication
 */
export enum TabMessageType {
  // Leader election messages
  LEADER_CLAIM = 'LEADER_CLAIM',
  LEADER_HEARTBEAT = 'LEADER_HEARTBEAT',
  LEADER_ACK = 'LEADER_ACK',
  LEADER_LEAVING = 'LEADER_LEAVING',
  REQUEST_LEADER_STATUS = 'REQUEST_LEADER_STATUS',

  // Login/Logout messages
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT_REQUEST = 'LOGOUT_REQUEST',
  LOGOUT_COMPLETE = 'LOGOUT_COMPLETE',

  // Incoming call messages
  INCOMING_CALL = 'INCOMING_CALL',
  INCOMING_CALL_CANCELED = 'INCOMING_CALL_CANCELED',

  // Call action messages
  ANSWER_CALL = 'ANSWER_CALL',
  REJECT_CALL = 'REJECT_CALL',
  IGNORE_CALL = 'IGNORE_CALL',
  HANGUP_CALL = 'HANGUP_CALL',
  MAKE_CALL = 'MAKE_CALL',

  // Call state messages
  CALL_RINGING = 'CALL_RINGING',
  CALL_ANSWERED = 'CALL_ANSWERED',
  CALL_ENDED = 'CALL_ENDED',
  CALL_FAILED = 'CALL_FAILED',

  // Media control messages
  MUTE_CALL = 'MUTE_CALL',
  UNMUTE_CALL = 'UNMUTE_CALL',
  SEND_DTMF = 'SEND_DTMF',

  // Tab management
  TAB_REGISTER = 'TAB_REGISTER',
  TAB_UNREGISTER = 'TAB_UNREGISTER',

  // Connection state
  CONNECTION_CHANGE = 'CONNECTION_CHANGE',
}

/**
 * Base message interface
 */
export interface TabMessage {
  type: TabMessageType;
  tabId: string;
  timestamp: number;
  payload?: any;
}

/**
 * Leader claim message payload
 */
export interface LeaderClaimPayload {
  priority: number; // Based on tab creation time (earlier = higher priority)
}

/**
 * Login request payload (sent from follower to leader)
 */
export interface LoginRequestPayload {
  username: string;
  password?: string;
  accessToken?: string;
  isAccessToken: boolean;
}

/**
 * Login success payload (broadcast from leader)
 */
export interface LoginSuccessPayload {
  username: string;
}

/**
 * Login failed payload
 */
export interface LoginFailedPayload {
  reason: string;
}

/**
 * Incoming call payload (broadcast from leader to all tabs)
 */
export interface IncomingCallPayload {
  callerId: string;
  callerName: string;
  callUUID: string;
  extraHeaders: ExtraHeaders;
  callInfo: CallInfo;
}

/**
 * Answer call payload (sent from any tab to leader)
 */
export interface AnswerCallPayload {
  callUUID: string;
  requestingTabId: string;
  actionOnOtherIncomingCalls?: string;
}

/**
 * Reject call payload
 */
export interface RejectCallPayload {
  callUUID: string;
}

/**
 * Ignore call payload
 */
export interface IgnoreCallPayload {
  callUUID: string;
}

/**
 * Hangup call payload
 */
export interface HangupCallPayload {
  callUUID?: string;
}

/**
 * Make call payload (sent from any tab to leader)
 */
export interface MakeCallPayload {
  phoneNumber: string;
  extraHeaders: ExtraHeaders;
  requestingTabId: string;
}

/**
 * Call ringing payload (broadcast from leader)
 */
export interface CallRingingPayload {
  callUUID: string;
  callInfo: CallInfo;
}

/**
 * Call answered payload (broadcast from leader)
 */
export interface CallAnsweredPayload {
  callUUID: string;
  answeringTabId: string;
  callInfo: CallInfo;
}

/**
 * Call ended payload
 */
export interface CallEndedPayload {
  callUUID: string;
  originator: string;
  reason: string;
  callInfo: CallInfo;
}

/**
 * Call failed payload
 */
export interface CallFailedPayload {
  callUUID: string;
  reason: string;
  callInfo?: CallInfo;
}

/**
 * DTMF payload
 */
export interface SendDtmfPayload {
  digit: string | number;
}

/**
 * Connection change payload
 */
export interface ConnectionChangePayload {
  state: string;
  reason: string;
}

/**
 * Tab state
 */
export interface TabState {
  tabId: string;
  isLeader: boolean;
  leaderId: string | null;
  lastLeaderHeartbeat: number;
  isLoggedIn: boolean;
  username: string | null;
  hasActiveCall: boolean;
  activeCallUUID: string | null;
}

/**
 * Multi-tab configuration
 */
export interface MultiTabConfig {
  enabled: boolean;
  heartbeatInterval: number;
  leaderTimeout: number;
  channelName: string;
}

/**
 * Default multi-tab configuration
 */
export const DEFAULT_MULTI_TAB_CONFIG: MultiTabConfig = {
  enabled: false,
  heartbeatInterval: 2000, // 2 seconds
  leaderTimeout: 5000, // 5 seconds - if no heartbeat, consider leader dead
  channelName: 'plivo-sdk-multi-tab',
};

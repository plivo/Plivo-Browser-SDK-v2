/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import * as SipLib from 'plivo-jssip';
import * as C from '../constants';
import { Logger } from '../logger';
import * as pkg from '../../package.json';
import { CallStatsValidationResponse, fetchIPAddress, validateCallStats } from '../stats/httpRequest';
import { createStatsSocket, initCallStatsIO } from '../stats/setup';
import {
  createIncomingSession,
} from './incomingCall';
import { createOutgoingSession } from './outgoingCall';
import { getCurrentTime, addMidAttribute } from './util';
import { stopAudio } from '../media/document';
import { Client } from '../client';
import { sendNetworkChangeEvent, startPingPong } from '../utils/networkManager';
import { StatsSocket } from '../stats/ws';

const Plivo = { log: Logger };
let urlIndex: number = 0;

/**
 * Initializes the Account.
 */

class Account {
  /**
   * Reference to the client class
   */
  private cs: Client;

  private isPlivoSocketConnected: boolean;

  /**
   * SipLib Message class to execute ping-pong
   */
  private message: any;

  /**
   * Holds the boolean whether failed event is triggered
   */
  isFailedMessageTriggered: boolean;

  /**
   * Holds the boolean whether failed event is triggered
   */
  registerRefreshTimer: number;

  /**
   * Credentials object
   */
  private credentials: {
    userName: string;
    password: string;
  };

  /**
   * Access Token Credentials object
   */
  private accessTokenCredentials: {
    accessToken: string | null;
  };

  /**
   * Hold the value of number of retry counts done
   */
  private fetchIpCount: number;

  /**
   * Validate the account credentials and session.
   */
  public validate = (): boolean => this._validate();

  /**
   * Handles signalling, transport account creation and its listners
   */
  public setupUserAccount = (): void => this._setupUserAccount();

  /**
   * Creates signalling transport and account.
   */
  public create = (): boolean => this._create();

  /**
   * Creates account, transport event listeners.
   */
  public createListeners = (): void => this._createListeners();

  // for qa purpose
  reinviteCounter: number;

  /**
   * @construtor
   * @param {Client} clientObject - client reference
   * @param {String} userName
   * @param {String} password
   * @private
   */
  constructor(clientObject: Client, userName: string, password: string,
    accessToken: string | null, registerRefreshtimer: number) {
    this.cs = clientObject;
    this.credentials = { userName, password };
    this.accessTokenCredentials = { accessToken };
    this.message = null;
    this.registerRefreshTimer = registerRefreshtimer;
    // for qa purpose
    this.reinviteCounter = 0;
    this.isPlivoSocketConnected = false;
    this.fetchIpCount = 0;
  }

  private _validate = (): boolean => {
    if (
      typeof this.credentials.userName === 'undefined'
      || typeof this.credentials.password === 'undefined'
      || this.credentials.userName === null
      || (this.credentials.password === null
        && (this.credentials.userName.length <= 0
          || (this.credentials.password as string).length <= 0))
    ) {
      Plivo.log.error('username and password cannot be null.');
      this.cs.emit('onLoginFailed', 'Username and password must be filled out');
      return false;
    }
    if (this.cs._currentSession) {
      Plivo.log.warn(
        `Cannot login when there is an ongoing call ${this.cs._currentSession.callUUID}`,
      );
      this.cs.emit(
        'onLoginFailed',
        'Cannot login when there is an ongoing call',
      );
      return false;
    }
    // On login failure retry.
    if (this.cs.phone) {
      this.cs.phone.stop();
      this.cs.phone = null;
      Plivo.log.debug('deleting the existing phone instance');
    }
    return true;
  };

  private sendReInvite = () => {
    if (this.cs._currentSession && this.cs.phone) {
      // replace current session ua with newly created ua
      this.cs._currentSession.session.replaceUA(this.cs.phone);
      setTimeout(() => {
        const eventHandlers = {
          succeeded: () => { },
          failed: () => { },
        };
        // this.cs._currentSession!.session = session;
        this.reinviteCounter += 1;
        this.cs._currentSession!.session._sendReinvite({
          eventHandlers,
          rtcOfferConstraints: { iceRestart: true },
        });
      }, 0);
    }
  };

  private setupUAConfig = () => {
    this.cs.plivoSocket = null as any;
    // look for custom domain in init options
    let wsServers = C.WS_SERVERS;
    if (this.cs.options.registrationDomainSocket) {
      wsServers = this.cs.options.registrationDomainSocket;
      if (typeof (this.cs.options.registrationDomainSocket) === 'string') {
        wsServers = (this.cs.options.registrationDomainSocket as string).split(',');
      } else {
        wsServers = this.cs.options.registrationDomainSocket;
      }
    }
    if (urlIndex >= wsServers.length) {
      urlIndex = 0;
    }

    this.cs.plivoSocket = new SipLib.WebSocketInterface(wsServers[urlIndex]) as any;
    const sipConfig = {
      sockets: [this.cs.plivoSocket],
      register_expires: this.registerRefreshTimer,
      uri: `${this.credentials.userName}@${C.DOMAIN}`,
      password: this.credentials.password,
      token: this.accessTokenCredentials.accessToken,
      googIPv6: false,
      connection_recovery_max_interval: C.WS_RECOVERY_MAX_INTERVAL,
      connection_recovery_min_interval: C.WS_RECOVERY_MIN_INTERVAL,
      session_timers: false,
      user_agent: `${pkg.name} ${pkg.version}`,
    };
    return sipConfig;
  };

  private _setupUserAccount = () => {
    const isCreated = this._create();
    if (!isCreated) return;
    Plivo.log.info('Ready to login');
    this._createListeners();
    if (this.cs.phone) {
      if (this.accessTokenCredentials.accessToken != null) {
        this.cs.phone.registrator().setExtraHeaders([
          `X-Plivo-Jwt: ${this.accessTokenCredentials.accessToken}`,
        ]);
      }

      this.cs.phone.start();
    }
  };

  private _create = (): boolean => {
    const sipConfig = this.setupUAConfig();
    try {
      this.cs.phone = new SipLib.UA(sipConfig);
      return true;
    } catch (e) {
      Plivo.log.debug(`Failed to create user agent${e}`);
      return false;
    }
  };

  private tiggerNetworkChangeEvent = () => {
    this.fetchIpCount += 1;
    fetchIPAddress(this.cs).then((ipAddress) => {
      if (typeof ipAddress === "string") {
        sendNetworkChangeEvent(this.cs, ipAddress);
      } else if (this.fetchIpCount !== C.IP_ADDRESS_FETCH_RETRY_COUNT) {
        setTimeout(() => {
          this.tiggerNetworkChangeEvent();
        }, this.fetchIpCount * 200);
      } else {
        Plivo.log.warn('Could not retreive ipaddress');
        this.fetchIpCount = 0;
      }
    });
  };

  private _createListeners = (): void => {
    if (this.cs.phone) {
      this.cs.phone.on('connected', this._onConnected);
      this.cs.phone.on('disconnected', this._onDisconnected);
      this.cs.phone.on('registered', this._onRegistered);
      this.cs.phone.on('unregistered', this._onUnRegistered);
      this.cs.phone.on('registrationFailed', this._onRegistrationFailed);
      this.cs.phone.on('newTransaction' as any, this._onNewTransaction);
      this.cs.phone.on('newRTCSession', this._onNewRTCSession);
    }
  };

  /**
   * Triggered when web socket is connected.
   * @param {UserAgentConnectedEvent} evt
   */
  private _onConnected = (evt: SipLib.UserAgentConnectedEvent): void => {
    Plivo.log.info('websocket connection established', evt);
    if (!this.isPlivoSocketConnected) {
      this.isPlivoSocketConnected = true;
      const eventData = {
        state: 'connected',
      };
      this.cs.emit('onConnectionChange', eventData);
      if (!this.cs.didFetchInitialNetworkInfo) {
        fetchIPAddress(this.cs).then((ip) => {
          this.cs.currentNetworkInfo = {
            networkType: (navigator as any).connection
              ? (navigator as any).connection.effectiveType
              : 'unknown',
            ip: typeof ip === "string" ? ip : '',
          };
        }).catch(() => {
          this.cs.currentNetworkInfo = {
            networkType: (navigator as any).connection
              ? (navigator as any).connection.effectiveType
              : 'unknown',
            ip: "",
          };
        });
        this.cs.didFetchInitialNetworkInfo = true;
      }
    }
  };

  /**
   * Triggered when web socket is disconnected.
   * @param {UserAgentDisconnectedEvent} evt
   */
  private _onDisconnected = (evt: SipLib.UserAgentDisconnectedEvent): void => {
    Plivo.log.info('websocket connection closed', evt);
    if (this.isPlivoSocketConnected) {
      // 1000 is normal websocket closed event,
      // others codes 1003,1006,1011 etc are for abnormal termination
      const eventData: {
        state: string;
        eventCode: null | number;
        eventReason: null | string;
      } = {
        state: 'disconnected',
        eventCode: null,
        eventReason: null,
      };
      if (evt && evt.code > 1000) {
        eventData.eventCode = evt.code;
        eventData.eventReason = evt.reason;
      } else if (evt && evt.error) {
        eventData.eventCode = (evt.error as any).code;
        eventData.eventReason = (evt.error as any).reason;
      }
      this.cs.emit('onConnectionChange', eventData);
      this.isPlivoSocketConnected = false;
    }

    if (!(evt as any).ignoreReconnection) {
      urlIndex += 1;
      const sipConfig = this.setupUAConfig();
      this.cs.phone!.createNewUATransport(sipConfig);
      this.cs.phone!.start();
      this.sendReInvite();
    }
  };

  /**
   * Triggered when the user is logged in.
   */
  private _onRegistered = (res: any): void => {
    // Parse the response to get the JWT expiry in epoch
    // below is the example to get basic 120 sec expiry from response
    // To do : This needs to be changed in case of login through access Token method
    if (this.cs.isAccessToken) {
      const expiryTimeInEpoch = res.response.headers['X-Plivo-Jwt'][0].raw.split(";")[0].split("=")[1];
      this.cs.setExpiryTimeInEpoch(expiryTimeInEpoch * 1000);
    }
    if (!this.cs.isLoggedIn && !this.cs.isLoginCalled) {
      // this is case of network change
      clearInterval(this.cs.networkChangeInterval as any);
      this.cs.networkChangeInterval = null;
      startPingPong({
        client: this.cs,
        networkChangeInterval: this.cs._currentSession
          ? C.NETWORK_CHANGE_INTERVAL_ON_CALL_STATE : C.NETWORK_CHANGE_INTERVAL_IDLE_STATE,
        messageCheckTimeout: this.cs._currentSession
          ? C.MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE : C.MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
      });
      if (!this.cs._currentSession) return;

      // create stats socket and trigger and trigger network change event
      // when user is in in-call state
      if (this.cs.statsSocket) {
        this.cs.statsSocket.disconnect();
        this.cs.statsSocket = null;
      }
      this.cs.statsSocket = new StatsSocket();
      this.cs.statsSocket.connect();
      this.cs.networkReconnectionTimestamp = new Date().getTime();
      this.tiggerNetworkChangeEvent();
    }

    if (!this.cs.isLoginCalled) {
      this.cs.isLoggedIn = true;
    }
    this.cs.userName = this.credentials.userName;
    this.cs.password = this.credentials.password;
    if (this.cs.isLoggedIn === false && this.cs.isLoginCalled === true) {
      this.cs.isLoggedIn = true;
      this.cs.isLoginCalled = false;
      this.cs.emit('onLogin');
      Plivo.log.debug('logged in');
      // in firefox and safari web socket re-establishes automatically after network change
      startPingPong({
        client: this.cs,
        networkChangeInterval: C.NETWORK_CHANGE_INTERVAL_IDLE_STATE,
        messageCheckTimeout: C.MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
      });
      // get callstats key and create stats socket
      let passToken: string | null;
      if (this.cs.isAccessToken) {
        passToken = this.cs.accessToken;
      } else {
        passToken = this.cs.password;
      }
      validateCallStats(this.cs.userName, passToken, this.cs.isAccessToken)
        .then((responsebody: CallStatsValidationResponse) => {
          this.cs.callstatskey = responsebody.data;
          this.cs.rtp_enabled = responsebody.is_rtp_enabled;
        }).catch(() => {
          this.cs.callstatskey = null;
        });

      // initialize callstats.io
      initCallStatsIO.call(this.cs);
    }
  };

  /**
   * Triggered when user is logged out.
   * @param {Object} reason - Unregistration reason
   */
  private _onUnRegistered = (): void => {
    Plivo.log.debug('Plivo client unregistered');
    this.cs.isLoggedIn = false;
    if (this.cs.ringToneView && !this.cs.ringToneView.paused) {
      stopAudio(C.RINGTONE_ELEMENT_ID);
    }
    if (this.cs.ringBackToneView && !this.cs.ringBackToneView.paused) {
      stopAudio(C.RINGBACK_ELEMENT_ID);
    }

    this.cs.networkDisconnectedTimestamp = new Date().getTime();
    this.cs.userName = null;
    this.cs.password = null;

    if (this.cs.isLogoutCalled === true) {
      this.cs.isLogoutCalled = false;
      this.cs.emit('onLogout');
      if (this.cs.networkChangeInterval) {
        clearInterval(this.cs.networkChangeInterval);
      }
      this.message = null;
    }

    if (this.cs.callUUID == null) {
      this.cs.logout();
    }
  };

  /**
   * Triggered when user credentials are wrong.
   * @param {Object} error - Login failure error
   */
  private _onRegistrationFailed = (error: { cause?: string, response: any }): void => {
    this.cs.isLoggedIn = false;
    Plivo.log.debug('Login failed : ', error.cause);
    this.cs.userName = null;
    this.cs.password = null;

    const errorCode = error?.response?.headers['X-Plivo-Jwt-Error-Code'] ? parseInt(error?.response?.headers['X-Plivo-Jwt-Error-Code'][0]?.raw, 10) : 401;
    if (this.cs.isAccessTokenGenerator) {
      this.cs.emit('onLoginFailed', "RELOGIN_FAILED_INVALID_TOKEN");
    } else {
      this.cs.emit('onLoginFailed', this.cs.getErrorStringByErrorCodes(errorCode));
    }
  };

  /**
   * Triggered when a transaction is created.
   * @param {Any} evt - transaction details
   */
  private _onNewTransaction = (evt: any): void => {
    // NOTE: This event is not documented by JsSIP.
    // Should be used to just record the timestamp of invite received only
    // Do not have any other logic here
    // Invite Server Trasaction(ist) gives us the incoming invite timestamp.
    if (evt.transaction.type === 'ist') {
      Plivo.log.info('<----- INCOMING ----->');
      const callUUID = evt.transaction.request.getHeader('X-Calluuid') || null;
      this.cs.incomingCallsInitiationTime.set(callUUID, getCurrentTime());
      Plivo.log.debug('call initiation time, invite received from server');
    }
  };

  /**
   * Triggered when a new call is performed/received.
   * @param {UserAgentNewRtcSessionEvent} evt
   */
  private _onNewRTCSession = (evt: SipLib.UserAgentNewRtcSessionEvent): void => {
    Plivo.log.debug('new rtc session');
    // create stats socket
    createStatsSocket.call(this.cs);
    if (!this._validateRTCSession(evt)) return;

    if (evt.originator === 'remote') {
      addMidAttribute.call(this.cs, evt);
      createIncomingSession(this.cs, evt);
    } else {
      createOutgoingSession(evt);
    }
    this.cs.timeTakenForStats.mediaSetup = {} as any;
    this.cs.timeTakenForStats.mediaSetup.init = new Date().getTime();
  };

  /**
   * Check previous call sessions and incoming call invites.
   * @param {UserAgentNewRtcSessionEvent} evt
   */
  private _validateRTCSession = (evt: SipLib.UserAgentNewRtcSessionEvent): boolean => {
    if (
      this.cs._currentSession
      && this.cs._currentSession.session.connection
      && this.cs._currentSession.session.connection.signalingState === 'closed'
    ) {
      Plivo.log.warn('Previous call did not end properly');
      this.cs._currentSession = null;
      this.cs.callSession = null;
      this.cs.callUUID = null;
      this.cs.callDirection = null;
    }
    if (this.cs.incomingInvites.size) {
      this.cs.incomingInvites.forEach((invite) => {
        // Remove the incoming call from map if it is failed but not removed properly
        if (invite.session.isEnded()) {
          this.cs.incomingInvites.delete(invite.callUUID);
        }
      });
    }
    if (
      ((this.cs._currentSession || this.cs.incomingInvites.size)
        && !this.cs.options.allowMultipleIncomingCalls)
      || this.cs.incomingInvites.size
      >= C.NUMBER_OF_SIMULTANEOUS_INCOMING_CALLS_ALLOWED
    ) {
      Plivo.log.debug('Already on call, sending busy signal.');
      const opts = {
        status_code: 486,
        reason_phrase: 'Busy Here',
      };
      evt.session.terminate(opts);
      return false;
    }
    return true;
  };
}

export default Account;

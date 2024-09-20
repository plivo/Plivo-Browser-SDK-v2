/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
import { EventEmitter } from 'events';
import { WebSocketInterface, UA, RTCSession } from 'plivo-jssip';
import * as C from './constants';
import {
  Logger, AvailableLogMethods, AvailableFlagValues, DtmfOptions,
} from './logger';
import * as audioUtil from './media/audioDevice';
import * as documentUtil from './media/document';
import validateOptions from './utils/options';
import * as nonRTPStats from './stats/nonRTPStats';
import * as device from './utils/device';
// import * as oneWayAudio from './utils/oneWayAudio';
import Account from './managers/account';
import * as IncomingCall from './managers/incomingCall';
import * as OutgoingCall from './managers/outgoingCall';
import { CallSession } from './managers/callSession';
import { StatsSocket } from './stats/ws';
import { validateFeedback, FeedbackObject } from './utils/feedback';
import {
  PreSignedUrlRequest,
  getPreSignedS3URL,
  uploadConsoleLogsToBucket,
  PreSignedUrlResponse,
} from './stats/httpRequest';
import {
  OutputDevices,
  InputDevices,
  RingToneDevices,
} from './media/audioDevice';
import getBrowserDetails from './utils/browserDetection';
import detectFramework from './utils/frameworkDetection';
import AccessTokenInterface from './utils/token';
import {
  setErrorCollector,
  setConectionInfo,
  hangupClearance,
  clearOptionsInterval,
  uuidGenerator,
  getCurrentTime,
} from './managers/util';
import { NoiseSuppression } from './rnnoise/NoiseSuppression';
import { ConnectionState } from './utils/networkManager';
import { WorkerManager } from './managers/workerManager';
import { LOCAL_ERROR_CODES, LOGCAT } from './constants';
import { LoggerUtil } from './utils/loggerUtil';

export interface PlivoObject {
  log: typeof Logger;
  sendEvents?: (obj: any, session: CallSession) => void;
  AppError?: (obj: any, log: any) => boolean;
  audioConstraints?: MediaTrackConstraints
}

const Plivo: PlivoObject = {
  log: Logger,
  sendEvents: nonRTPStats.sendEvents,
  AppError: nonRTPStats.AppError,
};
// inherits(Client, EventEmitter);

export interface ConfiguationOptions {
  codecs?: string[];
  enableTracking?: boolean;
  enableQualityTracking?: AvailableFlagValues;
  debug?: AvailableLogMethods;
  permOnClick?: boolean;
  enableIPV6?: boolean;
  // eslint-disable-next-line no-undef
  audioConstraints?: MediaTrackConstraints;
  dscp?: boolean;
  appId?: null | string;
  appSecret?: null | string;
  registrationDomainSocket?: string[] | null;
  clientRegion?: null | string;
  preDetectOwa?: boolean;
  disableRtpTimeOut?: boolean;
  allowMultipleIncomingCalls?: boolean;
  closeProtection?: boolean;
  maxAverageBitrate?: number;
  useDefaultAudioDevice?: boolean
  registrationRefreshTimer?: number;
  enableNoiseReduction?: boolean;
  usePlivoStunServer?: boolean
  stopAutoRegisterOnConnect: boolean,
  dtmfOptions?: DtmfOptions;
  captureSDKCrashOnly: boolean;
}

export interface BrowserDetails {
  browser: string;
  version: number;
}

export interface ExtraHeaders {
  [key: string]: string;
}

export interface Storage {
  local_audio: any[];
  remote_audio: any[];
  mosLocalMeasures: any[];
  jitterLocalMeasures: number[];
  jitterRemoteMeasures: number[];
  packetLossRemoteMeasures: number[];
  packetLossLocalMeasures: number[];
  rtt: number[];
  mosRemoteMeasures: number[]
  audioCodec: null | string;
  startAnalysis: boolean;
  warning: {
    audioLocalMeasures: boolean;
    audioRemoteMeasures: boolean;
    mosLocalMeasures: boolean;
    mosRemoteMeasures: boolean;
    jitterLocalMeasures: boolean;
    jitterRemoteMeasures: boolean;
    packetLossRemoteMeasures: boolean;
    packetLossLocalMeasures: boolean;
    rtt: boolean;
    ice_connection: boolean;
  };
}

export interface ConnectionInfo {
  reason: string,
  state: string
}

/**
 * Initializes the client.
 * @public
 */
export class Client extends EventEmitter {
  /**
   * Holds the browser details of the client
   * @private
   */
  browserDetails: BrowserDetails;

  /**
   * Set to true if you want to ask for mic permission just
   * before call connection. Otherwise it will be asked only on page load
   * @private
   */
  permOnClick: boolean;

  /**
   * Play the ringtone audio for incoming calls if this flag is set to true
   * Otherwise do not play audio.
   * @private
   */
  ringToneFlag: boolean;

  /**
   * Callback to perform login after previous connection is disconnected successfully
   * @private
   */
  loginCallback: any;

  /**
   * Play the ringtone audio for outgoing calls in ringing state if this flag is set to true
   * Otherwise do not play audio.
   * @private
   */
  ringToneBackFlag: boolean;

  /**
   * Play the connect tone audio for outgoing calls in sending state if this flag is set to true
   * Otherwise do not play audio.
   * @private
   */
  connectToneFlag: boolean;

  /**
   * Set to true if logged in. Otherwise set to false
   * @private
   */
  isLoggedIn: boolean;

  /**
   * Holds the JSSIP user agent for the logged in user
   * @private
   */
  phone: UA | null;

  /**
   * Holds the incoming or outgoing call session details
   * @private
   */
  _currentSession: null | CallSession;

  /**
   * Difference in time(ms) between local machine and universal epoch time
   * @private
   */
  timeDiff: number;

  /**
   * Holds the incoming or outgoing JsSIP RTCSession(WebRTC media session)
   * @private
   */
  callSession: null | RTCSession;

  /**
   * Unique identifier generated for a call by server
   * @private
   */
  callUUID: null | string;

  /**
   * Specifies whether the call direction is incoming or outgoing
   * @private
   */
  callDirection: null | string;

  /**
   * Holds the SpeechRecognition instance which listens for
   * speech when the user speaks on mute
   * @private
   */
  speechRecognition: any;

  /**
   * Holds the loggerUtil instance which keeps the
   * value of username and sipCallID to attached to each log
   * @private
   */
  loggerUtil: LoggerUtil;

  /*
   * Holds the instance of NoiseSuppression
   * @private
   */
  noiseSuppresion: NoiseSuppression;

  /**
   * Specifies whether the noise suppression should be enabled or not
   * @private
   */
  enableNoiseReduction: boolean | undefined;

  /**
   * Contains the identifier for previous incoming or outgoing call
   * @private
   */
  lastCallUUID: null | string;

  /**
   * Holds the call session of previous incoming or outgoing call
   * @private
   */
  _lastCallSession: null | CallSession;

  /**
   * Contains the ongoing incoming calls identifiers with their call session
   * @private
   */
  incomingInvites: Map<string, any>;

  /**
   * Contains the ongoing incoming calls identifiers with their start time
   * @private
   */
  incomingCallsInitiationTime: Map<string, any>;

  /**
   * Holds the call session of previous incoming call
   * @private
   */
  lastIncomingCall: null | CallSession;

  /**
   * Holds the callstats.io instance for sending the stats to callstats.io
   * @private
   */
  callStats: any;

  /**
   * Username given when logging in
   * @private
   */
  userName: null | string;

  /**
   * Password given when logging in
   * @private
   */
  password: null | string;

  /**
   * Access Token  given when logging in
   * @private
   */
  accessToken: null | string;

  /**
   * contactUri object which holds the connection details
   * @private
   */
  contactUri: {
    name: string | null;
    ip: string;
    port: string;
    protocol: string;
    registrarIP: string;
  };

  /**
   * Access Token object given when logging in
   * @private
   */
  accessTokenObject: null | any;

  /**
   * boolean that tells which type of login method is called
   * @private
   */
  isAccessTokenGenerator: boolean | null;

  /**
   * boolean that tells if user logged in through access token
   * @private
   */
  isAccessToken: boolean;

  /**
   * access token expiry
   * @private
   */
  accessTokenExpiryInEpoch: number | null;
  /**
   * Access Token  Outgoing Grant
   * @private
   */

  isOutgoingGrant: boolean | null;

  /**
   * Access Token  Incoming Grant
   * @private
   */
  isIncomingGrant: boolean | null;

  /**
   * Access Token  abstract class that needs to be implemented
   * @private
   */
  accessTokenInterface: any;

  // To do : Use below two flags to handle the edge case when token gets expired during
  //  an ongoing call and user needs to send the feedback after the call hang ups

  /**
   * Flag to monitor the feedback api that gets called after the token is expired
   * @private
   */
  deferFeedback: null | boolean;

  /**
   * Flag that tells if unregister is pending or not
   * @private
   */
  isUnregisterPending: null | boolean;

  /**
   * Options passed by the user while instantiating the client class
   * @private
   */
  options: ConfiguationOptions;

  /**
   * It is a unique identifer which is not null when callstats permission is present
   * @private
   */
  callstatskey: null | string;

  /**
   * Set to true if RTP stats needed to be sent for the call.Otherwise RTP stats are not sent
   * @private
   */
  // eslint-disable-next-line camelcase
  rtp_enabled: boolean;

  /**
   * Set to true if user is using callstats.io
   * @private
   */
  statsioused: boolean;

  /**
   * Describes whether the call is in mute state or not
   * @private
   */
  isCallMuted: boolean;

  /**
   * Specifically used for SpeechRecognition
   * Describes whether the call is in mute state or not
   * @private
   */
  isMuteCalled : boolean;

  /**
   * All audio related information
   * @public
   */
  audio: {
    /**
     * Return a promise with the list of available devices
     */
    // eslint-disable-next-line no-unused-vars
    availableDevices: (filter: string) => Promise<MediaDeviceInfo[]>;
    /**
     * Object with getter and setter functions for ringtone devices
     */
    ringtoneDevices: RingToneDevices;
    /**
     * Object with getter and setter functions for microphone devices
     */
    microphoneDevices: InputDevices;
    /**
     * Object with getter and setter functions for audio output devices
     */
    speakerDevices: OutputDevices;
    /**
     * Return a promise with the list of audio output devices
     */
    // eslint-disable-next-line no-unused-vars
    revealAudioDevices: (arg: string) => Promise<string | MediaStream>;
  };

  /**
   * Audio constraints object that will be passed to webRTC getUserMedia()
   * @private
   */
  // eslint-disable-next-line no-undef
  audioConstraints: MediaTrackConstraints;

  /**
   * Holds the previous one way audio detection details
   * @private
   */
  owaLastDetect: { time: Date; isOneWay: boolean };

  /**
   * Specifies the interval at which one way audio detection happens
   * @private
   */
  owaDetectTime: number;

  /**
   * explains whether call should be muted
   * @private
   */
  shouldMuteCall: boolean;

  /**
   * Holds the websocket instance created for sending stats
   * @private
   */
  statsSocket: null | StatsSocket;

  /**
   * Contains available audio devices.This is done for backward compatibility
   * @private
   */
  audioDevDic: any;

  /**
   * It is a wrapper over ringback tone audio element.
   * It is used for playing and pausing ringtone audio for outgoing call
   * @private
   */
  ringBackToneView: null | HTMLAudioElement;

  /**
   * It is a wrapper over ring tone audio element.
   * It is used for playing and pausing ringtone audio for incoming call
   * @private
   */
  ringToneView: null | HTMLAudioElement;

  /**
   * Holds rtp stat information which will be used in capturing media metrics
   * @private
   */
  storage: Storage | null;

  /**
   * Holds the websocket instance created for SIP signalling purpose
   * @private
   */
  plivoSocket: WebSocketInterface;

  /**
   * Holds the connection state of the SDK
   * @private
   */
  connectionInfo: ConnectionInfo;

  /**
   * Responsible for playing audio stream of remote user during call
   * @private
   */
  remoteView: any;

  /**
   * It is a wrapper over connect tone audio element.
   * It is used for playing and pausing connect tone audio for outgoing call
   * @private
   */
  connectToneView: HTMLAudioElement;

  /**
   * Explains whether login method is called.
   * @private
   */
  isLoginCalled: boolean;

  /**
   * Explains whether logout method is called.
   * @private
   */
  isLogoutCalled: boolean;

  /**
   * Maintains a setInterval which checks for network change in idle state
   * @private
   */
  networkChangeInterval: null | ReturnType<typeof setInterval>;

  /**
  * Maintains a setInterval which checks for WS reconnection
  * @private
  */
  connectionRetryInterval: null | ReturnType<typeof setInterval>;

  /**
   * Calculate time taken for different stats
   * @private
   */
  timeTakenForStats: { [key: string]: { init: number, end?: number } };

  /**
   * Holds network disconnected timestamp
   * @private
   */
  networkDisconnectedTimestamp: number | null;

  /**
   * Holds network reconnection timestamp
   * @private
   */
  networkReconnectionTimestamp: number | null;

  /**
   * Holds current network information
   * @private
   */
  currentNetworkInfo: {
    networkType: string;
    ip: string;
  };

  /**
   * Determines whether any audio device got toggled during current session
   * @private
   */
  deviceToggledInCurrentSession: boolean;

  /**
   * Determines whether any audio device got toggled during current session
   * @private
   */
  useDefaultAudioDevice: boolean;

  /**
   * Determines whether network got changed during current session
   * @private
   */
  networkChangeInCurrentSession: boolean;

  /**
  * Holds the status of the websocket connection
  * @private
  */
  connectionStatus: string;

  /**
  * Holds a string value tp uniquely identify each tab
  * @private
  */
  identifier: string;

  /**
  * Holds the instance of WorkerManager class
  * @private
  */
  workerManager: WorkerManager;

  /**
   * Holds a boolean to get initial network info
   * @private
   */
  didFetchInitialNetworkInfo: boolean;

  /**
 * Flag which when set stops auto registration post websocket connection
 * Defaults value is true
 * @private
 */
  stopAutoRegisterOnConnect: boolean;

  /**
   * Determines which js framework sdk is running with
   * @private
   */
  jsFramework: string[];

  /**
   * Get current version of the SDK
   */
  public version: string;

  /**
   * Register using user credentials.
   * @param {String} userName
   * @param {String} password
   */
  public login = (username: string, password: string): boolean => this._login(username, password);

  /**
   * Register using user access token.
   * @param {String} accessToken
   */
  public loginWithAccessToken =
  (accessToken: string): boolean => this._loginWithAccessToken(accessToken);

  /**
   * Register using user access token.
   * @param {Any} accessTokenObject
   */
  public loginWithAccessTokenGenerator =
  (accessTokenObject: any): boolean => this._loginWithAccessTokenGenerator(accessTokenObject);

  /**
   * get error string by error code
   * @param {number} errorCode
   */
  public getErrorStringByErrorCodes =
  (errorCode: number): string => this._getErrorStringByErrorCodes(errorCode);

  /**
   * Unregister and clear stats timer, socket.
   */
  public logout = (): boolean => this._logout();

  /**
   * Unregister the user.
   */
  public unregister = (): boolean => this._unregister();

  /**
   * disconnect the websocket and stop the network check timer.
   */
  public disconnect = (): boolean => this._disconnect();

  /**
   * Register the user.
   *  @param {Array<string>} extraHeaders - (Optional) Extra headers to be sent along with register.
   */
  public register = (extraHeaders: Array<string>): boolean => this._register(extraHeaders);

  /**
   * Start an outbound call.
   * @param {String} phoneNumber - It can be a sip endpoint/number
   * @param {Object} extraHeaders - (Optional) Custom headers which are passed in the INVITE.
   * They should start with 'X-PH'
   */
  public call = (
    phoneNumber: string,
    extraHeaders: ExtraHeaders,
  ): boolean => this._call(phoneNumber, extraHeaders);

  /**
   * Answer the incoming call.
   * @param {String} callUUID - (Optional) Provide latest CallUUID to answer the call
   * @param {String} actionOnOtherIncomingCalls -  (Optional) Specify action(reject, ignore,
   * letring)
   * for next incoming calls when already on call
   */
  public answer = (
    callUUID: string,
    actionOnOtherIncomingCalls: string,
  ): boolean => this._answer(callUUID, actionOnOtherIncomingCalls);

  /**
   * Hangup the call(Outgoing/Incoming).
   */
  public hangup = (): boolean => this._hangup();

  /**
  * Redirect the call.
  * @param {String} contactUri - details of the contact towards which the call should be redirected
  */
  public redirect = (
    contactUri: string,
  ): boolean => this._redirect(contactUri);

  /**
   * Reject the Incoming call.
   * @param {String} callUUID - (Optional) Provide latest CallUUID to reject the call
   */
  public reject = (callUUID: string): boolean => this._reject(callUUID);

  /**
   * Ignore the Incoming call.
   * @param {String} callUUID - (Optional) Provide latest CallUUID to ignore the call
   */
  public ignore = (callUUID: string): boolean => this._ignore(callUUID);

  /**
 * Set the unique identifier.
 * @param {String} identifier - Identifier to be set.
 */
  public setIdentifier = (identifier: string): boolean => this._setIdentifier(identifier);

  /**
   * Send DTMF for call(Outgoing/Incoming).
   * @param {String} digit - Send the digits as dtmf 'digit'
   * ("1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "*", "#")
   */
  public sendDtmf = (digit: string | number): void => this._sendDtmf(digit);

  /**
   * Mute the call(Outgoing/Incoming).
   */
  public mute = (): boolean => this._mute();

  /**
   * Unmute the call(Outgoing/Incoming).
   */
  public unmute = (): boolean => this._unmute();

  /**
   * Configure the ringtone played when an incoming call starts ringing.
   * @param {Any} val - Can be media url or boolean value for enabling/disabling default ringtone
   */
  public setRingTone = (val: string | boolean): boolean => this._setRingTone(val);

  /**
   * Configure the ringtone played when an outgoing call starts ringing.
   * @param {Any} val - Can be media url or boolean value for enabling/disabling default ringtone
   */
  public setRingToneBack = (val: string | boolean): boolean => this._setRingToneBack(val);

  /**
   * Configure the audio played when an outgoing call is being connected.
   * @param {Boolean} val - Enable/Disable default connect tone
   */
  public setConnectTone = (val: boolean): boolean => this._setConnectTone(val);

  /**
   * Starts the Noise Reduction.
   * @param {Boolean} val - true if noise reduction is started, else false
   */
  public startNoiseReduction = (): Promise<boolean> => this._startNoiseReduction();

  /**
 * stops the Noise Reduction.
 * @param {Boolean} val - true if noise reduction is stopped, else false
 */
  public stopNoiseReduction = (): Promise<boolean> => this._stopNoiseReduction();

  /**
   * Configure the audio played when sending a DTMF.
   * @param {String} digit - Specify digit for which audio needs to be configured
   * @param {String} url - Media url for playing audio
   */
  public setDtmfTone = (
    digit: string, url: string | boolean,
  ): boolean => this._setDtmfTone(digit, url);

  /**
   * Get the CallUUID if a call is active.
   * @returns Current CallUUID
   */
  public getCallUUID = (): string | null => this._getCallUUID();

  /**
   * Check if the client is in registered state.
   */
  public isRegistered = (): boolean | null => this._isRegistered();

  /**
  * Check if the client is in connecting state.
  */
  public isConnecting = (): boolean | null => this._isConnecting();

  /**
  * Get the details of the contact.
  */
  public getContactUri = (): string | null => this._getContactUri();

  /**
  * Check if the client is in connected state.
  */
  public isConnected = (): boolean | null => this._isConnected();

  /**
  * Get the details of the current active call session.
  */
  public getCurrentSession = (): CallSession | null => this._getCurrentSession();

  /**
   * Get the CallUUID of the latest answered call.
   */
  public getLastCallUUID = (): string | null => this._getLastCallUUID();

  /**
   * Get a list of incoming calls which are active.
   */
  public getIncomingCalls = (): any[] => this._getIncomingCalls();

  /**
   * Update log level
   * @param {String} debug - log level
   */
  public setDebug = (debug: AvailableLogMethods): void => this._setDebug(debug);

  /**
   * Get RTCPeerConnection object
   */
  public getPeerConnection = (): { status: string; pc: any } => this._getPeerConnection();

  /**
   * Get webRTC support, return true if webRTC is supported
   */
  public webRTC = (): boolean => !!window.RTCPeerConnection;

  /**
   * Get supported browsers
   */
  public supportedBrowsers = (): string => 'Chrome, Firefox, Safari, Edge';

  /**
   * Configure the audio played when sending a DTMF.
   * @param {String} callUUID - Specify CallUUID for which feedback needs to be sent
   * @param {String} starRating - Rate the call from 1 to 5
   * @param {Array<String>} issues - Provide suspected issues
   * @param {String} note - Send any remarks
   * @param {Boolean} sendConsoleLogs - Send browser logs to Plivo
   */
  public submitCallQualityFeedback = (
    callUUID: string,
    starRating: string,
    issues: string[],
    note: string,
    sendConsoleLogs: boolean,
  ): Promise<string> => this._submitCallQualityFeedback(
    callUUID,
    starRating,
    issues,
    note,
    sendConsoleLogs,
  );

  /**
   * @constructor
   * @param options - (Optional) client configuration parameters
   * @private
   */
  constructor(options: ConfiguationOptions) {
    super();

    device.checkMediaDevices();

    this.version = 'PLIVO_LIB_VERSION';

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _options = validateOptions(options);
    Plivo.log.enableSipLogs(_options.debug as AvailableLogMethods);
    this.loggerUtil = new LoggerUtil(this);
    Plivo.log.setLoggerUtil(this.loggerUtil);
    this.identifier = uuidGenerator();
    Plivo.log.debug(`${C.LOGCAT.INIT} | unique identifier generated: ${this.identifier}`);
    this.loggerUtil.setIdentifier(this.identifier);

    const data = {
      codecs: _options.codecs,
      enableTracking: _options.enableTracking,
      enableQualityTracking: _options.enableQualityTracking,
      debug: _options.debug,
      enableIPV6: _options.enableIPV6,
      dscp: _options.dscp,
      appId: _options.appId,
      appSecret: _options.appSecret,
      registrationDomainSocket: _options.registrationDomainSocket,
      clientRegion: _options.clientRegion,
      disableRtpTimeOut: _options.disableRtpTimeOut,
      allowMultipleIncomingCalls: _options.allowMultipleIncomingCalls,
      closeProtection: _options.closeProtection,
      maxAverageBitrate: _options.maxAverageBitrate,
      useDefaultAudioDevice: _options.useDefaultAudioDevice,
      enableNoiseReduction: _options.enableNoiseReduction,
      usePlivoStunServer: _options.usePlivoStunServer,
      dtmfOptions: _options.dtmfOptions,
      captureSDKCrashOnly: _options.captureSDKCrashOnly,
      permOnClick: _options.permOnClick,
      stopAutoRegisterOnConnect: _options.stopAutoRegisterOnConnect,
      registrationRefreshTimer: _options.registrationRefreshTimer,
    };
    Plivo.log.info(`${C.LOGCAT.INIT} | Plivo SDK initialized successfully with options:- `, JSON.stringify(data), `in ${Plivo.log.level()} mode`);
    // instantiates event emitter
    EventEmitter.call(this);

    this.accessTokenInterface = AccessTokenInterface;
    this.deferFeedback = null;
    this.isUnregisterPending = null;
    // Default instance flags
    this.browserDetails = getBrowserDetails();
    this.connectionInfo = { state: "", reason: "" };
    this.permOnClick = false;
    this.ringToneFlag = true;
    this.ringToneBackFlag = true;
    this.connectToneFlag = true;
    this.isLoggedIn = false;
    this.phone = null;
    this._currentSession = null;
    this.callSession = null;
    this.callUUID = null;
    this.callDirection = null;
    this.lastCallUUID = null;
    this._lastCallSession = null;
    this.incomingInvites = new Map();
    this.incomingCallsInitiationTime = new Map();
    this.lastIncomingCall = null;
    this.callStats = null;
    this.userName = null;
    this.password = null;
    this.connectionStatus = '';
    this.options = _options;
    this.callstatskey = null;
    this.rtp_enabled = false;
    this.statsioused = false;
    this.isCallMuted = false;
    this.isLoginCalled = false;
    this.isLogoutCalled = false;
    this.networkChangeInterval = null;
    this.connectionRetryInterval = null;
    this.shouldMuteCall = false;
    this.isOutgoingGrant = false;
    this.isIncomingGrant = false;
    this.useDefaultAudioDevice = false;
    this.stopAutoRegisterOnConnect = _options.stopAutoRegisterOnConnect;
    if (getBrowserDetails().browser !== 'firefox') {
      // eslint-disable-next-line new-cap, no-undef
      this.speechRecognition = new webkitSpeechRecognition();
    }
    if (this.options.usePlivoStunServer === true
      && C.STUN_SERVERS.indexOf(C.FALLBACK_STUN_SERVER) === -1) {
      C.STUN_SERVERS.push(C.FALLBACK_STUN_SERVER);
    }
    if (this.options.usePlivoStunServer === false
      && C.STUN_SERVERS.indexOf(C.GOOG_STUN_SERVER) === -1) {
      C.STUN_SERVERS.push(C.GOOG_STUN_SERVER);
    }
    this.audio = {
      availableDevices: audioUtil.availableDevices,
      ringtoneDevices: audioUtil.ringtoneDevices,
      microphoneDevices: audioUtil.inputDevices,
      speakerDevices: audioUtil.outputDevices,
      revealAudioDevices: audioUtil.revealAudioDevices,
    };
    this.audioConstraints = this.options.audioConstraints as MediaTrackConstraints;
    this.owaLastDetect = { time: 0 as any, isOneWay: true };
    this.owaDetectTime = 3600000;
    this.statsSocket = null;
    this.timeTakenForStats = {};
    this.networkDisconnectedTimestamp = null;
    this.networkReconnectionTimestamp = null;
    this.deviceToggledInCurrentSession = false;
    this.networkChangeInCurrentSession = false;
    this.didFetchInitialNetworkInfo = false;
    this.enableNoiseReduction = this.options.enableNoiseReduction;
    audioUtil.setAudioContraints(this);
    documentUtil.setup(this, this.options);
    audioUtil.detectDeviceChange.call(this);
    this.audioDevDic = null;
    // this is done for backward compatiblity use this in audioDevice.js
    // and update when avaliable devices are updated.
    audioUtil.audioDevDicSetter((d: any) => {
      this.audioDevDic = d;
    });
    audioUtil.audioDevDictionary(true);

    // store this instance as window object
    window['_PlivoInstance' as any] = this as any;
    Plivo.log.info(
      `${C.LOGCAT.INIT} | PlivoWebSdk initialized in ${Plivo.log.level()} mode, version: PLIVO_LIB_VERSION , browser: ${this.browserDetails.browser}-${this.browserDetails.version}`,
    );
    this.jsFramework = detectFramework();
    setErrorCollector(this);
    if (process.env.PLIVO_ENV) {
      Plivo.log.debug(`${C.LOGCAT.INIT} | Starting the worker thread`);

      this.workerManager = new WorkerManager();
    }
  }

  private getUsernameFromToken = (parsedToken: string | any): string => {
    if (parsedToken.sub) {
      return `${parsedToken.sub}_${parsedToken.iss}`;
    }
    const randomTenDigitNumber = new Date().valueOf();
    return `puser${randomTenDigitNumber.toString()}jt_${parsedToken.iss}`;
  };

  private validateToken = (parsedToken: string | any): boolean => {
    if (parsedToken == null) {
      return false;
    }

    const {
      app = undefined,
      iss = undefined,
      sub = undefined,
      nbf = undefined,
      exp = undefined,
      per = undefined,
    } = parsedToken;

    // To do : Add the token validations [DONE]
    if (!iss || !nbf || !exp) {
      return false;
    }

    if ((app && typeof app !== "string") || (iss && typeof iss !== "string") || (sub && typeof sub !== "string") || (nbf && typeof nbf !== "number")
    || (exp && typeof exp !== "number") || (per && per.voice && per.voice.incoming_allow && typeof per.voice.incoming_allow !== "boolean")
    || (per && per.voice && per.voice.outgoing_allow && typeof per.voice.outgoing_allow !== "boolean")) {
      return false;
    }

    return true;
  };

  private parseJwtToken = (accessToken: string): any | null => {
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('')
        // eslint-disable-next-line prefer-template
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      Plivo.log.error(
        `${C.LOGCAT.LOGIN}| parsing of jwt failed ${err.message}`,
      );
      return null;
    }
  };

  private tokenLogin = (username: string, accessToken: string): boolean => {
    if (
      this.phone
      && this.phone.isRegistered()
      && this.phone.isConnected()
      && this.userName === username
      && !this.isAccessToken
    ) {
      Plivo.log.warn(
        `${C.LOGCAT.LOGIN} | Already registered with the endpoint provided - ${this.userName}`,
      );
      return true;
    }

    const account = new Account(this, username, " ", accessToken, this.options.registrationRefreshTimer ?? C.REGISTER_EXPIRES_SECONDS);
    const readyForLogin = () => {
      account.setupUserAccount();
    };
    const isValid = account.validate(() => {
      readyForLogin();
    });

    if (typeof isValid === 'boolean') {
      if (!isValid) {
        return false;
      }
      readyForLogin();
    }
    return true;
  };

  setExpiryTimeInEpoch = (timeInEpoch: number): void => {
    this.accessTokenExpiryInEpoch = timeInEpoch;
  };

  getTokenExpiryTimeInEpoch = (): number | null => this.accessTokenExpiryInEpoch;

  private _loginWithAccessTokenGenerator = (accessTokenObject: any): boolean => {
    // if Token Object itself is null, return;
    if (accessTokenObject == null) {
      Plivo.log.error(`${C.LOGCAT.LOGIN} | Login failed. Access token object can not be null`);
      // this.emit('onLoginFailedWithError',constants.ERRORS.get(10001));
      this.emit('onLoginFailed', 'INVALID_ACCESS_TOKEN');
      return false;
    }
    this.isAccessTokenGenerator = true;
    this.accessTokenObject = accessTokenObject;

    Plivo.log.info(`${C.LOGCAT.LOGIN} | Login initiated with Access Token Generator`);
    accessTokenObject.getAccessToken().then((accessToken) => {
      // If accessToken  is null
      if (accessToken == null) {
        // this.emit('onLoginFailedWithError',constants.ERRORS.get(10001));
        this.emit('onLoginFailed', 'INVALID_ACCESS_TOKEN');
        Plivo.log.error(`${C.LOGCAT.LOGIN} | Login failed. Access Token found null. Try to re-login with valid accessToken`);
        return false;
      }

      const parsedToken = this.parseJwtToken(accessToken);

      if (parsedToken != null) {
        const currentTimestamp = Math.floor((new Date()).getTime());
        const twentyFourHours = Math.floor((new Date()).getTime() + (3600 * 1000 * 24));
        const expiry = (parsedToken.exp != null) ? parsedToken.exp * 1000 : twentyFourHours;
        const timeout = (expiry - currentTimestamp) - (60 * 1000);
        setTimeout(() => {
          this.loginWithAccessTokenGenerator(accessTokenObject);
        }, Number(timeout));
      }
      if (this.isAccessToken) {
        if (this.phone != null && this._initJWTParams(accessToken)) {
          Plivo.log.debug("New token added : ", accessToken);
          this.phone.registrator().setExtraHeaders([
            `X-Plivo-Jwt: ${accessToken}`,
          ]);
        }
        return true;
      }
      return this.loginWithAccessToken(accessToken);
    }).catch((err: any) => {
      Plivo.log.error(`${C.LOGCAT.LOGIN} | Failed to fetch the accessToken. Try to re-login with valid accessToken`, err);
      // this.emit('onLoginFailedWithError',constants.ERRORS.get(10001));
      this.emit('onLoginFailed', 'INVALID_ACCESS_TOKEN');
      return false;
    });
    return true;
  };

  private _initJWTParams = (accessToken: string): boolean => {
    try {
      this.isLoginCalled = true;

      const parsedToken = this.parseJwtToken(accessToken);
      if (parsedToken && parsedToken.per && parsedToken.per.voice) {
        this.isOutgoingGrant = parsedToken.per.voice.outgoing_allow;
        this.isIncomingGrant = parsedToken.per.voice.incoming_allow;
      }
      const isTokenValid = this.validateToken(parsedToken);
      if (!isTokenValid) {
        this.emit('onLoginFailed', 'INVALID_ACCESS_TOKEN');
        Plivo.log.error(`${C.LOGCAT.LOGIN} | Login failed. Access Token found null. Try to re-login with valid accessToken`);
        return false;
      }

      Plivo.log.info(`${C.LOGCAT.LOGIN} | Parsed JWT with params:- `, JSON.stringify(parsedToken));
      this.userName = this.getUsernameFromToken(parsedToken);
      this.accessToken = accessToken;
      this.isAccessToken = true;
      return true;
    } catch (error) {
      return false;
    }
  };

  // private methods
  private _loginWithAccessToken = (accessToken: string): boolean => {
    try {
      if (this._initJWTParams(accessToken) && this.userName) {
        Plivo.log.info(C.LOGCAT.LOGIN, ` | Login initiated with AccessToken : ${accessToken}`);
        return this.tokenLogin(this.userName, accessToken);
      }
      Plivo.log.info(C.LOGCAT.LOGIN, 'Login failed : Invalid AccessToken');
      return false;
    } catch (error) {
      return false;
    }
  };

  //  private method to get error codes
  private _getErrorStringByErrorCodes = (errorCode: number) => {
    switch (errorCode) {
      case 10001: return 'INVALID_ACCESS_TOKEN';
      case 10002: return 'INVALID_ACCESS_TOKEN_HEADER';
      case 10003: return 'INVALID_ACCESS_TOKEN_ISSUER';
      case 10004: return 'INVALID_ACCESS_TOKEN_SUBJECT';
      case 10005: return 'ACCESS_TOKEN_NOT_VALID_YET';
      case 10006: return 'ACCESS_TOKEN_EXPIRED';
      case 10007: return 'INVALID_ACCESS_TOKEN_SIGNATURE';
      case 10008: return 'INVALID_ACCESS_TOKEN_GRANTS';
      case 10009: return 'EXPIRATION_EXCEEDS_MAX_ALLOWED_TIME';
      case 10010: return 'MAX_ALLOWED_LOGIN_REACHED';
      default: return 'Unauthorised';
    }
  };

  // private methods
  private _login = (username: string, password: string): boolean => {
    this.loggerUtil.setUserName(username);
    Plivo.log.info(
      `${C.LOGCAT.LOGIN} | Login initiated with Endpoint - ${username}`,
    );
    if (this.phone && (this.isConnecting() || (this.phone as any).isRegistering())) {
      Plivo.log.warn(
        `${C.LOGCAT.LOGIN} | Already ${this.isConnecting() ? 'connecting' : 'registering'}`,
      );
      return true;
    }
    if (
      this.phone
      && this.phone.isRegistered()
      && this.phone.isConnected()
      && this.userName === username
      && !this.isAccessToken
    ) {
      Plivo.log.warn(
        `${C.LOGCAT.LOGIN} | Already registered with the endpoint provided - ${this.userName}`,
      );
      return true;
    }

    this.isLoginCalled = true;
    const account = new Account(this, username, password, null,
      this.options.registrationRefreshTimer ?? C.REGISTER_EXPIRES_SECONDS);
    const readyForLogin = () => {
      account.setupUserAccount();
      if (this.browserDetails.browser === 'safari') {
        documentUtil.playAudio(C.SILENT_TONE_ELEMENT_ID);
      }
    };
    const isValid = account.validate(() => {
      readyForLogin();
    });
    if (typeof isValid === 'boolean') {
      if (!isValid) {
        return false;
      }
      readyForLogin();
    }
    return true;
  };

  clearOnLogout(): void {
    // Store.getInstance().clear();
    // if logout is called explicitly, make all the related flags to default
    if (this.isAccessToken) {
      this.isAccessToken = false;
      this.isOutgoingGrant = false;
      this.isIncomingGrant = false;
      this.accessToken = null;
    }

    // check if the any call session is active
    if (this.getCurrentSession() !== null) {
      // if the call session is established, terminate the session
      // else clear the variables holding the session details
      if (this.getCurrentSession()?.session.isEstablished()) {
        this.getCurrentSession()?.addConnectionStage(
          `logout()@${getCurrentTime(this)}`,
        );
        Plivo.log.debug(`${C.LOGCAT.LOGOUT} | Terminating an active call, before logging out`);
        this.getCurrentSession()?.session.terminate();
      } else {
        Plivo.log.debug(`${C.LOGCAT.LOGOUT} | Call Session exists, clearing the the session variables`);
        this._currentSession = null;
        this.lastIncomingCall = null;
      }
    }
    this.isLogoutCalled = true;
    this.noiseSuppresion.clearNoiseSupression();
    if (this.ringToneView && !this.ringToneView.paused) {
      documentUtil.stopAudio(C.RINGTONE_ELEMENT_ID);
    }
    if (this.ringBackToneView && !this.ringBackToneView.paused) {
      documentUtil.stopAudio(C.RINGBACK_ELEMENT_ID);
    }

    setConectionInfo(this, ConnectionState.DISCONNECTED, "Logout");
    this.connectionStatus = '';
    this.didFetchInitialNetworkInfo = false;
    if (this.phone && (this.phone.isRegistered() || this.isConnected())) {
      if (this.isConnected() && !this.isRegistered() && this.stopAutoRegisterOnConnect) {
        Plivo.log.debug(`${C.LOGCAT.LOGOUT} | Emitting onLogout when phone instance is connected but not registered`);
        this.userName = null;
        this.password = null;
        this.emit('onLogout');
      }
      Plivo.log.debug(`${C.LOGCAT.LOGOUT} | Stopping the UA and clearing the phone instance`);
      this.phone.stop();
      this.phone = null;
    }
    clearOptionsInterval(this);

    if (this.statsSocket) {
      this.statsSocket.disconnect();
      this.statsSocket = null;
    }
    Plivo.log.send(this);
  }

  private _logout = (): boolean => {
    if (!this.isLoggedIn && !this.isRegistered()) {
      if (this.isConnected()) {
        Plivo.log.debug(C.LOGCAT.LOGOUT, ' | SDK is not registered but connected. Disconnecting it.');
      } else {
        Plivo.log.debug(C.LOGCAT.LOGOUT, ' | Cannot execute logout: no active login session.', this.userName);
        return false;
      }
    }
    Plivo.log.debug(C.LOGCAT.LOGOUT, ' | Logout initiated!', this.userName);
    this.clearOnLogout();
    return true;
  };

  private _unregister = (): boolean => {
    if (this.phone && this.isRegistered()) {
      Plivo.log.debug(`${C.LOGCAT.LOGIN} | unregistering`);
      this.isLoggedIn = false;
      this.connectionStatus = 'unregistered';
      (this.phone as any)._registrator.close();
      return true;
    }
    Plivo.log.warn(`${C.LOGCAT.LOGIN} | cannot unregister. phone instance: ${this.phone !== null}, isRegistered: ${this.isRegistered()}`);
    return false;
  };

  private _disconnect = (): boolean => {
    if (this.phone && this.isConnected()) {
      Plivo.log.debug(`${C.LOGCAT.WS} | disconnecting`);
      (this.phone as any)._transport.disconnect(true);
      clearOptionsInterval(this);
      return true;
    }
    Plivo.log.warn(`${C.LOGCAT.WS} | cannot disconnect WS. phone instance: ${this.phone !== null}, isConnected: ${this.isConnected()}`);
    return false;
  };

  private _register = (extraHeaders?: Array<string>): boolean => {
    if (this.phone && (this.phone as any).registrator && this.isConnected()) {
      Plivo.log.debug(`${C.LOGCAT.LOGIN} | registering`);
      if (!this.isRegistered()
        || (this.isRegistered()
          && extraHeaders
          && extraHeaders?.length > 0)) {
        this.isLoginCalled = true;
        if (extraHeaders && extraHeaders instanceof Array && extraHeaders.length > 0) {
          Plivo.log.info(`${C.LOGCAT.LOGIN} | setting extraheaders before register ${JSON.stringify(extraHeaders)}`);
          (this.phone as any)._registrator.setExtraHeaders(extraHeaders);
        }
        (this.phone as any)._registrator.register();
        return true;
      }
      Plivo.log.warn(`${C.LOGCAT.LOGIN} | Already registed, cannot register again`);
      return false;
    }
    Plivo.log.warn(`${C.LOGCAT.LOGIN} | Not connected, cannot register`);
    return false;
  };

  private _call = (phoneNumber: string, extraHeaders: ExtraHeaders): boolean => {
    this.timeTakenForStats.pdd = {
      init: new Date().getTime(),
    };

    if (this.getCurrentSession() !== null || this.callSession) {
      Plivo.log.warn(`${C.LOGCAT.LOGIN} | Already on a call, cannot make another call`);
      return false;
    }

    if (!this.isLoggedIn && (this.phone === null
      || (this.phone
      && !this.phone.isConnected()
      && !this.phone.isRegistered()))) {
      Plivo.log.warn(`${C.LOGCAT.LOGIN} | Must be logged in before to make a call`);
      return false;
    }

    if (this.isAccessToken
      && (this.accessToken == null
      || this.accessToken === undefined
      || this?.isOutgoingGrant === false)
    ) {
      this.emit('onPermissionDenied', 'INVALID_ACCESS_TOKEN_GRANTS');
      Plivo.log.warn(`${C.LOGCAT.LOGIN} | Outgoing call permission not granted`);
      return false;
    }
    const readyForCall = () => {
      if (this.isAccessToken) extraHeaders['X-Plivo-Jwt'] = `${this.accessToken}`;

      this.owaLastDetect.isOneWay = false;
      return OutgoingCall.makeCall(this, extraHeaders, phoneNumber);
    };
    readyForCall();
    return true;
  };

  private _answer = (callUUID: string, actionOnOtherIncomingCalls: string): boolean => {
    const incomingCall = IncomingCall.getCurrentIncomingCall(callUUID, this);
    const isValid = IncomingCall.checkIncomingCallAction(
      actionOnOtherIncomingCalls,
    );
    if (incomingCall && isValid) {
      Plivo.log.debug(`answer - ${incomingCall.callUUID}`);
      incomingCall.addConnectionStage(`answer()@${new Date().getTime()}`);
      IncomingCall.answerIncomingCall(
        incomingCall,
        actionOnOtherIncomingCalls,
      );
    } else {
      Plivo.log.error(`${C.LOGCAT.LOGIN} | Incoming call answer() failed : no incoming call`);
      return false;
    }
    return true;
  };

  private _hangup = (): boolean => {
    if (this._currentSession) {
      this.loggerUtil.setSipCallID(this._currentSession.sipCallID ?? "");
      Plivo.log.debug(`hangup - ${this._currentSession.callUUID}`);
      if (
        this._currentSession.session
        && this._currentSession.session.direction !== 'outgoing'
        && !this._currentSession.session.isEstablished()
      ) {
        Plivo.log.warn(
          'use of hangup() on unanswered call is deprecated. use reject() instead',
        );
      }
      try {
        Plivo.log.debug(`${LOGCAT.CALL} | hangup initialized`);
        audioUtil.updateAudioDeviceFlags();
        if (Plivo.AppError) {
          Plivo.AppError.call(this, {
            name: 'hangup',
            message: 'hangup initialized',
            method: 'hangup()',
          });
        }
        if (this._currentSession.session && !this._currentSession.session.isEnded()) {
          this._currentSession.session.terminate();
        }

        if (this.ringBackToneView && !this.ringBackToneView.paused) {
          documentUtil.stopAudio(C.RINGBACK_ELEMENT_ID);
        }
      } catch (err) {
        Plivo.log.error(`${LOGCAT.CALL} | Could not hangup, Reason: `, err);
        if (Plivo.AppError && Plivo.sendEvents) {
          Plivo.AppError.call(this, {
            name: err.name,
            message: err.message,
            method: 'hangup()',
          });
          Plivo.sendEvents.call(
            this,
            {
              msg: 'ERROR_EVENT',
              name: err.name,
              info: err.message,
              method: 'hangup()',
            },
            this._currentSession,
          );
        }
      }
    } else {
      Plivo.log.warn(`${LOGCAT.CALL} | No call session exists to hangup`);
      return false;
    }
    return true;
  };

  private _redirect = (
    contactUri: string | null,
  ): boolean => {
    if (contactUri && this.lastIncomingCall) {
      Plivo.log.debug(`${LOGCAT.CALL} | redirecting to contactUri ${contactUri}`);

      const contactData = contactUri.split('&');
      const uri = contactData[0];
      const registrarIP = contactData[1];
      this.lastIncomingCall.setState(this.lastIncomingCall.STATE.REDIRECTED);
      Plivo.log.debug(`${LOGCAT.CALL} | removing all the listeners on the current session before redirecting`);
      (this.lastIncomingCall.session as any).removeAllListeners();
      this.lastIncomingCall.session.refer(uri, {
        extraHeaders: [
          `X-PlivoUpdatedRegContact: ${uri}`,
          `X-PlivoRegistrarIP: ${registrarIP}`,
          `Contact: ${uri}`,
        ],
      });
      if (this.statsSocket) {
        this.statsSocket.disconnect();
        this.statsSocket = null;
      }
      audioUtil.stopVolumeDataStreaming();
      IncomingCall.stopRingtone();
      Plivo.log.debug(`${LOGCAT.CALL} | clearing required session info on call redirect`);
      hangupClearance.call(this, this.lastIncomingCall, true);
    } else {
      Plivo.log.warn(`${LOGCAT.CALL} | Cannot redirect. Either no call session exists to redirect or contact uri is null`);
      return false;
    }
    return true;
  };

  private _reject = (callUUID: string): boolean => {
    const incomingCall = IncomingCall.getCurrentIncomingCall(callUUID, this);
    if (!incomingCall) {
      Plivo.log.warn(`${LOGCAT.CALL} | No call session exists to reject()`);
      return false;
    }
    this.loggerUtil.setSipCallID(incomingCall.sipCallID ?? "");
    Plivo.log.debug(`${LOGCAT.CALL} | reject - ${incomingCall.callUUID}`);
    if (incomingCall.session && incomingCall.session.isEstablished()) {
      Plivo.log.warn(`${LOGCAT.CALL} | Call already answered, please use hangup() method`);
      return false;
    }
    if (incomingCall) {
      const opts = {
        status_code: 486,
        reason_phrase: 'Busy Here',
      };
      Plivo.log.info('rejecting call');
      if (Plivo.AppError) {
        Plivo.AppError.call(this, {
          name: 'reject',
          message: 'reject initialized',
          method: 'reject()',
        });
      }
      try {
        incomingCall.session.terminate(opts);
        this.incomingInvites.delete(incomingCall.callUUID as string);
      } catch (err) {
        Plivo.log.error('error in rejecting call : ', err);
        if (Plivo.AppError && Plivo.sendEvents) {
          Plivo.AppError.call(this, {
            name: err.name,
            message: err.message,
            method: 'reject()',
          });
          Plivo.sendEvents.call(
            this,
            {
              msg: 'ERROR_EVENT',
              name: err.name,
              info: err.message,
              method: 'reject()',
            },
            incomingCall,
          );
        }
      }
      // if no more incoming calls, then stop the audio
      if (!this.incomingInvites.size) {
        if (this.ringToneView && !this.ringToneView.paused) {
          documentUtil.stopAudio(C.RINGTONE_ELEMENT_ID);
        }
      }
    }
    return true;
  };

  private _ignore = (callUUID: string): boolean => {
    const incomingCall = IncomingCall.getCurrentIncomingCall(callUUID, this);
    if (incomingCall) {
      this.loggerUtil.setSipCallID(incomingCall.sipCallID ?? "");
      Plivo.log.debug(`ignore - ${incomingCall.callUUID}`);
      (incomingCall.session as any).removeAllListeners();
      this.incomingInvites.delete(incomingCall.callUUID as string);
      if (!this.incomingInvites.size) {
        if (this.ringToneView && !this.ringToneView.paused) {
          documentUtil.stopAudio(C.RINGTONE_ELEMENT_ID);
        }
      }
      // update state and clear session
      IncomingCall.handleIgnoreState(incomingCall);
      Plivo.log.debug(`${C.LOGCAT.CALL} | On incoming call ignored`, incomingCall.getCallInfo("local", "none", "Ignored", LOCAL_ERROR_CODES.Ignored));
      this.emit('onIncomingCallIgnored', incomingCall.getCallInfo("local", "none", "Ignored", LOCAL_ERROR_CODES.Ignored));
      return true;
    }
    Plivo.log.warn('No incoming calls to ignore');
    this.shouldMuteCall = false;
    return false;
  };

  private _setIdentifier = (identifier: string): boolean => {
    if (identifier && typeof identifier === 'string' && identifier !== '') {
      Plivo.log.info(`${C.LOGCAT.INIT} | changing identifier from ${this.identifier} to ${identifier}`);
      this.identifier = identifier;
      this.loggerUtil.setIdentifier(identifier);
      return true;
    }
    Plivo.log.warn(`${C.LOGCAT.INIT} | Identifier should be a non empty string`);
    return false;
  };

  private _sendDtmf = (digit: number | string): void => {
    if (!navigator.onLine) {
      return Plivo.log.warn(`${C.LOGCAT.CALL} | Unable to send DTMF: No internet connection`);
    }
    const dtmfFlags = C.DTMF_TONE_FLAG as any;
    if (typeof digit === 'undefined' || digit == null) {
      return Plivo.log.warn(`${C.LOGCAT.CALL} | DTMF digit can not be null`);
    }
    if (typeof dtmfFlags[digit] === 'undefined') {
      return Plivo.log.warn(`${digit} is not a valid DTMF digit`);
    }
    if (this._currentSession) {
      Plivo.log.debug(`sendDtmf - ${this._currentSession.callUUID}`);
      try {
        Plivo.log.debug(`${C.LOGCAT.CALL} | DTMF send ${digit}`);
        const dtmfOption = documentUtil.getDTMFOption(this.options.dtmfOptions);
        if (dtmfOption !== 'INBAND') {
          this._currentSession.session.sendDTMF(digit);
          Plivo.log.info(`sent outband dtmf`);
        }
        if (digit === '*') {
          return documentUtil.playAudio('dtmfstar', this);
        }
        if (digit === '#') {
          return documentUtil.playAudio('dtmfpound', this);
        }
        return documentUtil.playAudio(`dtmf${digit}`, this);
      } catch (err) {
        Plivo.log.error(`${C.LOGCAT.CALL} | Call has not been confirmed cannot send DTMF`);
        if (Plivo.AppError) {
          Plivo.AppError.call(this, {
            name: err.name,
            message: err.message,
            method: 'sendDtmf()',
          });
        }
        return Plivo.sendEvents?.call(
          this,
          {
            msg: 'ERROR_EVENT',
            name: err.name,
            info: err.message,
            method: 'sendDtmf()',
          },
          this._currentSession,
        );
      }
    } else {
      return Plivo.log.warn('No call session exists to send DTMF');
    }
  };

  private _mute = (): boolean => {
    if (this._currentSession) {
      Plivo.log.debug(`${C.LOGCAT.CALL} | mute method is called`);
      try {
        this.isMuteCalled = true;
        audioUtil.mute.call(this);
        this.isCallMuted = true;
        if (this.callStats) {
          this.callStats.sendFabricEvent(
            this._currentSession.session.connection,
            this.callStats.fabricEvent.audioMute,
            this._currentSession.callUUID,
          );
        }
        nonRTPStats.onToggleMute.call(this, this._currentSession, 'mute');
      } catch (err) {
        Plivo.log.error(`${C.LOGCAT.CALL} | error in mute :`, err.message);
        Plivo.AppError?.call(this, {
          name: err.name,
          message: err.message,
          method: 'mute()',
        });
        Plivo.sendEvents?.call(
          this,
          {
            msg: 'ERROR_EVENT',
            name: err.name,
            info: err.message,
            method: 'mute()',
          },
          this._currentSession,
        );
      }
    } else {
      Plivo.log.warn(`${C.LOGCAT.CALL} | No call session exists to mute`);
      // value will be changed to true if user tries to mute call before session creation
      this.shouldMuteCall = true;
      return false;
    }
    return true;
  };

  private _unmute = (): boolean => {
    if (this._currentSession) {
      Plivo.log.debug(`${C.LOGCAT.CALL} | unmute method is called`);
      this.shouldMuteCall = false;
      try {
        this.isMuteCalled = false;
        audioUtil.unmute.call(this);
        this.isCallMuted = false;
        if (this.callStats) {
          this.callStats.sendFabricEvent(
            this._currentSession.session.connection,
            this.callStats.fabricEvent.audioUnmute,
            this._currentSession.callUUID,
          );
        }
        nonRTPStats.onToggleMute.call(this, this._currentSession, 'unmute');
      } catch (err) {
        Plivo.log.error(`${C.LOGCAT.CALL} | error in unmute : `, err.message);
        Plivo.AppError?.call(this, {
          name: err.name,
          message: err.message,
          method: 'unmute()',
        });
        Plivo.sendEvents?.call(
          this,
          {
            msg: 'ERROR_EVENT',
            name: err.name,
            info: err.message,
            method: 'unmute()',
          },
          this._currentSession,
        );
      }
    } else {
      Plivo.log.warn(`${C.LOGCAT.CALL} | No call session exists to unmute`);
      return false;
    }
    return true;
  };

  private _setRingTone = (val: string | boolean): boolean => {
    Plivo.log.debug(`${C.LOGCAT.INIT}| setting ringtone`);
    if (val === false || val === null) {
      this.ringToneFlag = false;
    } else if (typeof val === 'string') {
      this.ringToneFlag = true;
      Plivo.log.debug(`setRingTone() url : ${val}`);
      if (this.ringToneView) {
        this.ringToneView.src = val;
      }
    } else {
      this.ringToneFlag = true;
    }
    return true;
  };

  private _setRingToneBack = (val: string | boolean): boolean => {
    Plivo.log.debug(`${C.LOGCAT.INIT}| setting ringtoneback`);
    if (val === false || val === null) {
      this.ringToneBackFlag = false;
    } else if (typeof val === 'string') {
      this.ringToneBackFlag = true;
      Plivo.log.debug(`setRingToneBack() url : ${val}`);
      if (this.ringBackToneView) {
        this.ringBackToneView.src = val;
      }
    } else {
      this.ringToneBackFlag = true;
    }
    return true;
  };

  private _setConnectTone = (val: boolean): boolean => {
    Plivo.log.debug(`${C.LOGCAT.INIT}| setting connect tone`);
    if (!val) {
      this.connectToneFlag = false;
    } else {
      this.connectToneFlag = true;
    }
    return true;
  };

  private _setDtmfTone = (digit: string, url: string | boolean): boolean => {
    Plivo.log.debug(`${C.LOGCAT.CALL}| setting dtmf tone`);
    const dtmfFlag = C.DTMF_TONE_FLAG as any;
    if (url === false || url === null) {
      dtmfFlag[digit] = false;
    } else if (typeof url === 'string') {
      Plivo.log.debug('set dtmf tone');
      dtmfFlag[digit] = 'user';
      const elementName = `dtmf${digit}`;
      const element = document.getElementById(elementName) as HTMLAudioElement;

      element.src = url;
    } else {
      dtmfFlag[digit] = true;
    }
    return true;
  };

  private _getCallUUID = (): string | null => {
    if (this._currentSession) {
      return this._currentSession.callUUID;
    }
    return null;
  };

  private _isRegistered = (): boolean | null => this.isLoggedIn
  && this.phone && this.phone.isRegistered();

  private _isConnecting = (): boolean | null => this.phone
  && (this.phone as any)._transport.isConnecting();

  private _isConnected = (): boolean | null => this.phone && this.phone.isConnected();

  private _getContactUri = (): string | null => {
    if (this.contactUri
      && (typeof this.contactUri.name === 'string' && this.contactUri.name !== '')
      && (typeof this.contactUri.ip === 'string' && this.contactUri.ip !== '')
      && (typeof this.contactUri.port === 'number' && this.contactUri.port !== '')
      && (typeof this.contactUri.registrarIP === 'string' && this.contactUri.registrarIP !== '')
      && (typeof this.contactUri.protocol === 'string' && this.contactUri.protocol !== '')) {
      const contactUriString = `sip:${this.contactUri.name}@${this.contactUri.ip}:${this.contactUri.port};${this.contactUri.protocol}&${this.contactUri.registrarIP}`;
      Plivo.log.debug(`${C.LOGCAT.CALL} | generated contact URI string: ${contactUriString}`);
      return contactUriString;
    }
    Plivo.log.info(`${C.LOGCAT.CALL} | Contact URI string could not be generated ${JSON.stringify(this.contactUri)}`);
    return null;
  };

  private _getCurrentSession = (
  ): CallSession | null => this._currentSession
  || this.lastIncomingCall;

  private _startNoiseReduction = (): Promise<boolean> => new Promise((resolve) => {
    if (!this.enableNoiseReduction) {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction cannot be started since "enableNoiseReduction" is set to false`);
      resolve(false);
    } else if (!this.noiseSuppresion) {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction cannot be started since noise reduction is not instantiated`);

      resolve(false);
    } else if (this.browserDetails.browser === 'safari') {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction feature is not supported in safari browser`);

      resolve(false);
    } else {
      this.noiseSuppresion.startNoiseSuppresionManual().then(() => {
        Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Reduction started`);
        resolve(true);
      }).catch((err) => {
        Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Reduction start failed with error:- ${err.message}`);
        resolve(false);
      });
    }
  });

  private _stopNoiseReduction = (): Promise<boolean> => new Promise((resolve) => {
    if (!this.enableNoiseReduction) {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction cannot be stopped since "enableNoiseReduction" is set to false`);
      resolve(false);
    } else if (!this.noiseSuppresion) {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction cannot be stopped since noise reduction is not instantiated`);
      resolve(false);
    } else if (this.browserDetails.browser === 'safari') {
      Plivo.log.warn(`${C.LOGCAT.CALL_QUALITY} | Noise reduction feature is not supported in safari browser`);

      resolve(false);
    } else {
      this.noiseSuppresion.stopNoiseSuppressionManual().then(() => {
        Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Reduction stopped`);
        resolve(true);
      }).catch((err) => {
        Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Reduction stop failed with error:- ${err.message}`);
        resolve(false);
      });
    }
  });

  private _getLastCallUUID = (): string | null => {
    if (this._lastCallSession) {
      return this._lastCallSession.callUUID;
    }
    return null;
  };

  private _getIncomingCalls = (): any[] => {
    const incomingCalls: any[] = [];
    this.incomingInvites.forEach((a) => {
      incomingCalls.push(a.getCallInfo());
    });
    return incomingCalls;
  };

  private _setDebug = (debug: AvailableLogMethods): void => {
    if (
      debug
      && ['INFO', 'DEBUG', 'WARN', 'ERROR', 'ALL', 'OFF'].indexOf(debug) !== -1
    ) {
      Plivo.log.setLevel(debug);
    }
  };

  private _getPeerConnection = (): { status: string; pc: any } => {
    if (
      this._currentSession
      && this._currentSession.session
      && this._currentSession.session.connection
    ) {
      return { status: 'success', pc: this._currentSession.session.connection };
    }
    return { status: 'called in wrong state', pc: null };
  };

  private _submitCallQualityFeedback = (
    callUUID: string,
    starRating: string,
    issues: string[],
    note: string,
    sendConsoleLogs: boolean,
  ): Promise<string> => new Promise((resolve, reject) => {
    // validate feedback parameters
    validateFeedback(callUUID, starRating, note, issues, this.userName as string, this.isLoggedIn)
      .then((feedback: FeedbackObject) => {
        // send Feedback to CallStats.io
        if (this.callStats) {
          this.callStats.sendUserFeedback(
            callUUID,
            feedback,
            (message: string) => {
              Plivo.log.debug(`Feedback stats sent status: ${message}`);
            },
          );
        }
        // send Feedback to Plivo stats
        let session;
        if (
          this._currentSession
          && this._currentSession.callUUID === callUUID
        ) {
          session = this._currentSession;
        } else if (
          this._lastCallSession
          && this._lastCallSession.callUUID === callUUID
        ) {
          session = this._lastCallSession;
        }
        if (session) {
          Plivo.log.send(this);
          if (this.statsSocket) {
            nonRTPStats.sendFeedbackEvent.call(this, session, feedback);
          } else {
            this.statsSocket = new StatsSocket();
            this.statsSocket.connect();
            nonRTPStats.sendFeedbackEvent.call(this, session, feedback);
          }
        }
        // send console logs
        if (sendConsoleLogs === true) {
          let preSignedUrlBody: PreSignedUrlRequest | any;
          if (this.isAccessToken) {
            preSignedUrlBody = {
              username: this.userName as string,
              accessToken: this.accessToken,
              calluuid: callUUID,
            };
          } else {
            preSignedUrlBody = {
              username: this.userName as string,
              password: this.password as string,
              domain: C.DOMAIN,
              calluuid: callUUID,
            };
          }
          getPreSignedS3URL(preSignedUrlBody, this.isAccessToken)
            .then((responseBody: PreSignedUrlResponse) => {
              uploadConsoleLogsToBucket(responseBody, feedback)
                .then(() => {
                  resolve('Feedback is sent with console logs');
                }).catch((err) => {
                  reject(err);
                });
            }).catch((err) => {
              Plivo.log.error('Feedback was not able to send console logs');
              reject(err);
            });
        } else {
          resolve('Feedback is sent');
        }
      })
      .catch((error: any) => {
        Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | SubmitCallQualityFeedback failed:- ${error}`);
        reject(error);
      });
  });
}

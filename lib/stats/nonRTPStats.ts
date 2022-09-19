/* eslint-disable no-underscore-dangle */
/* eslint func-names: ["error", "as-needed"] */
/* eslint-disable import/no-cycle */
import { SemverParserVersion } from '../utils/device';
import pkg from '../../package.json';
import * as device from '../utils/device';
import { Logger } from '../logger';
import { CallSession, SignallingInfo, MediaConnectionInformation } from '../managers/callSession';
import { Client, ConfiguationOptions } from '../client';
import * as C from '../constants';
import { FeedbackObject } from '../utils/feedback';
import getBrowserDetails from '../utils/browserDetection';

export interface AnsweredEvent{
  msg: string;
  info: string;
  clientName: any;
  userAgent: string;
  clientVersionMajor: any;
  clientVersionMinor: any;
  clientVersionPatch: any;
  sdkName: string;
  sdkVersionMajor: number;
  sdkVersionMinor: number;
  sdkVersionPatch: number;
  devicePlatform: string;
  deviceOs: string;
  setupOptions: ConfiguationOptions;
  audioDeviceInfo?: DeviceAudioInfo
}

export interface DeviceAudioInfo {
  noOfAudioInput: number;
  noOfAudioOutput: number;
  audioInputLables: string;
  audioOutputLables: string;
  audioInputGroupIds: string;
  audioOutputGroupIds: string;
  audioInputIdSet: string;
  audioOutputIdSet: string;
  activeInputAudioDevice: string;
  activeOutputAudioDevice: string;
}

export interface RingingEvent {
  msg: string;
  userAgent: string;
  clientVersionMajor: string;
  clientVersionMinor: string;
  clientVersionPatch: string;
  sdkName: string;
  sdkVersionMajor: number;
  sdkVersionMinor: number;
  sdkVersionPatch: number;
  clientName: string;
  devicePlatform: string;
  deviceOs: string;
  setupOptions: ConfiguationOptions;
  signalling?: any;
  mediaConnection?: any;
  audioDeviceInfo?: DeviceAudioInfo;
  isAudioDeviceToggled?: boolean;
  isNetworkChanged?: boolean;
  jsFramework: string[];

}

export interface SummaryEvent {
  msg: string;
  userAgent: string;
  clientVersionMajor: string;
  clientVersionMinor: string;
  clientVersionPatch: string;
  sdkName: string;
  sdkVersionMajor: number;
  sdkVersionMinor: number;
  sdkVersionPatch: number;
  clientName: string;
  devicePlatform: string;
  deviceOs: string;
  setupOptions: ConfiguationOptions;
  signalling?: any;
  mediaConnection?: any;
  audioDeviceInfo?: DeviceAudioInfo;
  isAudioDeviceToggled?: boolean;
  isNetworkChanged?: boolean;
  jsFramework: string[];

}

interface CallInfoEvent {
  msg: string;
  error?: string;
  callstats_key?: string;
  callUUID?: string;
  corelationId?: string;
  xcallUUID?: string;
  timeStamp?: number;
  userName?: string;
  domain?: string;
  source?: string;
  version?: string;
  action?: string;
  info?: any;
  sdkVersion?: string;
}

const Plivo = { log: Logger };

/**
 * Add call related information to call answered/summary stat.
 * @param {CallSession} callSession - call information
 * @param {Any} statMsg - call stats (Answered/RTP/Summary/Feedback/Failure Events)
 * @param {String} callstatskey - UUID which is not null when callstats permission is present
 * @param {String} userName
 * @returns Stat message with call information
 */
export const addCallInfo = function (
  callSession: CallSession, statMsg: any, callstatskey: string, userName: string,
): object {
  const obj = statMsg;
  obj.callstats_key = callstatskey;
  obj.callUUID = callSession.sipCallID;
  obj.corelationId = callSession.sipCallID;
  obj.xcallUUID = callSession.callUUID;
  obj.timeStamp = Date.now();
  obj.userName = userName;
  obj.domain = C.DOMAIN;
  obj.source = C.STATS_SOURCE;
  obj.version = C.STATS_VERSION;
  return obj;
};

/**
 * Send events to plivo stats.
 * @param {Any} statMsg - call stats (Answered/RTP/Summary/Feedback/Failure Events)
 * @param {CallSession} session - call session information
 */
export const sendEvents = function (statMsg: any, session: CallSession): void {
  const client: Client = this;
  if (
    client.statsSocket
    && client.callstatskey
    && session
    && session.sipCallID
  ) {
    const obj = addCallInfo(session, statMsg, client.callstatskey, client.userName as string);
    client.statsSocket.send(obj, client);
    // To do : Initiate unregister incase when call gets extended after token expiry
    if (client.isUnregisterPending === true) {
      client.isUnregisterPending = false;
      if (client.phone) {
        client.phone.stop();
      }
      client.deferFeedback = true;
      // close Stats Socket
      client.statsSocket.disconnect();
      client.statsSocket = null;
    }

    //  logout if logged in by token and token get expired
    if (statMsg.msg === "CALL_SUMMARY" && client.isAccessToken && !client.isLoggedIn) {
      client.emit('onLogout', 'ACCESS_TOKEN_EXPIRED');
      client.logout();
    }
  } else {
    Plivo.log.debug(
      'Cannot send Event ',
      statMsg,
      ' mandatory parameters (statsSocket, sipCallID, callstatskey) not defined ',
    );
  }
};

/**
 * Report errors to callstats.io.
 * @param {Any} err - Error(call failures) stat
 * @param {Any} log - option to log error in browser console
 */
export const AppError = function (err: any, log: any): boolean {
  const client: Client = this;
  if (client.userName && client.callStats) {
    const callUUID = client._currentSession
      ? client._currentSession.callUUID
      : null;
    const conferenceId = callUUID || client.userName;
    if (Object.prototype.toString.call(err) === '[object Object]') {
      // eslint-disable-next-line no-param-reassign
      err = JSON.stringify(err);
    }
    if (log) {
      Plivo.log.debug(`Call summary ${conferenceId}\n`, err);
    }
    client.callStats.reportError(
      null,
      conferenceId,
      client.callStats.webRTCFunctions.applicationLog,
      err,
    );
  }
  return true;
};

/**
 * Send call answered event to Plivo stats.
 * @param {DeviceAudioInfo} deviceInfo - input and output audio device information
 * @param {Boolean} isIncoming - check if it is a incoming call
 */
export const sendCallAnsweredEvent = function (
  deviceInfo: DeviceAudioInfo,
  isIncoming: boolean,
): void {
  const client: Client = this;
  if (!client.callstatskey) {
    return;
  }
  const clientVersionParse = device.getClientVersion() as SemverParserVersion;
  const sdkVersionParse = device.getSDKVersion();
  const deviceOs = device.getOS();
  const answerEvent: AnsweredEvent = {
    msg: 'CALL_ANSWERED',
    info: 'Outgoing call answered',
    clientName: getBrowserDetails().browser,
    userAgent: navigator.userAgent,
    clientVersionMajor:
      clientVersionParse.major || clientVersionParse[0] || '0',
    clientVersionMinor:
      clientVersionParse.minor || clientVersionParse[1] || '0',
    clientVersionPatch:
      clientVersionParse.patch || clientVersionParse[2] || '0',
    sdkName: pkg.name,
    sdkVersionMajor: sdkVersionParse.major,
    sdkVersionMinor: sdkVersionParse.minor,
    sdkVersionPatch: sdkVersionParse.patch,
    devicePlatform: navigator.platform,
    deviceOs,
    setupOptions: client.options,
  };
  if (deviceInfo) {
    answerEvent.audioDeviceInfo = deviceInfo;
  }
  if (isIncoming) {
    answerEvent.info = 'Incoming call answered';
  }
  sendEvents.call(client, answerEvent, client._currentSession);
};

/**
 * Send call summary event to Plivo stats.
 * @param {DeviceAudioInfo} deviceInfo - input and output audio device information
 * @param {SignallingInfo} signallingInfo - holds timestamp for each state of call
 * @param {MediaConnectionInfo} mediaConnectionInfo - media connection information
 * @param {CallSession} session - call session information
 */
export const sendCallSummaryEvent = function (
  deviceInfo: DeviceAudioInfo,
  signallingInfo: SignallingInfo,
  mediaConnectionInfo: MediaConnectionInformation,
  session: CallSession,
): void {
  const client: Client = this;
  if (!client.callstatskey) {
    return;
  }
  const clientVersionParse = device.getClientVersion() as SemverParserVersion;
  const sdkVersionParse = device.getSDKVersion();
  const deviceOs = device.getOS();
  const summaryEvent: SummaryEvent = {
    msg: 'CALL_SUMMARY',
    signalling: signallingInfo,
    mediaConnection: mediaConnectionInfo,
    clientName: getBrowserDetails().browser,
    userAgent: navigator.userAgent,
    clientVersionMajor:
      clientVersionParse.major || clientVersionParse[0] || '0',
    clientVersionMinor:
      clientVersionParse.minor || clientVersionParse[1] || '0',
    clientVersionPatch:
      clientVersionParse.patch || clientVersionParse[2] || '0',
    sdkName: pkg.name,
    sdkVersionMajor: sdkVersionParse.major,
    sdkVersionMinor: sdkVersionParse.minor,
    sdkVersionPatch: sdkVersionParse.patch,
    devicePlatform: navigator.platform,
    deviceOs,
    setupOptions: client.options,
    isAudioDeviceToggled: client.deviceToggledInCurrentSession,
    isNetworkChanged: client.networkChangeInCurrentSession,
    jsFramework: client.jsFramework,
  };
  if (deviceInfo) {
    summaryEvent.audioDeviceInfo = deviceInfo;
  }
  sendEvents.call(client, summaryEvent, session);
};

export const sendCallRingingEvent = function (
  deviceInfo: DeviceAudioInfo,
  signallingInfo: SignallingInfo,
  mediaConnectionInfo: MediaConnectionInformation,
  session: CallSession,
): void {
  const client: Client = this;
  if (!client.callstatskey) {
    return;
  }
  const clientVersionParse = device.getClientVersion() as SemverParserVersion;
  const sdkVersionParse = device.getSDKVersion();
  const deviceOs = device.getOS();
  const ringingEvent: RingingEvent = {
    msg: 'CALL_RINGING',
    signalling: signallingInfo,
    mediaConnection: mediaConnectionInfo,
    clientName: getBrowserDetails().browser,
    userAgent: navigator.userAgent,
    clientVersionMajor:
      clientVersionParse.major || clientVersionParse[0] || '0',
    clientVersionMinor:
      clientVersionParse.minor || clientVersionParse[1] || '0',
    clientVersionPatch:
      clientVersionParse.patch || clientVersionParse[2] || '0',
    sdkName: pkg.name,
    sdkVersionMajor: sdkVersionParse.major,
    sdkVersionMinor: sdkVersionParse.minor,
    sdkVersionPatch: sdkVersionParse.patch,
    devicePlatform: navigator.platform,
    deviceOs,
    setupOptions: client.options,
    isAudioDeviceToggled: client.deviceToggledInCurrentSession,
    isNetworkChanged: client.networkChangeInCurrentSession,
    jsFramework: client.jsFramework,
  };
  if (deviceInfo) {
    ringingEvent.audioDeviceInfo = deviceInfo;
  }
  sendEvents.call(client, ringingEvent, session);
};

/**
   * Send user feedback to plivo stats.
   * @param {CallSession} callSession - call information
   * @param {FeedbackObject} feedback - user feedback(contains score, issues, remarks)
   */
export const sendFeedbackEvent = function (
  callSession: CallSession, feedback: FeedbackObject,
): void {
  const client: Client = this;
  if (callSession.callUUID && client.callstatskey) {
    const obj: CallInfoEvent = { msg: 'FEEDBACK', info: feedback };
    obj.sdkVersion = pkg.version;
    sendEvents.call(client, obj, callSession);
  }
};

/**
   * Get error name based on code.
   * @param {Number} status_code
   * @return SIP error message
   */
export const signallingEvent = function (status_code: number): string {
  return C.SIP_ERROR_CODE[status_code];
};

/**
   * Triggered when ice connection failure happens.
   * @param {CallSession} callSession - call session information
   * @param {Error} error
   */
export const onIceFailure = function (callSession: CallSession, error: Error): void {
  const client: Client = this;
  if (callSession.callUUID && client.callstatskey) {
    const obj: CallInfoEvent = { msg: 'ICE_FAILURE', error: error.message };
    sendEvents.call(client, obj, callSession);
  }
};

/**
   * Triggered when media connection failure happens.
   * @param {CallSession} callSession - call session information
   * @param {Error} error
   */
export const onMediaFailure = function (callSession: CallSession, error: Error): void {
  const client: Client = this;
  if (callSession.callUUID && client.callstatskey) {
    const obj: CallInfoEvent = { msg: 'MEDIA_FAILURE', error: error.message };
    sendEvents.call(client, obj, callSession);
  }
};

/**
   * Triggered when sdp creation failure happens.
   * @param {CallSession} callSession - call session information
   * @param {Error} error
   */
export const onSDPfailure = function (callSession: CallSession, error: Error): void {
  const client: Client = this;
  if (callSession.callUUID && client.callstatskey) {
    const obj: CallInfoEvent = { msg: 'SDP_FAILURE', error: error.message };
    sendEvents.call(client, obj, callSession);
  }
};

/**
   * Triggered when audio is muted or unmuted.
   * @param {CallSession} callSession - call session information
   * @param {String} action
   */
export const onToggleMute = function (callSession: CallSession, action: string): void {
  const client: Client = this;
  if (client.callstatskey) {
    const obj: CallInfoEvent = { msg: 'TOGGLE_MUTE', action };
    sendEvents.call(client, obj, callSession);
  }
};

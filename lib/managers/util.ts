/* eslint-disable no-useless-escape */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { SessionProgressEvent, SessionFailedEvent, RTCSession } from 'plivo-jssip';
import { name } from '../../package.json';
import {
  getClientVersion,
  getSDKVersion,
  getOS,
  SemverParserVersion,
} from '../utils/device';
import {
  sendEvents,
  AppError,
  sendCallSummaryEvent,
  SummaryEvent,
} from '../stats/nonRTPStats';
import { emitMetrics as _emitMetrics } from '../stats/mediaMetrics';
import { GetRTPStats } from '../stats/rtpStats';
import {
  getAudioDevicesInfo, isElectronApp, resetMuteOnHangup, updateAudioDeviceFlags,
} from '../media/audioDevice';
import { Logger } from '../logger';
import { Client } from '../client';
import { CallSession } from './callSession';
import {
  STATS_ANALYSIS_WAIT_TIME, DEFAULT_MDNS_CANDIDATE, LOGCAT, LOCAL_ERROR_CODES,
} from '../constants';
import getBrowserDetails from '../utils/browserDetection';

const Plivo = {
  log: Logger,
  sendEvents,
  AppError,
  emitMetrics: _emitMetrics,
};

/**
 * Prepare summary event when browser tab is about to close
 * @returns Summary event
 */
const getSummaryEvent = async function (client: Client): Promise<SummaryEvent> {
  const clientVersionParse = getClientVersion();
  const sdkVersionParse = getSDKVersion();
  const deviceOs = getOS();
  const summaryEvent: SummaryEvent = {
    msg: 'CALL_SUMMARY',
    userAgent: navigator.userAgent,
    clientVersionMajor:
      (clientVersionParse as SemverParserVersion).major
      || clientVersionParse[0]
      || '0',
    clientVersionMinor:
      (clientVersionParse as SemverParserVersion).minor
      || clientVersionParse[1]
      || '0',
    clientVersionPatch:
      (clientVersionParse as SemverParserVersion).patch
      || clientVersionParse[2]
      || '0',
    sdkName: name,
    sdkVersionMajor: sdkVersionParse.major,
    sdkVersionMinor: sdkVersionParse.minor,
    sdkVersionPatch: sdkVersionParse.patch,
    clientName: getBrowserDetails().browser,
    devicePlatform: navigator.platform,
    deviceOs,
    setupOptions: client.options,
    noiseReduction: {
      enabled: client.enableNoiseReduction ?? false,
      noiseSuprressionStarted: client.noiseSuppresion.started,
    },
    isAudioDeviceToggled: client.deviceToggledInCurrentSession,
    isNetworkChanged: client.networkChangeInCurrentSession,
    jsFramework: client.jsFramework,

  };
  if (client._currentSession) {
    summaryEvent.signalling = client._currentSession.signallingInfo;
  }
  const deviceInfo = await getAudioDevicesInfo.call(client);
  if (deviceInfo) {
    summaryEvent.audioDeviceInfo = deviceInfo;
  }
  return summaryEvent;
};

/**
 * Prepare summary event when browser tab is about to close
 * @returns Summary event
 */
export const setErrorCollector = () => {
  window.onerror = (message) => {
    Plivo.log.error(`${LOGCAT.CRASH} | ${message} |`, new Error().stack);
  };
};

/**
 * Check for closeProtection option and show a
 * dialog prompt when closing a page which has an active connection
 */
export const addCloseProtectionListeners = function (): void {
  const client: Client = this;
  getSummaryEvent(client).then((summaryEvent) => {
    if (client.options.closeProtection) {
      window.onbeforeunload = (event: BeforeUnloadEvent) => {
        Plivo.sendEvents.call(client, summaryEvent, client._currentSession);
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = '';
      };
    } else {
      window.onbeforeunload = () => {
        Plivo.sendEvents.call(client, summaryEvent, client._currentSession);
        if (client._currentSession) {
          client._currentSession.session.terminate();
        }
      };
    }
    window.onunload = () => {
      if (client._currentSession) {
        client._currentSession.session.terminate();
      }
      Plivo.sendEvents.call(client, summaryEvent, client._currentSession);
      Plivo.log.send(client);
    };
  });
};

/**
 * Replace detected MDNS candidate with "192.168.0.1"
 * @param {String} mdnscandidate - ice candidate attribute in sdp containing mdns candidate
 * @returns Ice candidate attribute with mdns ip
 */
const replaceMdnsWithIp = (mdnscandidate: string): string => {
  const candidateArray = mdnscandidate.split(' ');
  candidateArray[4] = DEFAULT_MDNS_CANDIDATE;
  return candidateArray.join(' ');
};

/**
 * Find and replace all MDNS candidates with "192.168.0.1"
 * @param {String} sdp - rtcsession description
 * @returns SDP with mdns ips
 */
export const replaceMdnsIceCandidates = (sdp: string): string => {
  const oldsdp = sdp;
  let localCount = 0;
  let candidateCount = 0;
  const resultArray = [];
  const sdpArray = sdp.split('\n');
  for (let i = 0; i < sdpArray.length; i += 1) {
    if (sdpArray[i].indexOf('a=candidate') !== -1) {
      candidateCount += 1;
      if (sdpArray[i].indexOf('.local') !== -1) {
        localCount += 1;
        sdpArray[i] = replaceMdnsWithIp(sdpArray[i]);
      }
    }
    resultArray.push(sdpArray[i] as never);
  }
  if (localCount !== candidateCount) {
    return oldsdp;
  }
  return resultArray.join('\n');
};

/**
 * Get current time
 */
export const getCurrentTime = (): number => Date.now();

/**
 * Add stats settings to storage.
 */
const applyStatsSettings = function (): boolean {
  const client: Client = this;
  const { storage } = client;
  if (storage) {
    storage.local_audio = [];
    storage.remote_audio = [];
    storage.mosLocalMeasures = [];
    storage.mosRemoteMeasures = [];
    storage.jitterLocalMeasures = [];
    storage.jitterRemoteMeasures = [];
    storage.packetLossRemoteMeasures = [];
    storage.packetLossLocalMeasures = [];
    storage.rtt = [];
    storage.audioCodec = null;
    storage.warning = {
      audioLocalMeasures: false,
      audioRemoteMeasures: false,
      mosLocalMeasures: false,
      mosRemoteMeasures: false,
      jitterLocalMeasures: false,
      jitterRemoteMeasures: false,
      packetLossRemoteMeasures: false,
      packetLossLocalMeasures: false,
      rtt: false,
      ice_connection: false,
    };
    // Don't start mos immediately after call answer, wait for 5 secs
    storage.startAnalysis = false;
    setTimeout(() => {
      storage.startAnalysis = true;
      Plivo.log.debug('Stats analysis started');
    }, STATS_ANALYSIS_WAIT_TIME);
  }
  return true;
};

/**
 * Initialise callstats storage.
 */
export const callStart = function (): void {
  const client: Client = this;
  client.storage = {} as any;
  return applyStatsSettings.call(client);
};

/**
 * Notify network drops.
 * @param {RTCPeerConnectionState} iceState - ice connection state
 */
export const iceConnectionCheck = function (
  iceState: RTCPeerConnectionState,
): void {
  const client: Client = this;
  if (['disconnected', 'failed'].indexOf(iceState) !== -1) {
    Plivo.log.info(`${LOGCAT.NETWORK_CHANGE} | Network drop while performing ice connection check`);
    Plivo.emitMetrics.call(
      client,
      'network',
      'warning',
      'ice_connection',
      iceState,
      true,
      'network drop',
      'None',
    );
    if (client.storage) {
      client.storage.warning.ice_connection = true;
    }
  }
  if (
    iceState === 'connected'
    && client.storage
    && client.storage.warning.ice_connection === true
  ) {
    Plivo.emitMetrics.call(
      client,
      'network',
      'warning',
      'ice_connection',
      iceState,
      false,
      'network drop',
      'None',
    );
    client.storage.warning.ice_connection = false;
  }
};

/**
 * Set DSCP class to Expedited Forwarding as soon as the call is answered
 */
export const setEncodingParameters = function (): void {
  const client: Client = this;
  if (client._currentSession && client._currentSession.session
    && client._currentSession.session.connection) {
    const sender = client._currentSession.session.connection.getSenders()[0];
    // Don't set priority when dscp is not enabled
    if (!client.options.dscp || !sender || typeof sender.getParameters !== 'function' || typeof sender.setParameters !== 'function') {
      return;
    }
    const params = sender.getParameters();
    if (!params.priority && !(params.encodings && params.encodings.length)) {
      return;
    }
    // Define priority for RTPSenderParameters
    params.priority = 'high';
    if (params.encodings && params.encodings.length) {
      params.encodings.forEach((encoding) => {
        // eslint-disable-next-line no-param-reassign
        (encoding as any).priority = 'high';
        // eslint-disable-next-line no-param-reassign
        (encoding as any).networkPriority = 'high';
      });
    }
    sender.setParameters(params);
  }
};

/**
 * Handle ice connection change.
 * @param {RTCPeerConnection} connection - media connection
 * @param {CallSession} callSession - call session information
 */
export const onIceConnectionChange = function (
  connection: RTCPeerConnection,
  callSession: CallSession,
): void {
  const client: Client = this;
  const iceState = connection.iceConnectionState;
  Plivo.log.debug(`${LOGCAT.CALL} | oniceconnectionstatechange is ${iceState}`);
  Plivo.log.debug(`oniceconnectionstatechange:: ${iceState}`);
  callSession.addConnectionStage(
    `iceConnectionState-${iceState}@${getCurrentTime()}`,
  );
  callSession.updateMediaConnectionInfo({
    [`ice_connection_state_${iceState}`]: getCurrentTime(),
  });
  iceConnectionCheck.call(client, iceState);
  if (callSession.callUUID && connection) {
    if (iceState === 'failed' || iceState === 'disconnected') {
      if (client.callStats) {
        client.callStats.reportError(
          connection,
          callSession.callUUID,
          client.callStats.webRTCFunctions.iceConnectionFailure,
        );
      }
    }
    if (iceState === 'connected') {
      client.emit('onMediaConnected', callSession.getCallInfo("local"));
    }
  }
};

/**
 * Extract reason from SIP messages.
 * @param {string | object} reasonMessage - SIP message
 */
export const extractReasonInfo = (reasonMessage) => {
  if (reasonMessage == null || typeof reasonMessage !== 'object') {
    Plivo.log.debug(`${LOGCAT.CALL} | evt.message could be null or not an object: ${reasonMessage ? typeof reasonMessage : "null"}`);
    return { protocol: 'none', cause: -1, text: 'none' };
  }
  const reasonHeader = reasonMessage.getHeader("Reason");
  if (reasonHeader == null) {
    Plivo.log.debug(`${LOGCAT.CALL} | No reason header present}`);
    return { protocol: 'none', cause: -1, text: 'none' };
  }

  const matchCause = reasonHeader.match(/cause=(\d+)/);
  const matchProtocol = reasonHeader.match(/^([^;]+)/);
  const matchText = reasonHeader.match(/text="([^"]+)"/);

  const protocol = matchProtocol ? matchProtocol[1] : 'none';
  const cause = matchCause ? parseInt(matchCause[1], 10) : -1;
  const text = matchText ? matchText[1] : 'none';

  return { protocol, cause, text };
};

export const extractReason = (evt:SessionFailedEvent) => {
  if (evt.originator === 'local') {
    return { protocol: 'none', cause: LOCAL_ERROR_CODES[evt.cause], text: evt.cause };
  }
  return extractReasonInfo(evt.message);
};

/**
 * Start collecting plivo rtp stats.
 * @param {CallSession} callSession - call session information
 */

export const statsCollector = function (callSession: CallSession): void {
  const client: Client = this;
  if (
    (client.statsSocket
      && client.callstatskey
      && ((client.browserDetails.browser === 'chrome'
        && client.browserDetails.version > 63)
        || (client.browserDetails.browser === 'firefox'
          && client.browserDetails.version > 59)
        || (client.browserDetails.browser === 'safari'
          && client.browserDetails.version > 10)
        || (client.browserDetails.browser === 'edge'
        && client.browserDetails.version > 79)))
    || (client.browserDetails.browser === 'chrome'
      && client.browserDetails.version > 63)
  ) {
    const stats = new GetRTPStats(client);
    callSession.setCallStats(stats);
  } else if (client.statsSocket && client.callstatskey) {
    Plivo.log.warn(
      'This browser version is not supported for collecting data for Call Insights API but the call will proceed despite this. Supported versions are Chrome version - 64 and above, Firefox version - 63 and above, Safari version - 10 and above',
    );
  }
};

/**
 * Calculate connection stages for each call state.
 * @param {Array<String>} obj - connection stages of each state
 * @returns parsed connection stage string
 */
const calcConnStage = function (obj: string[]): string {
  const alinObj: string[] = [];
  let connStart: string = '';
  for (let i = 0; obj.length > i; i += 1) {
    const row = obj[i].split('@');
    if (i === 0) {
      // eslint-disable-next-line prefer-destructuring
      connStart = row[1];
      alinObj.push(`${row[0]} = ${row[1]}#`);
    } else {
      let ms: number | string = new Date(row[1]).valueOf() - new Date(connStart).valueOf();
      if (ms > 1000) {
        ms /= 1000;
        ms = `${String(ms)}s#`;
      } else {
        ms = `${String(ms)}ms#`;
      }
      alinObj.push(`${row[0]} = ${row[1]} +${ms}`);
    }
  }
  let alinObjStr = JSON.stringify(alinObj);
  alinObjStr = alinObjStr.replace(/[[",\]]/g, '');
  alinObjStr = alinObjStr.replace(/#/g, '\n');
  return alinObjStr;
};

/**
 * Reset and delete session information.
 * @param {CallSession} session - call session information
 */
const clearSessionInfo = function (session: CallSession): void {
  const client: Client = this;
  if (session === client._currentSession) {
    // audio element clearence
    if (client.remoteView) {
      client.remoteView.pause();
    }
    client._lastCallSession = session;
    client.lastCallUUID = session.callUUID;
    client._currentSession = null;

    client.callSession = null;
    client.callUUID = null;
    client.callDirection = null;
  } else if (
    client
    && client.incomingInvites
    && session.callUUID
    && client.incomingInvites.has(session.callUUID)) {
    client.incomingInvites.delete(session.callUUID);
  }
  if (
    client.lastIncomingCall
    && client.lastIncomingCall.callUUID === session.callUUID
  ) {
    client.lastIncomingCall = null;
    if (!client.options.allowMultipleIncomingCalls) {
      client.callSession = null;
      client.callUUID = null;
      client.callDirection = null;
    }
    if (client.incomingInvites.size) {
      client.lastIncomingCall = client.incomingInvites.values().next().value;
      if (!client.options.allowMultipleIncomingCalls && client.lastIncomingCall) {
        client.callSession = client.lastIncomingCall.session;
        client.callUUID = client.lastIncomingCall.callUUID;
        client.callDirection = client.lastIncomingCall.direction;
      }
    }
  }
};

/**
 * Check for closeProtection option and remove dialog prompt constraints when hanging up call.
 */
const removeCloseProtectionListeners = function (): void {
  if (!this._currentSession && this.incomingInvites && this.incomingInvites.size === 0) {
    window.onbeforeunload = () => {};
    window.onunload = () => {};
  }
};

/**
 * Stop local stream for chrome and enable tracks for firefox and safari.
 */
const stopLocalStream = function (): void {
  if ((window as any).localStream) {
    if (getBrowserDetails().browser === 'firefox' || getBrowserDetails().browser === 'chrome' || this.permOnClick || isElectronApp()) {
      try {
        (window as any).localStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          (window as any).localStream.removeTrack(track);
        });
        (window as any).localStream = null;
      } catch (err) {
        Plivo.log.debug(`${LOGCAT.CALL} | error in stopping tracks in localStream : ${err.message}`);
      }
    }
    // instead of stopping stream, enable audio tracks because safari and
    // firefox uses the same mediastream across calls
    if (
      getBrowserDetails().browser === 'safari'
    ) {
      try {
        (window as any).localStream.getTracks().forEach((track: MediaStreamTrack) => {
          if (!track.enabled) {
            // eslint-disable-next-line no-param-reassign
            track.enabled = true;
          }
        });
      } catch (err) {
        Plivo.log.debug(`${LOGCAT.CALL} | error in enabling tracks in localStream : ${err.message}`);
      }
    }
  }
};

/**
 * Clear all flags and session information.
 * @param {CallSession} session - call session information
 */
export const hangupClearance = function (session: CallSession) {
  try {
    const client: Client = this;
    Plivo.AppError.call(client, calcConnStage(session.connectionStages), 'log');
    session.clearCallStats();
    clearSessionInfo.call(client, session);
    const signallingInfo = session.getSignallingInfo();
    const mediaConnectionInfo = session.getMediaConnectionInfo();
    if (client.callstatskey) {
      getAudioDevicesInfo
        .call(client)
        .then((deviceInfo) => {
          sendCallSummaryEvent.call(
            client,
            deviceInfo,
            signallingInfo,
            mediaConnectionInfo,
            session,
          );
        })
        .catch(() => {
          sendCallSummaryEvent.call(
            client,
            null,
            signallingInfo,
            mediaConnectionInfo,
            session,
          );
        });
    }
    removeCloseProtectionListeners.call(client);
    client.isCallMuted = false;
    if (client._currentSession) return;
    if (client.storage) client.storage = null;
    stopLocalStream.call(client);
    updateAudioDeviceFlags();
    resetMuteOnHangup();
    client.noiseSuppresion.stopNoiseSuppresion();
  } catch (err) {
    Plivo.log.info(`${LOGCAT.CALL} | error while hangup clearance : ${err.message}`);
  }
};

/**
 * Add mid attribute to SDP. Fix for https://bugzilla.mozilla.org/show_bug.cgi?id=1495569
 * @param {SessionProgressEvent} evt - rtcsession progress information
 */
export const addMidAttribute = function (evt: SessionProgressEvent): void {
  if (
    (this as Client).browserDetails.browser === 'firefox'
    && (this as Client).browserDetails.version > 62
    && evt.response && evt.response.body && evt.response.body.indexOf('a=mid:0') === -1
  ) {
    // eslint-disable-next-line no-param-reassign
    evt.response.body = evt.response.body.replace(
      'a=ice-pwd',
      'a=mid:0\na=ice-pwd',
    );
  }
};

/**
 * Called when a new fabric message is added
 * @param {String} message - callstats.io fabric message
 */
const peerConnectionCallback = (message: string): void => {
  Plivo.log.debug(`Stats new fabric message: ${message}`);
};

/**
 * Add a new fabric message to callstats.io
 * @param {CallSession} callSession - call session information
 * @param {String} userId - source username
 * @param {String} callUUID - active callUUID
 */
export const addCallstatsIOFabric = function (
  callSession: CallSession,
  userId: string,
  callUUID: string,
): void {
  if ((this as Client).callStats && callSession.session.connection) {
    (this as Client).callStats.addNewFabric(
      callSession.session.connection,
      userId,
      (this as Client).callStats.fabricUsage.audio,
      callUUID,
      peerConnectionCallback,
    );
  }
};

/**
 * Send error to stats wahen media error occurs.
 * @param {SessionFailedEvent} evt - rtcsession failed information
 * @param {CallSession} callSession - call session information
 */
export const handleMediaError = function (
  evt: SessionFailedEvent,
  callSession: CallSession,
): void {
  const client: Client = this;
  if (client.callStats && callSession.callUUID && !evt.cause.match('edia')) {
    if (callSession.session.connection) {
      client.callStats.reportError(
        callSession.session.connection,
        callSession.callUUID,
        client.callStats.webRTCFunctions.signalingError,
      );
    } else {
      client.callStats.reportError(
        null,
        callSession.callUUID,
        client.callStats.webRTCFunctions.signalingError,
      );
    }
  }
  if (
    client.statsSocket
    && callSession.callUUID
    && client.callstatskey
    && !evt.cause.match('edia')
  ) {
    const errName = evt.cause;
    let errMsg;
    if (evt.message && evt.message.status_code) {
      errMsg = String(evt.message.status_code);
    } else {
      errMsg = evt.cause;
    }
    callSession.updateSignallingInfo({
      signalling_errors: {
        timestamp: getCurrentTime(),
        error_code: errMsg,
        error_description: errName,
      },
    });
  }
};

/**
 * Check if rtc session is established.
 * @param {RTCSession} session - rtcsession information
 */
export const isSessionConfirmed = function (session: RTCSession): boolean {
  if (session) {
    return session.isEstablished();
  }
  Plivo.log.debug('session not available');
  return false;
};

/**
 * Check if client is using a mobile browser or not
 * @returns true if client is mobile browser
 */
export const mobileBrowserCheck = function (): boolean {
  let check = false;
  // eslint-disable-next-line func-names
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; }(navigator.userAgent || navigator.vendor || (window as any).opera));
  return check;
};

/**
 * set the state and reason for onConnectionChange event
 * @param {Client} client - client instance
 * @param {string} state - state of the connection
 * @param {string} reason - reason for disconnection/connection
*/
export const setConectionInfo = function (client: Client, state: string, reason: string): void {
  client.connectionInfo.state = state;
  client.connectionInfo.reason = reason;
};

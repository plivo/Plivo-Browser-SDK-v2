/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import {
  UserAgentNewRtcSessionEvent,
  SessionAnswerOptions,
  SessionSdpEvent,
  SessionFailedEvent,
  SessionEndedEvent,
  SessionNewDtmfEvent,
  C as JSSIP_C,
  SessionNewInfoEvent,
} from 'plivo-jssip';
import {
  RINGTONE_ELEMENT_ID,
  STUN_SERVERS,
  SESSION_TIMERS_EXPIRES,
  DOMAIN,
  MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE,
  NETWORK_CHANGE_INTERVAL_ON_CALL_STATE,
  MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
  NETWORK_CHANGE_INTERVAL_IDLE_STATE,
  LOGCAT,
  LOCAL_ERROR_CODES,
} from '../constants';
import { CallSession } from './callSession';
import { receiveExtraHeader } from '../utils/headers';
import { stopAudio, playAudio } from '../media/document';
import checkCodecPreference, {
  AvailableCodecs,
} from '../utils/codecPreference';
import { Logger } from '../logger';
import {
  getCurrentTime,
  addCloseProtectionListeners,
  replaceMdnsIceCandidates,
  onIceConnectionChange,
  addCallstatsIOFabric,
  hangupClearance,
  mobileBrowserCheck,
  extractReason,
} from './util';
import { Client } from '../client';
import { resetPingPong } from '../utils/networkManager';

const Plivo = { log: Logger };
let cs: Client;
let isIncomingCallRinging = false;
let isBrowserInBackground = false;

/**
 * Add Event Listener for 'visibilitychange' event
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    isBrowserInBackground = false;
    if (isIncomingCallRinging && mobileBrowserCheck()) {
      Plivo.log.debug(`${LOGCAT.CALL} | Move to foreground. playing audio`);
      playAudio(RINGTONE_ELEMENT_ID);
    }
  } else {
    isBrowserInBackground = true;
    if (isIncomingCallRinging && mobileBrowserCheck()) {
      Plivo.log.debug(`${LOGCAT.CALL} | Move to background. stopping audio`);
      stopAudio(RINGTONE_ELEMENT_ID);
    }
  }
});
/**
 * Update incoming call information.
 * @param {UserAgentNewRtcSessionEvent} evt - rtcsession information
 * @param {CallSession} call - incoming call session
 */
const updateSessionInfo = (evt: UserAgentNewRtcSessionEvent, call: CallSession): void => {
  if (call.callUUID) {
    cs.incomingInvites.set(call.callUUID, call);
    cs.lastIncomingCall = call;
    // Storing these info for backward compatiblity, in case user used these non-document variables.
    if (!cs.options.allowMultipleIncomingCalls) {
      cs.callSession = call.session;
      cs.callUUID = call.callUUID;
      (cs as any).direction = call.direction;
    }
    call.addConnectionStage(`I-invite@${getCurrentTime()}`);
    call.updateSignallingInfo({
      invite_time: getCurrentTime(),
    });

    Plivo.log.debug(`callSession - ${call.callUUID}`);
  }
};

/**
 * Triggered when call is ringing.
 */
const onProgress = (incomingCall: CallSession) => (): void => {
  // allow incomming call only if permission granted
  incomingCall.onRinging(cs);
  Plivo.log.debug(`${LOGCAT.CALL} | Incoming call ringing`);
  incomingCall.addConnectionStage(`progress-180@${getCurrentTime()}`);
  incomingCall.updateSignallingInfo({
    call_progress_time: getCurrentTime(),
  });
  incomingCall.setState(incomingCall.STATE.RINGING);
  incomingCall.setPostDialDelayEndTime(getCurrentTime());
  Plivo.log.debug(`${LOGCAT.CALL} | call ringing with 180 code, incoming call in progress`);
  const callerUri = incomingCall.session.remote_identity.uri.toString();
  // Fetch the caller name
  const callerName = incomingCall.session.remote_identity.display_name;
  // if already on an incomingCall then do not play the ringtone
  Plivo.log.debug(`${LOGCAT.CALL} | ringtone enabled : ${cs.ringToneFlag}`);
  Plivo.log.debug(`${LOGCAT.CALL} | no session is active currently: ${!cs._currentSession}`);
  if (cs.ringToneFlag !== false && !cs._currentSession) {
    if (!mobileBrowserCheck()) {
      Plivo.log.debug(`${LOGCAT.CALL} | Not a mobile browser. Playing ring tone`);
      playAudio(RINGTONE_ELEMENT_ID);
    } else if (!isBrowserInBackground) {
      Plivo.log.debug(`${LOGCAT.CALL} | Not in background. Playing ring tone`);
      playAudio(RINGTONE_ELEMENT_ID);
    }
    Plivo.log.debug(`${LOGCAT.CALL} | incoming call ringtone started`);
    isIncomingCallRinging = true;
  }
  const callerId = `${callerUri.substring(
    4,
    callerUri.indexOf('@'),
  )}@${DOMAIN}`;
  const emitIncomingCall = () => {
    Plivo.log.debug(`${LOGCAT.CALL} | Emitting onIncomingCall`);
    cs.emit(
      'onIncomingCall',
      callerId,
      incomingCall.extraHeaders,
      incomingCall.getCallInfo("local"),
      callerName,
    );
  };
  cs.noiseSuppresion.setLocalMediaStream().then(() => {
    emitIncomingCall();
  }).catch(() => {
    emitIncomingCall();
  });
  addCloseProtectionListeners.call(cs);
  Plivo.log.debug(`${LOGCAT.CALL} | Incoming Call Extra Headers : ${JSON.stringify(incomingCall.extraHeaders)}`);
};

/**
 * Triggered when sdp is prepared.
 * @param {SessionSdpEvent} evt - rtcsession sdp information
 */
const onSDP = (evt: SessionSdpEvent): void => {
  Plivo.log.debug(`${LOGCAT.CALL} | incoming ${evt.originator} sdp prepared`);
  isIncomingCallRinging = false;
  // eslint-disable-next-line no-param-reassign
  try {
    // eslint-disable-next-line no-param-reassign
    evt.sdp = checkCodecPreference(
      cs.options.codecs as AvailableCodecs[],
      evt.sdp as string,
    );
  } catch (err) {
    Plivo.log.debug('checkCodecPreference err - ', err);
  }

  evt.sdp = evt.sdp.replace(
    'useinbandfec=1',
    `useinbandfec=1;maxaveragebitrate=${cs.options.maxAverageBitrate}`,
  );

  evt.sdp = evt.sdp.replace(
    '0\r\r',
    `0`,
  );

  // eslint-disable-next-line no-param-reassign
  evt.sdp = replaceMdnsIceCandidates(evt.sdp);
  Plivo.log.debug('Incoming call SDP processing done');
};

/**
 * Triggered when call is answered and (2XX received/sent).
 */
const onAccepted = (incomingCall: CallSession) => (): void => {
  isIncomingCallRinging = false;
  Plivo.log.info(`${LOGCAT.CALL} | Incoming call Answered`);
  // reset ping pong service with on-call timeouts
  resetPingPong({
    client: cs,
    messageCheckTimeout: MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE,
    networkChangeInterval: NETWORK_CHANGE_INTERVAL_ON_CALL_STATE,
  });
  incomingCall.onAccepted(cs);
  const inboundConnection = incomingCall.session.connection || null;
  if (inboundConnection) {
    inboundConnection.oniceconnectionstatechange = () => onIceConnectionChange.call(
      cs, inboundConnection, incomingCall,
    );
    inboundConnection.onconnectionstatechange = () => {
      Plivo.log.debug(`${LOGCAT.CALL} | onconnectionstatechange is ${inboundConnection.connectionState}`);
      if (inboundConnection.connectionState === "connected") {
        cs.timeTakenForStats.mediaSetup.end = new Date().getTime();
      }
    };
  }
};

/**
 * Triggered when call is answered and (ACK received/sent).
 */
const onConfirmed = (incomingCall: CallSession) => (): void => {
  Plivo.log.debug(`Incoming call confirmed - ${incomingCall.callUUID}`);
  isIncomingCallRinging = false;
  incomingCall.onConfirmed(cs);
  const remoteStream: MediaStream = incomingCall.session.connection
    ? (incomingCall.session.connection as any).getRemoteStreams()[0] : null;
  if (!remoteStream) {
    Plivo.log.error(`${LOGCAT.CALL} | Incoming call: remote stream does not exist`);
  }
  cs.remoteView.srcObject = remoteStream;
  addCallstatsIOFabric.call(
    cs,
    incomingCall,
    incomingCall.src,
    incomingCall.callUUID,
  );
};

/**
 * Update failure states and emit events.
 * @param {SessionFailedEvent} evt - rtcsession failed information
 */
const handleFailureCauses = (evt: SessionFailedEvent, incomingCall: CallSession): void => {
  Plivo.log.info(`${LOGCAT.CALL} | Incoming call - ${evt.cause}`);
  let reasonInfo = { protocol: 'none', cause: -1, text: 'none' };
  if (evt.originator === 'local' && incomingCall.isCallTerminatedDuringRinging) {
    reasonInfo = { protocol: 'none', cause: LOCAL_ERROR_CODES['Network switch while ringing'], text: 'Network switch while ringing' };
    incomingCall.isCallTerminatedDuringRinging = false;
  } else {
    reasonInfo = extractReason(evt);
  }
  if (evt.cause === JSSIP_C.causes.CANCELED) {
    incomingCall.setState(incomingCall.STATE.CANCELED);
    Plivo.log.info(`${LOGCAT.CALL} | Incoming call Canceled - ${(reasonInfo.text === "" || reasonInfo.text === "none") ? evt.cause : reasonInfo.text}}`);
    cs.emit('onIncomingCallCanceled', incomingCall.getCallInfo(evt.originator, reasonInfo.protocol, reasonInfo.text, reasonInfo.cause));
  } else {
    Plivo.log.info(`${LOGCAT.CALL} | Incoming call failed - ${(reasonInfo.text === "" || reasonInfo.text === "none") ? evt.cause : reasonInfo.text}`);
    if (evt.cause === 'Rejected') {
      incomingCall.setState(incomingCall.STATE.REJECTED);
    } else {
      incomingCall.setState(incomingCall.STATE.FAILED);
    }
    cs.emit('onCallFailed', evt.cause, incomingCall.getCallInfo(evt.originator, reasonInfo.protocol, reasonInfo.text, reasonInfo.cause));
  }
};

/**
 * Triggered when call is rejected or invalid or cancelled.
 * @param {SessionFailedEvent} evt - rtcsession failed information
 */
const onFailed = (incomingCall: CallSession) => (evt: SessionFailedEvent): void => {
  isIncomingCallRinging = false;
  Plivo.log.debug(`${LOGCAT.CALL} | Incoming call failed: ${evt.cause}`);
  handleFailureCauses(evt, incomingCall);
  incomingCall.onFailed(cs, evt);

  // //  logout if logged in by token and token get expired
  // if(cs.isAccessToken && cs.accessToken == null) {
  //   cs.emit('onLogout', 'ACCESS_TOKEN_EXPIRED');
  //   cs.logout();
  // }
  // Check whether there is another incoming call
  if (cs.incomingInvites.size < 2) {
    if (cs.ringToneView && !cs.ringToneView.paused) {
      stopAudio(RINGTONE_ELEMENT_ID);
    }
  }
};

/**
 * Triggered when call was hung up.
 * @param {SessionEndedEvent} evt - rtcsession information
 */
const onEnded = (incomingCall: CallSession) => (evt: SessionEndedEvent): void => {
  isIncomingCallRinging = false;
  Plivo.log.info(`${LOGCAT.CALL} | Incoming call - ${evt.cause} - ${evt.originator}`);
  Plivo.log.debug(`Incoming call ended - ${incomingCall.callUUID}`);
  Plivo.log.info(`${LOGCAT.CALL} | Incoming call Hangup`);
  incomingCall.onEnded(cs, evt);
  // reset back pingpong to idle state timeouts
  resetPingPong({
    client: cs,
    messageCheckTimeout: MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
    networkChangeInterval: NETWORK_CHANGE_INTERVAL_IDLE_STATE,
  });
};

/**
 * Triggered when DTMF is received.
 * @param {SessionNewDtmfEvent} evt - rtcsession DTMF information
 */
const newDTMF = (evt: SessionNewDtmfEvent): void => {
  if (cs._currentSession && evt.originator === 'remote') {
    Plivo.log.info(`${LOGCAT.CALL} | emitting onDtmfReceived with digit: `, evt.dtmf.tone);
    const dtmfData = {
      tone: evt.dtmf.tone,
      duration: evt.dtmf.duration,
    };
    cs.emit('onDtmfReceived', dtmfData);
  }
};

/**
 * Triggered when INFO is received/sent.
 * @param {SessionNewDtmfEvent} evt - rtcsession DTMF information
 */
const newInfo = (evt: SessionNewInfoEvent): void => {
  Plivo.log.info(`${LOGCAT.CALL} | Incoming Call | ${evt.originator} INFO packet with body : ${evt.info.body}`);
  if (cs._currentSession && evt.info.body === "remote-party-ringing") {
    cs.emit('onCallConnected', cs._currentSession.getCallInfo(evt.originator));
  }
  if (evt.info.body === 'no-remote-audio') {
    cs.emit('remoteAudioStatus', false);
  }
  if (evt.info.body === 'remote-audio') {
    cs.emit('remoteAudioStatus', true);
  }
};

/**
 * Creates incoming call event listeners.
 */
export const createIncomingCallListeners = (incomingCall: CallSession): void => {
  incomingCall.session.on('progress', onProgress(incomingCall));
  incomingCall.session.on('sdp', onSDP);
  incomingCall.session.on('accepted', onAccepted(incomingCall));
  incomingCall.session.on('confirmed', onConfirmed(incomingCall));
  incomingCall.session.on('icetimeout' as any, (sec: any) => incomingCall.onIceTimeout(cs, sec));
  incomingCall.session.on('failed', onFailed(incomingCall));
  incomingCall.session.on('ended', onEnded(incomingCall));
  incomingCall.session.on('noCall' as any, onEnded(incomingCall));
  incomingCall.session.on('newDTMF', newDTMF);
  incomingCall.session.on('newInfo', newInfo);
  incomingCall.session.on('icecandidate', (event) => incomingCall.onIceCandidate(cs, event));
  incomingCall.session.on('getusermediafailed', (err) => incomingCall.onGetUserMediaFailed(cs, err as Error));
  incomingCall.session.on('peerconnection:createofferfailed', (err) => incomingCall.handlePeerConnectionFailures(
    cs,
    'createofferfailed',
    cs.callStats ? cs.callStats.webRTCFunctions.createOffer : null,
    err as Error,
  ));
  incomingCall.session.on('peerconnection:createanswerfailed', (err) => incomingCall.handlePeerConnectionFailures(
    cs,
    'createanswerfailed',
    cs.callStats ? cs.callStats.webRTCFunctions.createAnswer : null,
    err as Error,
  ));
  incomingCall.session.on('peerconnection:setlocaldescriptionfailed', (err) => incomingCall.handlePeerConnectionFailures(
    cs,
    'setlocaldescriptionfailed',
    cs.callStats ? cs.callStats.webRTCFunctions.setLocalDescription : null,
    err as Error,
  ));
  incomingCall.session.on('peerconnection:setremotedescriptionfailed', (err) => incomingCall.handlePeerConnectionFailures(
    cs,
    'setremotedescriptionfailed',
    cs.callStats ? cs.callStats.webRTCFunctions.setRemoteDescription : null,
    err as Error,
  ));
};

/**
 * Create call session for incoming call.
 * @param {Client} clientObject - client reference
 * @param {UserAgentNewRtcSessionEvent} evt - rtcsession information
 */
export const createIncomingSession = (
  clientObject: Client,
  evt: UserAgentNewRtcSessionEvent,
): void => {
  cs = clientObject;
  const callUUID = evt.request.getHeader('X-Calluuid');
  const stirVerificationValue = evt.request.getHeader('X-Plivo-Stir-Verification');
  const sipCallID = evt.request.getHeader('Call-ID');
  const callerHeader = evt.request.getHeader('From');
  const callerRegex = callerHeader.match(/:(.*)@/i);
  const caller = callerRegex !== null ? callerRegex[1] : '';
  cs.loggerUtil.setSipCallID(sipCallID);
  const extraHeaders = receiveExtraHeader(
    evt.request,
    (evt.request as any).headers,
  );

  const headers = {
    call_uuid: callUUID,
    sip_call_id: sipCallID,
  };
  Plivo.log.info(`${LOGCAT.CALL} | Incoming call initiated for ${cs.userName} from ${caller} with header:- `, JSON.stringify(headers));
  const callInitiationTime = cs.incomingCallsInitiationTime.get(callUUID);
  if (callInitiationTime) cs.incomingCallsInitiationTime.delete(callUUID);
  const incomingCall = new CallSession({
    callUUID,
    sipCallID,
    direction: 'incoming',
    src: caller,
    dest: cs.userName as string,
    session: evt.session,
    extraHeaders,
    call_initiation_time: callInitiationTime,
    client: cs,
    stirShakenState: stirVerificationValue,
  });
  if (evt.request.getHeader('X-FeatureFlags')) {
    incomingCall.serverFeatureFlags = evt.request.getHeader('X-FeatureFlags').split(',');
    incomingCall.serverFeatureFlags.forEach((value) => value.trim());
    if (cs.phone) {
      if (incomingCall.serverFeatureFlags.indexOf('ft_info') !== -1) {
        cs.phone.sendReInviteOnTransportConnect = false;
      } else {
        cs.phone.sendReInviteOnTransportConnect = true;
      }
    }
  } else if (cs.phone) {
    cs.phone.sendReInviteOnTransportConnect = true;
  }
  updateSessionInfo(evt, incomingCall);
  createIncomingCallListeners(incomingCall);
};

/**
 * Get incoming call object based on CallUUID.
 * @param {String} callUUID - provide active CallUUID
 * @param {Client} clientObject - client reference
 * @returns Incoming call session information
 */
export const getCurrentIncomingCall = (
  callUUID: string, clientObject: Client,
): CallSession | null => {
  let curIncomingCall: CallSession | null = null;
  if (callUUID && clientObject.incomingInvites.has(callUUID)) {
    curIncomingCall = clientObject.incomingInvites.get(callUUID);
  } else if (clientObject.lastIncomingCall) {
    curIncomingCall = clientObject.lastIncomingCall;
    if (callUUID && clientObject.options.allowMultipleIncomingCalls) {
      Plivo.log.error(`${LOGCAT.CALL} | No incomingCall with callUUID - ${callUUID}`);
      return null;
    }
  }
  return curIncomingCall;
};

/**
 * Validate incoming call actions.
 * @param {String} actionOnOtherIncomingCalls - list of incoming call actions
 */
export const checkIncomingCallAction = (
  actionOnOtherIncomingCalls: string,
): boolean => {
  const possibleActionsOnOtherIncomingCalls = ['reject', 'ignore', 'letring'];
  if (
    (cs.options.allowMultipleIncomingCalls
      && actionOnOtherIncomingCalls
      && typeof actionOnOtherIncomingCalls !== 'string')
    || (typeof actionOnOtherIncomingCalls === 'string'
      && cs.options.allowMultipleIncomingCalls
      && possibleActionsOnOtherIncomingCalls.indexOf(
        actionOnOtherIncomingCalls.toLowerCase(),
      ) === -1)
  ) {
    Plivo.log.error(`${LOGCAT.CALL} | Invalid actionOnOtherIncomingCalls value`);
    return false;
  }
  return true;
};

/**
 * Apply actions on other incoming calls.
 * @param {CallSession} curIncomingCall - current incoming call
 * @param {String} actionOnOtherIncomingCalls - list of incoming call actions
 */
const handleOtherInvites = (
  curIncomingCall: CallSession,
  actionOnOtherIncomingCalls: string,
): void => {
  if (cs._currentSession) {
    Plivo.log.debug(`${LOGCAT.CALL} | hanging up current session before answer`);
    cs.hangup();
  }
  cs.incomingInvites.forEach((invite) => {
    if (invite !== curIncomingCall) {
      if (
        typeof actionOnOtherIncomingCalls === 'string'
        && actionOnOtherIncomingCalls.toLowerCase() === 'ignore'
      ) {
        isIncomingCallRinging = false;
        cs.ignore(invite.callUUID);
      } else if (
        typeof actionOnOtherIncomingCalls === 'string'
        && actionOnOtherIncomingCalls.toLowerCase() === 'reject'
      ) {
        isIncomingCallRinging = false;
        cs.reject(invite.callUUID);
      } else if (
        typeof actionOnOtherIncomingCalls === 'string'
        && actionOnOtherIncomingCalls.toLowerCase() === 'letring'
      ) {
        Plivo.log.info('Other incoming calls will keep ringing');
      } else if (!actionOnOtherIncomingCalls) {
        cs.reject(invite.callUUID);
      }
    }
  });
};

/**
 * Get answer options for answering the call.
 * @returns Incoming call answer options
 */
const getAnswerOptions = function (): Promise<SessionAnswerOptions> {
  return new Promise((resolve) => {
    const opts: SessionAnswerOptions = {};
    opts.pcConfig = {
      iceServers: [{ urls: STUN_SERVERS }],
    };
    if (cs.permOnClick) {
      const audioConstraints = cs.options.audioConstraints || true;
      opts.mediaConstraints = {
        audio: audioConstraints,
        video: false,
      };
    }
    cs.noiseSuppresion.startNoiseSuppression((window as any).localStream ?? null)
      .then((mediaStream) => {
        opts.mediaStream = mediaStream != null ? mediaStream : (window as any).localStream;
        // opts.mediaStream = (window as any).localStream || null;
        // opts.rtcConstraints =  null;
        opts.sessionTimersExpires = SESSION_TIMERS_EXPIRES;
        resolve(opts);
      });
  });
};

/**
 * Answer incoming call and perform actions for other incoming calls.
 * @param {CallSession} curIncomingCall - current incoming call
 * @param {String} actionOnOtherIncomingCalls - list of incoming call actions
 */
export const answerIncomingCall = function (
  curIncomingCall: CallSession,
  actionOnOtherIncomingCalls: string,
): Promise<void> {
  return new Promise(() => {
    handleOtherInvites(curIncomingCall, actionOnOtherIncomingCalls);
    cs.owaLastDetect.isOneWay = false;
    try {
      cs._currentSession = curIncomingCall;
      cs.incomingInvites.delete(curIncomingCall.callUUID as string);
      if (curIncomingCall === cs.lastIncomingCall) {
        cs.lastIncomingCall = null;
        if (cs.incomingInvites.size) {
          cs.lastIncomingCall = cs.incomingInvites.values().next().value;
        }
      }
      cs.loggerUtil.setSipCallID(cs._currentSession.sipCallID ?? "");
      cs.callSession = cs._currentSession.session;
      cs.callUUID = cs._currentSession.callUUID;
      Plivo.log.debug(`${LOGCAT.CALL} | CallUUID is ${cs.callUUID}`);
      cs.callDirection = cs._currentSession.direction;
      getAnswerOptions().then((options) => {
        curIncomingCall.session.answer(options);
      });
    } catch (err) {
      Plivo.log.error(`${LOGCAT.CALL} | error in answering incoming call : `, err.message);
      curIncomingCall.setState(curIncomingCall.STATE.CANCELED);
      Plivo.log.info(`${LOGCAT.CALL} | Incoming call Canceled - ${err.message}`);
      cs.emit('onIncomingCallCanceled', curIncomingCall.getCallInfo("local", "none", "call answer fail", LOCAL_ERROR_CODES['call answer fail']));
    }
    if (cs.ringToneView && !cs.ringToneView.paused) {
      stopAudio(RINGTONE_ELEMENT_ID);
    }
  });
};

/**
 * Update incoming call information for ignore state.
 * @param {CallSession} curIncomingCall - current incoming call
 */
export const handleIgnoreState = (curIncomingCall: CallSession): void => {
  curIncomingCall.setState(curIncomingCall.STATE.IGNORED);
  curIncomingCall.updateSignallingInfo({
    hangup_time: getCurrentTime(),
    hangup_party: 'local',
    hangup_reason: 'Ignored',
    signalling_errors: {
      timestamp: getCurrentTime(),
      error_code: 'Ignored',
      error_description: 'Ignored',
    },
  });
  hangupClearance.call(cs, curIncomingCall);
};

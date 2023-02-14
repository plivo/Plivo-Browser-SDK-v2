/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import {
  SessionAnswerOptions,
  UserAgentNewRtcSessionEvent,
  SessionSdpEvent,
  SessionProgressEvent,
  SessionAcceptedEvent,
  SessionFailedEvent,
  SessionEndedEvent,
  SessionIceCandidateEvent,
  SessionNewDtmfEvent,
} from 'plivo-jssip';
import {
  SESSION_TIMERS_EXPIRES,
  STUN_SERVERS,
  CONNECT_TONE_ELEMENT_ID,
  RINGBACK_ELEMENT_ID,
  MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE,
  NETWORK_CHANGE_INTERVAL_ON_CALL_STATE,
  MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
  NETWORK_CHANGE_INTERVAL_IDLE_STATE,
} from '../constants';
import { CallSession } from './callSession';
import { checkExtraHeaderKey, checkExtraHeaderVal, checkExtraHeaderJWTVal } from '../utils/headers';
import { playAudio, stopAudio } from '../media/document';
import checkCodecPreference, {
  AvailableCodecs,
} from '../utils/codecPreference';
import {
  sendEvents as _sendEvents,
  AppError as _AppError,
} from '../stats/nonRTPStats';
import { emitMetrics as _emitMetrics } from '../stats/mediaMetrics';
import { Logger } from '../logger';
import {
  getCurrentTime,
  onIceConnectionChange,
  replaceMdnsIceCandidates,
  addCloseProtectionListeners,
  addMidAttribute,
  addCallstatsIOFabric,
  isSessionConfirmed,
} from './util';
import { Client, ExtraHeaders } from '../client';
import { resetPingPong } from '../utils/networkManager';

const Plivo = {
  log: Logger,
  emitMetrics: _emitMetrics,
  sendEvents: _sendEvents,
  AppError: _AppError,
};
let cs: Client;
let outboundCallNumber: string;
let outboundExtraHeaders: ExtraHeaders;
let outBoundConnectionStages: string[];

/**
 * Check if phone number and session is valid.
 * @param {String} phoneNumber  - it can be a sip endpoint/number
 */
const validateSession = (phoneNumber: string): boolean => {
  if (
    typeof phoneNumber === 'undefined'
    || phoneNumber === null
    || phoneNumber.length <= 0
  ) {
    Plivo.log.warn(
      'Destination address cannot be null and the length must be > 0',
    );
    return false;
  }
  if (cs._currentSession) {
    Plivo.log.warn('Cannot make another call while in call');
    return false;
  }
  if (cs.incomingInvites.size) {
    Plivo.log.warn('Cannot make a call while there is an incoming call');
    return false;
  }
  outboundCallNumber = phoneNumber;
  return true;
};

/**
 * Check for `sip:` in phoneNumber. Add if not present.
 * @param {String} phoneNumber  - it can be a sip endpoint/number
 * @returns Parsed phone number
 */
const getValidPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.substring(0, 4) !== 'sip:') {
    return `sip:${phoneNumber}`;
  }
  return phoneNumber;
};

/**
 * Adds remote stream.
 * @param {RTCTrackEvent} evt - rtcsession track information
 */
const onTrack = (evt: RTCTrackEvent): void => {
  Plivo.log.debug('Outgoing call received addStream');
  if (!cs._currentSession) return;
  cs._currentSession.addConnectionStage(
    `addStream-success@${getCurrentTime()}`,
  );
  cs._currentSession.updateMediaConnectionInfo({
    stream_success: getCurrentTime(),
  });
  if (evt.streams[0]) {
    // on direct 200 OK with out 18x, we get The play() request was interrupted by a new load
    // request. 100 timeout sec is workaround
    setTimeout(() => {
      // eslint-disable-next-line prefer-destructuring
      cs.remoteView.srcObject = evt.streams[0];
    }, 100);
    if (
      cs.ringToneBackFlag
      && !isSessionConfirmed(cs._currentSession.session)
    ) {
      setTimeout(() => {
        if (cs._currentSession && !isSessionConfirmed(cs._currentSession.session)) {
          cs.remoteView.pause();
        }
      }, 100);
    } else if (
      !cs.ringToneBackFlag
      && !isSessionConfirmed(cs._currentSession.session)
    ) {
      Plivo.log.debug('playAudio - MediaServer');
    }
  } else {
    Plivo.log.error('Outgoing call add stream failure');
    cs._currentSession.addConnectionStage(
      `addStream-failure@${getCurrentTime()}`,
    );
    cs._currentSession.updateMediaConnectionInfo({
      stream_failure: getCurrentTime(),
    });
  }
};

/**
 * Triggered when outgoing call is performed and INVITE sent.
 */
const onSending = (): void => {
  Plivo.log.debug('Outgoing call sending');
  if (cs._currentSession) {
    cs._currentSession.addConnectionStage(`O-invite@${getCurrentTime()}`);
    cs._currentSession.updateSignallingInfo({
      call_initiation_time: getCurrentTime(),
    });
  }
  Plivo.log.debug('call initiation time, sending invite');
  const outboundConnection = cs._currentSession
    ? cs._currentSession.session.connection || null : null;
  if (cs.connectToneFlag !== false) {
    playAudio(CONNECT_TONE_ELEMENT_ID);
  }
  if (outboundConnection) {
    outboundConnection.ontrack = onTrack;
    outboundConnection.oniceconnectionstatechange = () => {
      if (!cs._currentSession) return;
      onIceConnectionChange.call(cs, outboundConnection, cs._currentSession);
    };
    outboundConnection.onconnectionstatechange = () => {
      if (outboundConnection.connectionState === "connected") {
        cs.timeTakenForStats.mediaSetup.end = new Date().getTime();
      }
    };
  }
};

/**
 * Triggered when sdp is prepared.
 * @param {SessionSdpEvent} evt - rtcsession sdp information
 */
const onSDP = (evt: SessionSdpEvent): void => {
  try {
    // eslint-disable-next-line no-param-reassign
    evt.sdp = checkCodecPreference(
      cs.options.codecs as AvailableCodecs[],
      evt.sdp,
    );
    // eslint-disable-next-line no-param-reassign
    evt.sdp = evt.sdp.replace(
      'useinbandfec=1',
      `useinbandfec=1;maxaveragebitrate=${cs.options.maxAverageBitrate}`,
    );
    // eslint-disable-next-line no-param-reassign
    evt.sdp = replaceMdnsIceCandidates(evt.sdp);
  } catch (err) {
    Plivo.log.debug('checkCodecPreference err - ', err);
  }
};

/**
 * Handle ringtone when call is ringing.
 * @param {SessionProgressEvent} evt - rtcsession progress information
 */
const handleProgressTone = (evt: SessionProgressEvent): void => {
  Plivo.log.debug(`ringback tone enabled : ${cs.ringToneBackFlag}`);
  if (!cs.connectToneView.paused) {
    stopAudio(CONNECT_TONE_ELEMENT_ID);
  }
  if (cs.ringToneBackFlag) {
    playAudio(RINGBACK_ELEMENT_ID);
  }
  if (evt.response && evt.response.status_code === 183 && evt.response.body) {
    if (cs._currentSession) {
      Plivo.log.debug(`callSession - ${cs._currentSession.callUUID}`);
      cs._currentSession.setPostDialDelayEndTime(getCurrentTime());
      if (!cs.ringToneBackFlag) {
        if (cs.ringBackToneView && !cs.ringBackToneView.paused) {
          stopAudio(RINGBACK_ELEMENT_ID);
        }
      }
    }
  }
};

/**
 * Triggered when call is ringing.
 * @param {SessionProgressEvent} evt - rtcsession progress information
 */
const OnProgress = (evt: SessionProgressEvent): void => {
  cs.timeTakenForStats.pdd.end = new Date().getTime();
  if (cs._currentSession && evt.response) {
    cs._currentSession.onRinging(cs);
    const callUUID = evt.response.getHeader('X-Calluuid');
    cs._currentSession.setCallUUID(callUUID);
    cs._currentSession.setState(cs._currentSession.STATE.RINGING);
    cs.callUUID = callUUID;
    cs.emit('onCallRemoteRinging', cs._currentSession.getCallInfo());
    addCloseProtectionListeners.call(cs);
    addMidAttribute.call(cs, evt);
    addCallstatsIOFabric.call(
      cs,
      cs._currentSession,
      (evt.response as any).headers.To[0].parsed.uri.user,
      cs._currentSession.callUUID,
    );
    cs._currentSession.addConnectionStage(
      `progress-${evt.response.status_code}@${getCurrentTime()}`,
    );
    Plivo.log.debug(`progress-${evt.response.status_code}@${getCurrentTime()}`);
    cs._currentSession.updateSignallingInfo({
      ring_start_time: getCurrentTime(),
    });
    cs._currentSession.setPostDialDelayEndTime(getCurrentTime());
    Plivo.log.debug('Outgoing call progress', evt.response.status_code);
    handleProgressTone(evt);
    // Will be true if user triggers mute before session is created
    if (cs.shouldMuteCall) {
      cs.mute();
    }
  }
};

/**
 * Triggered when call is answered and (2XX received/sent).
 * @param {SessionAcceptedEvent} evt - rtcsession accepted information
 */
const onAccepted = (evt: SessionAcceptedEvent): void => {
  if (evt.response && cs._currentSession) {
    const callUUID = evt.response.getHeader('X-Calluuid');
    cs._currentSession.setCallUUID(callUUID);
    Plivo.log.info('Outgoing call accepted');
    cs._currentSession.onAccepted(cs);
    cs._currentSession.setPostDialDelayEndTime(getCurrentTime());
    addCallstatsIOFabric.call(
      cs,
      cs._currentSession,
      (evt.response as any).headers.To[0].parsed.uri.user,
      cs._currentSession.callUUID,
    );
    // reset ping pong service with on-call timeouts
    resetPingPong({
      client: cs,
      messageCheckTimeout: MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE,
      networkChangeInterval: NETWORK_CHANGE_INTERVAL_ON_CALL_STATE,
    });
  }
};

/**
 * Triggered when call is answered and (ACK received/sent).
 */
const onConfirmed = (): void => {
  if (cs._currentSession) {
    Plivo.log.debug(`Outgoing call confirmed - ${cs._currentSession.callUUID}`);
    cs._currentSession.onConfirmed(cs);
    if (cs.remoteView.paused) {
      cs.remoteView.play().catch(() => {});
    }
    if (!cs.connectToneView.paused) {
      stopAudio(CONNECT_TONE_ELEMENT_ID);
    }
  }
};

/**
 * Update failure states.
 * @param {SessionFailedEvent} evt - rtcsession failed information
 */
const handleFailureCauses = (evt: SessionFailedEvent): void => {
  if (cs._currentSession) {
    if (evt.cause === 'Rejected') {
      cs._currentSession.setState(cs._currentSession.STATE.REJECTED);
    } else if (evt.cause === 'Canceled') {
      cs._currentSession.setState(cs._currentSession.STATE.CANCELED);
    } else {
      cs._currentSession.setState(cs._currentSession.STATE.FAILED);
    }
  }
};

/**
 * Triggered when call is rejected or invalid or cancelled.
 * @param {SessionFailedEvent} evt - rtcsession failed information
 */
const onFailed = (evt: SessionFailedEvent): void => {
  Plivo.log.error(`Outgoing call failed: ${evt.cause}`);
  if (!cs._currentSession) return;
  if (evt.message) {
    cs._currentSession.setCallUUID(evt.message.getHeader('X-CallUUID') || null);
  }
  handleFailureCauses(evt);
  cs.emit('onCallFailed', evt.cause, cs._currentSession.getCallInfo());
  cs._currentSession.onFailed(cs, evt);

  // //  logout if logged in by token and token get expired
  // if(cs.isAccessToken && cs.accessToken == null) {
  //   cs.emit('onLogout', 'ACCESS_TOKEN_EXPIRED');
  //   cs.logout();
  // }
  if (cs.ringBackToneView && !cs.ringBackToneView.paused) {
    stopAudio(RINGBACK_ELEMENT_ID);
  }
  if (!cs.connectToneView.paused) {
    stopAudio(CONNECT_TONE_ELEMENT_ID);
  }
  cs.shouldMuteCall = false;
};

/**
 * Triggered when call was hung up.
 * @param {SessionEndedEvent} evt - rtcsession ended information
 */
const onEnded = (evt: SessionEndedEvent): void => {
  if (cs._currentSession) {
    Plivo.log.debug(`Outgoing call ended - ${cs._currentSession.callUUID}`);
    Plivo.log.info('Outgoing call ended');
    cs._currentSession.onEnded(cs, evt);
    // reset back pingpong to idle state timeouts
    resetPingPong({
      client: cs,
      messageCheckTimeout: MESSAGE_CHECK_TIMEOUT_IDLE_STATE,
      networkChangeInterval: NETWORK_CHANGE_INTERVAL_IDLE_STATE,
    });
    Plivo.AppError.call(cs, {
      name: 'onCallTerminated',
      originator: evt.originator,
      reason: evt.cause,
    });
    cs.shouldMuteCall = false;
  }
};

/**
 * Triggered when DTMF is received.
 * @param {SessionNewDtmfEvent} evt - rtcsession DTMF information
 */
const newDTMF = (evt: SessionNewDtmfEvent): void => {
  if (cs._currentSession && evt.originator === 'remote') {
    console.log('emitting onDtmfReceived with digit: ', evt.dtmf.tone)
    let dtmfData = {
      tone: evt.dtmf.tone,
      duration: evt.dtmf.duration
    }
    cs.emit('onDtmfReceived', dtmfData);
  } 
};

/**
 * Remove headers which are not having `X-PH` prefix.
 * @param {ExtraHeaders} extraHeaders - Custom headers which are passed in the INVITE.
 * They should start with 'X-PH'
 * @returns Cleaned extra headers
 */
const getCleanedHeaders = (extraHeaders: ExtraHeaders = {}): string[] => {
  const cleanExtraHeaders: string[] = [];
  outboundExtraHeaders = {};
  const keys = Object.keys(extraHeaders);
  keys.forEach((key) => {
    const value = extraHeaders[key];
    const checkHeaderVal = key.toUpperCase() === 'X-PLIVO-JWT' ? checkExtraHeaderJWTVal : checkExtraHeaderVal;
    if (checkExtraHeaderKey(key) && checkHeaderVal(value)) {
      cleanExtraHeaders.push(`${key}: ${value}`);
      outboundExtraHeaders[key] = value;
      Plivo.log.debug(`valid hdr = ${key} -> ${value}`);
    } else {
      Plivo.log.debug(`invalid hdr = ${key} -> ${value}`);
    }
  });
  if (cs.options.clientRegion) {
    cleanExtraHeaders.push(`X-ClientRegion: ${cs.options.clientRegion}`);
  }
  return cleanExtraHeaders;
};

/**
 * Prepare outgoing call options.
 * @param {ExtraHeaders} extraHeaders - Custom headers which are passed in the INVITE.
 * They should start with 'X-PH'
 * @returns Outgoing call answer options
 */
const getOptions = (extraHeaders: ExtraHeaders): SessionAnswerOptions => {
  const opts: SessionAnswerOptions = {};
  opts.sessionTimersExpires = SESSION_TIMERS_EXPIRES;
  opts.pcConfig = {
    iceServers: [{ urls: STUN_SERVERS }],
  };
  opts.mediaConstraints = {
    audio: cs.options.audioConstraints || true,
    video: false,
  };
  // opts.rtcConstraints = null;
  opts.extraHeaders = getCleanedHeaders(extraHeaders);
  opts.mediaStream = (window as any).localStream || null;
  // eslint-disable-next-line @typescript-eslint/dot-notation
  opts['eventHandlers'] = {
    sending: onSending,
    sdp: onSDP,
    progress: OnProgress,
    accepted: onAccepted,
    confirmed: onConfirmed,
    noCall: onEnded,
    newDTMF: newDTMF,
    icecandidate: (event: SessionIceCandidateEvent) => cs._currentSession
    && cs._currentSession.onIceCandidate(cs, event),
    icetimeout: (sec: number) => cs._currentSession
    && cs._currentSession.onIceTimeout(cs, sec),
    failed: onFailed,
    ended: onEnded,
    getusermediafailed: (err) => cs._currentSession
    && cs._currentSession.onGetUserMediaFailed(cs, err),
    'peerconnection:createofferfailed': (err) => cs._currentSession
    && cs._currentSession.handlePeerConnectionFailures(
      cs,
      'createofferfailed',
      cs.callStats ? cs.callStats.webRTCFunctions.createOffer : null,
      err,
    ),
    'peerconnection:createanswerfailed': (err) => cs._currentSession
    && cs._currentSession.handlePeerConnectionFailures(
      cs,
      'createanswerfailed',
      cs.callStats ? cs.callStats.webRTCFunctions.createAnswer : null,
      err,
    ),
    'peerconnection:setlocaldescriptionfailed': (err) => cs._currentSession
    && cs._currentSession.handlePeerConnectionFailures(
      cs,
      'setlocaldescriptionfailed',
      cs.callStats ? cs.callStats.webRTCFunctions.setLocalDescription : null,
      err,
    ),
    'peerconnection:setremotedescriptionfailed': (err) => cs._currentSession
    && cs._currentSession.handlePeerConnectionFailures(
      cs,
      'setremotedescriptionfailed',
      cs.callStats ? cs.callStats.webRTCFunctions.setRemoteDescription : null,
      err,
    ),
  };
  return opts;
};

/**
 * Perform outgoing call.
 * @param {Client} clientObject - client reference
 * @param {ExtraHeaders} extraHeaders - Custom headers which are passed in the INVITE.
 * They should start with 'X-PH'
 * @param {String} phoneNumber  - it can be a sip endpoint/number
 */
export const makeCall = (
  clientObject: Client,
  extraHeaders: ExtraHeaders,
  phoneNumber: string,
): boolean => {
  cs = clientObject;
  outBoundConnectionStages = [];
  outBoundConnectionStages.push(`call()@${getCurrentTime()}`);
  let phoneNumberStr = '';
  if (phoneNumber) {
    // eslint-disable-next-line no-param-reassign
    phoneNumberStr = String(phoneNumber);
  }
  const isValid = validateSession(phoneNumberStr);
  if (!isValid) return false;
  const destinationUri = getValidPhoneNumber(phoneNumberStr);
  const opts = getOptions(extraHeaders);
  try {
    if (cs.phone) {
      cs.phone.call(destinationUri, opts);
    }
    Plivo.log.debug(
      'Outgoing call options : ',
      JSON.stringify(opts.mediaConstraints),
    );
  } catch (err) {
    Plivo.log.error('Failed to execute plivo.onCalling event handler', err);
    Plivo.AppError.call(cs, {
      name: err.name,
      message: err.message,
      method: 'call()',
    });
    Plivo.sendEvents.call(
      cs,
      {
        msg: 'ERROR_EVENT',
        name: err.name,
        info: err.message,
        method: 'call()',
      },
      cs._currentSession,
    );
    return false;
  }
  return true;
};

/**
 * Create call session for outgoing call.
 * @param {UserAgentNewRtcSessionEvent} evt - rtcsession information
 */
export const createOutgoingSession = (
  evt: UserAgentNewRtcSessionEvent,
): void => {
  const sipCallID = evt.request.getHeader('Call-ID') || null;
  cs._currentSession = new CallSession({
    sipCallID,
    direction: 'outgoing',
    src: cs.userName as string,
    dest: outboundCallNumber,
    session: evt.session,
    extraHeaders: outboundExtraHeaders,
    client: cs,
    stirShakenState: "Not_applicable",
  });
  cs.callSession = cs._currentSession.session;
  cs.callUUID = cs._currentSession.callUUID;
  cs.callDirection = cs._currentSession.direction;
  outBoundConnectionStages.forEach((stage) => {
    cs._currentSession!.addConnectionStage(stage);
  });
  outBoundConnectionStages = [];
  Plivo.log.debug('new RTCSession outgoing');
  cs.emit('onCalling');
};

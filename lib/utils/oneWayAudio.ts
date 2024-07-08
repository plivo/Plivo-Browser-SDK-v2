/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { emitMetrics } from '../stats/mediaMetrics';
import { Logger } from '../logger';
import { Client } from '../client';
import { LOGCAT } from '../constants';
import getBrowserDetails from './browserDetection';

const Plivo = { log: Logger };
let localStream: MediaStream | null;
let pc1: any;
let pc2: RTCPeerConnection;
let detectCallback: (data: any, error: any) => void;
const servers: null | RTCConfiguration = null;

/**
 * Handle error after detecting one way audio.
 * @param {Error} err - error when one way audio is present
 */
const errHandler = function (err: any): void {
  if (detectCallback) {
    detectCallback(null, err);
  }
};

/**
 * Create remote offer.
 * @param {RTCPeerConnection} pc - rtcp connection
 * @param {RTCSessionDescriptionInit} sdp - session description
 */
const remoteOffer = function (
  pc: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit,
): void {
  Plivo.log.debug(`${LOGCAT.CALL} creating remote offer`);
  pc.setRemoteDescription(sdp)
    .then(() => {
      if (sdp.type === 'offer') {
        pc.createAnswer()
          .then((description) => {
            Plivo.log.info(`${LOGCAT.CALL} | SDP Answer created: ${description}`);
            pc.setLocalDescription(description)
              .then(() => {})
              .catch(errHandler);
            remoteOffer(pc1, description);
          })
          .catch(errHandler);
      }
    })
    .catch(errHandler);
};

/**
 * Create local offer.
 * @param {Any} pc - rtcp connection
 */
const localOffer = function (pc: any): void {
  Plivo.log.debug(`${LOGCAT.CALL} creating local offer`);
  pc.addStream(localStream);
  pc.createOffer()
    .then((des: RTCSessionDescriptionInit) => {
      Plivo.log.info(`${LOGCAT.CALL} | SDP Offer created:- ${des}`);
      pc.setLocalDescription(des)
        .then(() => {
          remoteOffer(pc2, des);
        })
        .catch(errHandler);
    })
    .catch(errHandler);
};

/**
 * Add ice candidate upon detecting candidate.
 * @param {RTCPeerConnection} pc - rtcp connection
 * @param {RTCPeerConnectionIceEvent} event - has candidate information
 */
const onIceCandidate = function (
  pc: RTCPeerConnection,
  event: RTCPeerConnectionIceEvent,
): void {
  if (!event.candidate) {
    return;
  }
  pc.addIceCandidate(event.candidate).then().catch(errHandler);
};

/**
 * Stop local stream after detecting one way audio.
 */
const stopStream = function (): void {
  Plivo.log.debug(`${LOGCAT.CALL} stopping local stream after detecting one way audio`);
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
      if (localStream) localStream.removeTrack(track);
      localStream = null;
    });
  }
  if (pc1.signalingState === 'stable') {
    pc1.close();
  }
  if (pc2.signalingState === 'stable') {
    pc2.close();
  }
};

export const getWebRTCStats = function (connection: any)
  : Promise<any> {
  return new Promise((resolve, reject) => {
    const senders = connection.getSenders();
    const cbr = {
      bytesSent: null,
      audioInputLevel: null,
    };
    if (senders) {
      senders[0].getStats(connection.getLocalStreams()[0]
        .getAudioTracks()[0]).then((senderResults: any[]) => {
        Array.from(senderResults.values()).forEach((stats: any) => {
          // console.log('type is ', stats.type);
          if (stats.type === 'outbound-rtp') {
            cbr.bytesSent = stats.bytesSent;
          }

          if (stats.type === 'media-source') {
            cbr.audioInputLevel = stats.audioLevel;
          }

          if (cbr.bytesSent && cbr.audioInputLevel) {
            resolve(cbr);
          }
        });
        if (cbr.bytesSent === null && cbr.audioInputLevel === null) {
          detectCallback(null, 'stats not collectd');
        }
      }).catch((error: any) => {
        reject(error);
      });
    } else {
      reject(cbr);
    }
  });
};

/**
 * Get RTP stats and check if one way audio exists or not through stats
 */
const getStats = function (): void {
  Plivo.log.debug(`Precheck ice state : ${pc1.iceConnectionState}`);
  let statsCounter = 0;
  function processGetStats() {
    if (pc1.getLocalStreams()[0]) {
      getWebRTCStats(pc1).then((result) => {
        if (result.bytesSent && result.audioInputLevel) {
          if (Number(result.audioInputLevel) <= 0 && statsCounter !== 2) {
            statsCounter += 1;
            setTimeout(processGetStats, 1000);
            Plivo.log.debug(`Precheck re-attempt: ${statsCounter}`);
          } else {
            if (detectCallback) {
              detectCallback(result, null);
            }
            // since siplib new getUM at next moment is throwing user denied media
            setTimeout(stopStream, 3000);
          }
        } else {
          detectCallback(null, 'error gathering stats');
        }
      }).catch((error: any) => {
        errHandler(error);
      });
    }
  }
  processGetStats();
};

/**
 * Detect if one way audio exists before making the call.
 * @param {Function} cb - Handle error if one way audio is present, otherwise make the call
 */
export const detectOWA = (cb: (data: any, err: any) => void): void => {
  detectCallback = cb;
  pc1 = new RTCPeerConnection(servers as any);
  pc2 = new RTCPeerConnection(servers as any);
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      localStream = stream;
      localOffer(pc1);
    })
    .catch(errHandler);
  pc1.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    onIceCandidate(pc2, e);
  };
  pc2.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    onIceCandidate(pc1, e);
  };
  // Don't wait more than 500ms
  setTimeout(getStats, 500);
};

/**
 * Handle error if one way audio is present, otherwise make the call.
 * @param {Any} res - consume result when no one way audio is present
 * @param {Any} err - error when one way audio is present
 * @param {Function} onError - callback for emitting error events
 * @param {Function} readyForCall - callback for making the call
 */
export const owaCallback = function (
  res: any,
  err: any,
  onError: (e: string) => void,
  readyForCall: () => void,
): boolean {
  const client: Client = this;
  if (client && client.owaLastDetect) {
    client.owaLastDetect.time = new Date();
  }
  if (err) {
    Plivo.log.error(`${LOGCAT.CALL} | Error in detecting microphone status `, err.message);
    if (client && client.emit) client.emit('onMediaPermission', { status: 'failure', error: err.name });
    onError(`media - ${err.name}`);
    return false;
  }
  Plivo.log.debug(`${LOGCAT.LOGIN} | getUserMedia precheck `, res);
  if (Number(res.bytesSent) === 0 && Number(res.audioInputLevel) === 0) {
    Plivo.log.error(`${LOGCAT.CALL} | chrome lost access to microphone - restart browser`, err.message);
    emitMetrics.call(
      this,
      'audio',
      'warning',
      'no_microphone_access',
      0,
      true,
      'chrome lost access to microphone - restart browser',
      'None',
    );
    if (client && client.owaLastDetect) client.owaLastDetect.isOneWay = true;
    onError('no_microphone_access');
    return false;
  }
  if (Number(res.audioInputLevel) === 0) {
    Plivo.log.error(`${LOGCAT.CALL} | microphone is muted`, err.message);
    emitMetrics.call(
      this,
      'audio',
      'warning',
      'no_microphone_access',
      0,
      true,
      'microphone is muted',
      'None',
    );
  }
  // On no one way audio go to call ready mode
  readyForCall();
  return true;
};

/**
 * Detect if one way audio exists after answering the call.
 * @param {Any} connection - media connection information
 */
export const owaNotification = (connection: any): void => {
  if (
    connection
    && connection.signalingState !== 'closed'
    && getBrowserDetails().browser === 'chrome'
  ) {
    getWebRTCStats(connection).then((result: any) => {
      if (result.bytesSent) {
        Plivo.log.debug(
          `${LOGCAT.CALL} | Bytes sent by WebSDK client: ${
            result.bytesSent
          } audioInputLevel: ${
            result.audioInputLevel}`,
        );
      }

      if (result.bytesSent === 0
        && result.audioInputLevel === 0) {
        Plivo.log.debug(`${LOGCAT.CALL} | One way audio detected`);
        emitMetrics.call(
          this,
          'audio',
          'warning',
          'no_microphone_access',
          0,
          true,
          'no access to your microphone',
          'None',
        );
      }
    }).catch((error: any) => {
      Plivo.log.debug(`${LOGCAT.CALL} | Error while gathering webrtc stats ${error}`);
    });
  }
};

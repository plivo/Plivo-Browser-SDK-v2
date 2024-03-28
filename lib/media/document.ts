/* eslint func-names: ["error", "as-needed"] */
/* eslint-disable import/no-cycle */
import {
  REMOTE_VIEW_ID,
  CONNECT_TONE_ELEMENT_ID,
  CONNECT_TONE_URL,
  RINGBACK_ELEMENT_ID,
  RINGBACK_URL,
  RINGTONE_ELEMENT_ID,
  RINGTONE_URL,
  SILENT_TONE_ELEMENT_ID,
  SILENT_TONE_URL,
  DTMF_TONE_PLAY_RETRY_ATTEMPTS,
  LOGCAT,
} from '../constants';
import { DtmfOptions, Logger } from '../logger';
import {
  audioDevDictionary, availableDevices, mute, unmute,
} from './audioDevice';
import { Client, ConfiguationOptions, PlivoObject } from '../client';

interface AudioEvent {
  status: string;
  stream?: boolean;
  error?: string;
}

const Plivo: PlivoObject = { log: Logger };

/**
 * Check media permission and save all audio element references.
 * @param {Client} clientObject - client reference
 * @param {AudioEvent} evt - media permission information
 */
const setupCallback = function (clientObject: Client, evt: AudioEvent): void {
  if (!window.RTCPeerConnection) {
    Plivo.log.error('No WebRTC support');
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        clientObject.emit('onWebrtcNotSupported');
      }
    };
  }
  clientObject.emit('onMediaPermission', evt);
  if (evt.status === 'failure' && clientObject.userName && clientObject.callStats) {
    clientObject.callStats.reportError(
      null,
      clientObject.userName,
      clientObject.callStats.webRTCFunctions.getUserMedia,
    );
  }
  if (evt.status === 'success' && evt.stream) {
    audioDevDictionary.call(clientObject, true).then(() => {
      availableDevices()
        .then((devices: MediaDeviceInfo[]) => {
          if (navigator.platform === ' Win32'
          || navigator.platform === 'Win16'
          || navigator.platform.toString().toLocaleLowerCase().includes('win')) {
            let activeInputDevice: any = null;
            let activeOutputDevice: any = null;

            devices.forEach((device: MediaDeviceInfo) => {
              if (device.deviceId === 'default' && device.kind === 'audioinput') {
                activeInputDevice = device;
              }
              if (device.deviceId === 'default' && device.kind === 'audiooutput') {
                activeOutputDevice = device;
              }
            });
            Plivo.log.debug(`${LOGCAT.CALL} Setting Input device set to default i.e ${JSON.stringify(activeInputDevice)}`);
            clientObject.audio.microphoneDevices.set("default");
            Plivo.log.debug(`${LOGCAT.CALL} Setting Output device set to default i.e ${JSON.stringify(activeOutputDevice)}`);
            clientObject.audio.speakerDevices.set("default");
          }
        });
      Plivo.log.debug(
        `audioDevDictionary is updated onMediaPermission: ${evt.status}`,
      );
    });
  }
  // eslint-disable-next-line no-param-reassign
  clientObject.remoteView = document.getElementById(REMOTE_VIEW_ID);
  // eslint-disable-next-line no-param-reassign
  clientObject.ringToneView = document.getElementById(
    RINGTONE_ELEMENT_ID,
  ) as HTMLAudioElement;
  // eslint-disable-next-line no-param-reassign
  clientObject.ringBackToneView = document.getElementById(
    RINGBACK_ELEMENT_ID,
  ) as HTMLAudioElement;
  // eslint-disable-next-line no-param-reassign
  clientObject.connectToneView = document.getElementById(
    CONNECT_TONE_ELEMENT_ID,
  ) as HTMLAudioElement;
  Plivo.log.info(JSON.stringify(clientObject.browserDetails));
};

/**
 * Get local media stream.
 * @param {MediaTrackConstraints} audioConstraints - Media track constraints
 * @param {Client} clientObject - client reference
 * @param {Function} cb - Check media permission and save all audio element references
 */
const getLocalMedia = function (
  audioConstraints: MediaTrackConstraints,
  clientObject: Client,
  cb: (cs: Client, evt: AudioEvent) => void,
): void {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: audioConstraints, video: false })
      .then((stream) => {
        (window as any).localStream = stream;
        Plivo.log.debug('getUserMedia success');
        cb(clientObject, { status: 'success', stream: true });
      })
      .catch((err) => {
        Plivo.log.error(`failed to get user media :: ${err.name}`);
        cb(clientObject, { status: 'failure', error: err.name });
      });
  } else {
    Plivo.log.error('getUserMedia not available');
    cb(clientObject, {
      status: 'failure',
      error: 'getUserMedia not supported',
    });
  }
};

/**
 * Create HTML audio elements for webrtc remote stream.
 */
export const setupRemoteView = () => {
  const remoteView = document.createElement('audio');
  remoteView.id = REMOTE_VIEW_ID;
  remoteView.hidden = true;
  remoteView.autoplay = true;
  (remoteView as any).width = 0;
  (remoteView as any).height = 0;
  remoteView.setAttribute('data-devicetype', 'speakerDevice');
  document.body.appendChild(remoteView);
};

/**
 * Create HTML audio elements for all the tones played during the call.
 * @param {Client} clientObject - client reference
 * @param {ConfiguationOptions} options - client configuration parameters
 */
export const setup = function (clientObject: Client, options: ConfiguationOptions): void {
  setupRemoteView();
  const audioConnectingElement = document.createElement('audio');
  audioConnectingElement.id = CONNECT_TONE_ELEMENT_ID;
  (audioConnectingElement as any).loop = 'loop';
  audioConnectingElement.src = CONNECT_TONE_URL;
  audioConnectingElement.setAttribute('data-devicetype', 'speakerDevice');
  document.body.appendChild(audioConnectingElement);

  const audioRingBackElement = document.createElement('audio');
  audioRingBackElement.id = RINGBACK_ELEMENT_ID;
  (audioRingBackElement as any).loop = 'loop';
  audioRingBackElement.src = RINGBACK_URL;
  audioRingBackElement.setAttribute('data-devicetype', 'speakerDevice');
  document.body.appendChild(audioRingBackElement);

  const audioRingToneElement = document.createElement('audio');
  audioRingToneElement.id = RINGTONE_ELEMENT_ID;
  (audioRingToneElement as any).loop = 'loop';
  audioRingToneElement.src = RINGTONE_URL;
  audioRingToneElement.setAttribute('data-devicetype', 'ringtoneDevice');
  document.body.appendChild(audioRingToneElement);

  const audioSilenceElement = document.createElement('audio');
  audioSilenceElement.id = SILENT_TONE_ELEMENT_ID;
  audioSilenceElement.src = SILENT_TONE_URL;
  audioSilenceElement.setAttribute('data-devicetype', 'silentDevice');
  document.body.appendChild(audioSilenceElement);

  const format = 'mp3';
  const baseUrl = 'https://cdn.plivo.com/sdk/browser/audio/dtmf-';
  const addDTMFTone = function (
    digit: string | number,
  ) {
    const id = `dtmf${digit}`;
    const src = `${baseUrl + digit}.${format}`;
    const obj = document.createElement('audio');
    obj.id = id;
    obj.src = src;
    obj.setAttribute('data-devicetype', 'speakerDevice');
    document.body.appendChild(obj);
  };
  for (let i = 0; i <= 9; i += 1) {
    addDTMFTone(i);
  }
  addDTMFTone('star');
  addDTMFTone('pound');

  if (options.permOnClick) {
    (window as any).localStream = null;
    setupCallback(clientObject, { status: 'success', stream: false });
  } else {
    getLocalMedia(
      options.audioConstraints as MediaTrackConstraints, clientObject, (clientObj, evt) => {
        setupCallback(clientObj, evt);
      },
    );
  }
};

/**
 * Parse the DTMFOptions and return the option, inband, outband or default
 * @param {String[]} dtmfOptions - list of dtmf options
 */

export const getDTMFOption = function (dtmfOptions?: DtmfOptions): string {
  let dtmfOptionsLocal: string[];
  if (dtmfOptions && 'sendDtmfType' in dtmfOptions) {
    dtmfOptionsLocal = dtmfOptions.sendDtmfType;
  } else {
    return "DEFAULT";
  }
  dtmfOptionsLocal = dtmfOptionsLocal.map((x) => x.toUpperCase());
  if ((dtmfOptionsLocal.indexOf('INBAND') !== -1) && (dtmfOptionsLocal.indexOf('OUTBAND') === -1)) {
    return "INBAND";
  } if ((dtmfOptionsLocal.indexOf('INBAND') === -1) && (dtmfOptionsLocal.indexOf('OUTBAND') !== -1)) {
    return "OUTBAND";
  }
  return "DEFAULT";
};

/**
 * Plays HTML audio elements based on element id.
 * @param {String} elementId - audio element id
 */
export const playAudio = function (elementId: string, clientObj?: Client): void {
  try {
    let onEndedCalled = false;
    const retryCounts = DTMF_TONE_PLAY_RETRY_ATTEMPTS;
    const audioElement = document.getElementById(elementId) as HTMLAudioElement;
    // Unmute audio for playing audio during call
    Plivo.log.debug(`${LOGCAT.CALL} | Unmuting audio for element: ${elementId}`);
    audioElement.muted = false;
    let dtmfOption:string = "";
    if (elementId.includes('dtmf')) {
      dtmfOption = getDTMFOption(clientObj?.options.dtmfOptions);
      Logger.debug(`DTMF Options :  ${dtmfOption}`);
    }
    // mute called before DTMF tone play
    if (elementId.includes('dtmf') && clientObj && dtmfOption.toUpperCase() === 'OUTBAND') {
      mute.call(clientObj);
    }
    audioElement.currentTime = 0;

    // function to check if the "onended" emitter got called or not. Keeps retrying
    const checkForDTMFTOne = function (retryCount: number) : void {
      if (retryCount <= 0 && !onEndedCalled) {
        if (clientObj) unmute.call(clientObj);
        onEndedCalled = true;
        return;
      }
      setTimeout(() => {
        if (retryCount > 0 && !onEndedCalled) {
          checkForDTMFTOne(retryCount - 1);
        }
      }, 100);
    };

    const audioPromise = audioElement.play().then(() => {
      Plivo.log.debug(`${LOGCAT.CALL} | Audio played for element: ${elementId}`);
      // onended event called after DTMF play tone is finished playing, unmute called
      if (elementId.includes('dtmf') && dtmfOption.toUpperCase() === 'OUTBAND') {
        audioElement.onended = (() => {
          onEndedCalled = true;
          if (clientObj) unmute.call(clientObj);
        });
      } else if (elementId.includes('dtmf')) {
        Plivo.log.info(`sent inband dtmf`);
      }
    });

    // Avoids unhandled promise rejection while playing audio
    if (audioPromise !== undefined) {
      audioPromise.catch((err) => {
        Plivo.log.error(`${LOGCAT.CALL} | error while playing audio for element: ${elementId}, err: ${err.name}`);
      });
    }

    if (elementId.includes('dtmf') && dtmfOption.toUpperCase() === 'OUTBAND') checkForDTMFTOne(retryCounts);

    Plivo.log.debug(`${LOGCAT.CALL} | playAudio - ${elementId}`);
  } catch (e) {
    Plivo.log.error(
      `${LOGCAT.CALL} | failed to play audio for elementId ${elementId} Cause: ${e}`,
    );
  }
};

/**
 * Stops HTML audio elements based on element id.
 * @param {String} elementId - audio element id
 */
export const stopAudio = function (elementId: string): void {
  try {
    Plivo.log.debug(`${LOGCAT.CALL} | stopping audio for element - ${elementId}`);
    const audioElement = document.getElementById(elementId) as HTMLAudioElement;
    audioElement.pause();
    // Mute audio so that audio can not be played through media keys
    audioElement.muted = true;
    Plivo.log.debug(`${LOGCAT.CALL} | stopAudio - ${elementId}`);
  } catch (e) {
    Plivo.log.error(
      `${LOGCAT.CALL} | failed to stop audio for elementId ${elementId} Cause: ${e}`,
    );
  }
};

/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import {
  AUDIO_DEVICE_ABORT_ERROR_CODE,
  AUDIO_DEVICE_SECURITY_ERROR,
  REMOTE_VIEW_ID,
  RINGBACK_ELEMENT_ID,
  RINGTONE_ELEMENT_ID,
} from '../constants';
import audioVisualize from './audioVisualize';
import { Logger } from '../logger';
import { Client, PlivoObject } from '../client';
import { DeviceAudioInfo } from '../stats/nonRTPStats';
import getBrowserDetails from '../utils/browserDetection';
import { setupRemoteView } from './document';

export interface RingToneDevices {
  set: (id: string) => void;
  get: () => string;
  reset: () => void;
  media: () => HTMLElement | null;
}

export interface InputDevices {
  set: (id: string) => void;
  get: () => string;
  reset: () => void;
}

export interface OutputDevices {
  set: (id: string) => void;
  get: () => string;
  reset: () => void;
  media: (source?: string) => HTMLElement | null;
}

export interface DeviceDictionary {
  devices: MediaDeviceInfo[];
  audioRef: string[];
}

const Plivo: PlivoObject = { log: Logger, audioConstraints: {} };
let clientObject: Client | null = null;
let currentLocalStream: null | MediaStream = null;
let currentAudioState;
let defaultInputGroupId;
let defaultOutputGroupId;
let setByWindows = false;
const setDevice = true;
let settingFromWindows = false;
let addedDevice;
const audioVisual = audioVisualize();
const deviceIdDeviceLableMap = new Map();
let availableAudioDevices: MediaDeviceInfo[] = [];
const availableAudioDevicesDeviceIdGroupIdMap = {};
const groupIdDeviceIdMap = {};
let audioDevDicSetterCb: any = null;
const activeDeviceLabelDeviceIdMap = {};
const activeDeviceIdDeviceLabelMap = {};

const isSafari = /constructor/i.test((window as any).HTMLElement) || ((p) => p.toString() === '[object SafariRemoteNotification]') || (!(window as any).safari || (typeof (window as any).safari !== 'undefined' && (window as any).safari.pushNotification));

/**
 * Add audio constraints to client reference.
 * @param {Client} _clientObject - client reference
 */
export const setAudioContraints = function (_clientObject: Client): void {
  clientObject = _clientObject;
  Plivo.audioConstraints = clientObject.audioConstraints;
};

/**
 * Maintain group id and device id information.
 * @param {Array<MediaDeviceInfo>} audioDeviceList - list of audio devices
 */
const updateGroupIdDeviceIdMap = function (
  audioDeviceList: MediaDeviceInfo[],
): void {
  audioDeviceList.forEach((deviceObject) => {
    if (deviceObject.kind === 'audioinput') {
      availableAudioDevicesDeviceIdGroupIdMap[deviceObject.deviceId] = deviceObject.groupId;
      groupIdDeviceIdMap[deviceObject.groupId] = deviceObject.deviceId;
    }
  });
};

/**
 * Get list of input or output audio devices.
 * @param {String} filterBy - pass input/output to filter the devices
 * @returns Fulfills with a list of audio devices or reject with error
 */
export const availableDevices = function (
  filterBy?: string,
): Promise<MediaDeviceInfo[]> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .enumerateDevices()
      // Array list of all devices
      .then((e) => {
        const list = [];
        e.forEach((dev) => {
          if (filterBy === 'input') {
            if (dev.kind === 'audioinput') {
              list.push(dev as never);
            }
          } else if (filterBy === 'output') {
            if (dev.kind === 'audiooutput') {
              list.push(dev as never);
            }
          } else {
            // push all audio input and output devices
            // eslint-disable-next-line no-lonely-if
            if (!/video/i.test(dev.kind)) {
              list.push(dev as never);
            }
          }
        });
        resolve(list);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Allow media permission forcefully to reveal available devices.
 * @param {String} arg - returns media stream if arg is "returnStream"
 * @returns Fulfills with a media stream if 'returnStream' is passed or resolve with success.
 * If error occurs reject with error.
 */
export const revealAudioDevices = function (
  arg?: string,
): Promise<MediaStream | string> {
  return new Promise((resolve, reject) => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          if (arg === 'returnStream') {
            resolve(stream);
          } else {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
            resolve('success');
          }
        })
        .catch((err) => {
          Plivo.log.error(`failed to get user media :: ${err.name}`);
          reject(err.name);
        });
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('no getUserMedia support');
    }
  });
};

/**
 * Mute the local stream.
 */
export const mute = function (): void {
  if (currentLocalStream) {
    currentLocalStream.getAudioTracks()[0].enabled = false;
  } else {
    this._currentSession.session.mute();
  }
  currentAudioState = false;
};

/**
 * Mute audio state.
 * @param {Client} client - client reference
 */
const updateAudioState = function (client: Client): void {
  mute.call(client);
};

/**
 * Collect realtime Audio levels for local and remote streams.
 * @param {Client} client - client reference
 */
export const startVolumeDataStreaming = function (client: Client): void {
  if (client._currentSession) {
    const pcTemp = client._currentSession.session.connection;
    let localStream: any = null;
    const remoteStream = (pcTemp as any).getRemoteStreams()[0];
    if (currentLocalStream) {
      localStream = currentLocalStream;
      setTimeout(() => {
        audioVisual.start(client, localStream, remoteStream);
      }, 3000);
    } else {
      // eslint-disable-next-line prefer-destructuring
      localStream = (pcTemp as any).getLocalStreams()[0];
      audioVisual.start(client, localStream, remoteStream);
    }
    if (isSafari && localStream.active === false) {
      const deviceLabel = Object.keys(activeDeviceLabelDeviceIdMap)[0];
      const newDeviceId = activeDeviceLabelDeviceIdMap[deviceLabel];
      if (clientObject) {
        clientObject.audio.microphoneDevices.set(newDeviceId);
      }
    }
  }
};

/**
 * Stopping the requesting frame. It would stop emitting the real time audio levels.
 */
export const stopVolumeDataStreaming = function (): void {
  setTimeout(() => {
    if ((window as any)._localContext) {
      (window as any)._localContext.suspend();
    }
    if (audioVisual) {
      audioVisual.stop();
    }
  }, 3000);
};

let replaceAudioTrackForFireFox: (deviceId: string, clientObj: Client, state: string) => {};

/**
 * Updates audio track in active stream after device change.
 * @param {String} deviceId - input or output audio device id
 * @param {Client} client - client reference
 * @param {String} state - specifies if audio device is added or removed
 * @param {String} label - input or output audio device label
 */
const replaceAudioTrack = function (
  deviceId: string, client: Client, state: string, label: string,
): void {
  Plivo.log.debug(`inside replacetrack device id  : ${deviceId}`);
  let sender: any = null;
  let constraints: MediaStreamConstraints;
  let pc: any = null;
  if (client._currentSession) {
    pc = client._currentSession.session.connection;
  } else {
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop());
    } else if (!client.permOnClick) {
      if ((window as any).localStream) {
        (window as any).localStream.getTracks()
          .forEach((track: { stop: () => void; }) => {
            track.stop();
            (window as any).localStream.removeTrack(track);
          });
        (window as any).localStream = null;
      }
    }
    return;
  }
  if (state === 'added') {
    constraints = {
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
      },
      video: false,
    };
  } else {
    let audioConstraints: any = null;
    if (isSafari) {
      const newDeviceId = activeDeviceLabelDeviceIdMap[label];
      audioConstraints = { deviceId: newDeviceId ? { exact: newDeviceId } : undefined };
    } else {
      audioConstraints = true;
    }
    constraints = {
      audio: audioConstraints,
      video: false,
    };
  }
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (pc) {
          // eslint-disable-next-line prefer-destructuring
          sender = pc.getSenders()[0];
          if (currentLocalStream) {
            currentLocalStream.getTracks().forEach((track) => track.stop());
            currentLocalStream = null;
          }
          if (sender) {
            sender.replaceTrack(stream.getAudioTracks()[0]);
            Plivo.log.debug(`replaced sender : ${sender}`);
            currentLocalStream = stream;
            if (currentAudioState === false) {
              updateAudioState(client);
            }
          }
        }
      })
      .catch(() => {})
      .then(() => {
        stopVolumeDataStreaming();
      })
      .then(() => {
        startVolumeDataStreaming(client);
      })
      .catch((err) => {
        Plivo.log.error(err);
      });
  } else {
    Plivo.log.debug('No getUserMedia support');
  }
};

/**
 * Add getters and setters for input audio devices.
 */
export const inputDevices = ((): InputDevices => ({
  set(deviceId) {
    if (typeof deviceId !== 'string') {
      Plivo.log.error('Device id should be string');
      return false;
    }
    const device = availableAudioDevices.filter((d) => d.deviceId === deviceId && d.kind === 'audioinput');
    if (!device.length) {
      Plivo.log.error('Invalid input device id');
      return false;
    }
    if (
      typeof Plivo.audioConstraints === 'object'
      && 'optional' in Plivo.audioConstraints
    ) {
      let updated = false;
      (Plivo.audioConstraints as any).optional.forEach((e: { sourceId: string; }) => {
        if (e.sourceId) {
          e.sourceId = deviceId;
          updated = true;
        }
      });
      if (!updated) {
        (Plivo.audioConstraints as any).optional.push({ sourceId: deviceId });
      }
      updateGroupIdDeviceIdMap(availableAudioDevices);

      if (clientObject && clientObject.getPeerConnection().pc) {
        if (deviceId === 'default') {
          const groupId = availableAudioDevicesDeviceIdGroupIdMap[deviceId];
          // eslint-disable-next-line no-param-reassign
          deviceId = groupIdDeviceIdMap[groupId];
          Plivo.log.debug(deviceId);
          replaceAudioTrack(deviceId, clientObject, 'added', activeDeviceIdDeviceLabelMap[deviceId]);
        } else {
          replaceAudioTrack(deviceId, clientObject, 'added', activeDeviceIdDeviceLabelMap[deviceId]);
        }
      }
    } else if (typeof Plivo.audioConstraints === 'boolean') {
      Plivo.audioConstraints = { deviceId };
    } else {
      (Plivo.audioConstraints as MediaTrackConstraints).deviceId = deviceId;
    }
    return true;
  },
  get() {
    if ((Plivo.audioConstraints as any).optional) {
      const sourceId = (Plivo.audioConstraints as any).optional.filter(
        (e: { sourceId: any; }) => e.sourceId,
      );
      if (sourceId.length > 0) {
        return sourceId[0].sourceId;
      }
      return '';
    }
    if (Plivo.audioConstraints && Plivo.audioConstraints.deviceId) {
      return Plivo.audioConstraints.deviceId;
    }
    return '';
  },
  reset() {
    if ((Plivo.audioConstraints as any).optional) {
      (Plivo.audioConstraints as any).optional = (Plivo.audioConstraints as any).optional.filter(
        (e: { sourceId: any; }) => !e.sourceId,
      );
    } else if (Plivo.audioConstraints && Plivo.audioConstraints.deviceId) {
      delete Plivo.audioConstraints.deviceId;
    }
    return true;
  },
}))();

/**
 * Add getters and setters for output audio devices.
 */
export const outputDevices = ((): OutputDevices => ({
  set(deviceId) {
    const device = availableAudioDevices.filter((d) => d.deviceId === deviceId && d.kind === 'audiooutput');
    if (!device.length) {
      Plivo.log.error('Invalid output device id');
      return false;
    }
    const speakerElement = document.querySelectorAll(
      '[data-devicetype="speakerDevice"]',
    ) as any;
    speakerElement.forEach((e: any) => {
      if (typeof e.sinkId !== 'undefined') {
        e.setSinkId(deviceId)
          .then(() => {})
          .catch((error) => {
            if (error.code === AUDIO_DEVICE_ABORT_ERROR_CODE) {
              e.src = '';
              e.setSinkId(deviceId)
                .then(() => {})
                .catch((error2) => {
                  Plivo.log.error(error2);
                });
            } else {
              let errorMessage: string = error;
              if (error.name === AUDIO_DEVICE_SECURITY_ERROR) {
                errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
              }
              Plivo.log.error(errorMessage);
            }
            return false;
          });
      } else {
        Plivo.log.warn('Browser does not support output device selection.');
      }
      return false;
    });
    if (!settingFromWindows) {
      setByWindows = false;
    }
    return true;
  },
  get() {
    const speakerElement = document.querySelector(
      '[data-devicetype="speakerDevice"]',
    ) as any;
    if (speakerElement.sinkId) return speakerElement.sinkId;
    return null;
  },
  reset() {
    const speakerElement = document.querySelectorAll(
      '[data-devicetype="speakerDevice"]',
    ) as any;
    speakerElement.forEach((e: any) => {
      if (e.setSinkId) {
        e.setSinkId('');
      }
    });
    return true;
  },
  media(source) {
    const sourceMap = {
      dtmf: 'dtmfstar',
      ringback: RINGBACK_ELEMENT_ID,
    };
    if (source && source in sourceMap) {
      return document.getElementById(sourceMap[source]);
    }
    return document.getElementById(RINGBACK_ELEMENT_ID);
  },
}))();

/**
 * Add getters and setters for ringtone which is played during the call.
 */
export const ringtoneDevices = ((): RingToneDevices => ({
  set(deviceId) {
    const device = availableAudioDevices.filter((d) => d.deviceId === deviceId && d.kind === 'audiooutput');
    if (!device.length) {
      Plivo.log.error('Invalid output device id');
      return false;
    }
    const ringToneElement = document.getElementById(RINGTONE_ELEMENT_ID) as any;
    if (ringToneElement.setSinkId) {
      ringToneElement.setSinkId(deviceId);
    }
    return true;
  },
  get() {
    const ringToneElement = document.getElementById(RINGTONE_ELEMENT_ID) as any;
    if (ringToneElement.sinkId) return ringToneElement.sinkId;
    return null;
  },
  reset() {
    const ringToneElement = document.getElementById(RINGTONE_ELEMENT_ID) as any;
    if (ringToneElement.setSinkId) {
      ringToneElement.setSinkId('');
    }
    return true;
  },
  media() {
    return document.getElementById(RINGTONE_ELEMENT_ID);
  },
}))();

/**
 * Add audio device information whenever device is changed.
 * @param {Boolean} store - pass true to store information in Client object for reference
 * @returns Fulfills with audio device information or reject with error
 */
export const audioDevDictionary = function (
  store?: boolean,
): Promise<DeviceDictionary | boolean> {
  return new Promise((resolve, reject) => {
    availableDevices()
      .then((devices) => {
        let audioRef: string[] = [];
        let lableIsPresent = false;
        devices.forEach((dev) => {
          // If device label is not set then audioRef should be null
          if (dev.label) {
            const strObj = JSON.stringify(dev);
            audioRef.push(strObj);
            lableIsPresent = true;
          } else {
            audioRef = [];
          }
        });
        if (store) {
          if (lableIsPresent) availableAudioDevices = devices;
          // Calling audioDevDicSetterCb for backward compatibity
          if (audioDevDicSetterCb) audioDevDicSetterCb(audioRef);
          resolve(true);
        } else {
          resolve({ devices, audioRef }); // If you don't want to store then receive as cb
        }
      })
      .catch((err) => {
        Plivo.log.error('Error availableDevices() ', err);
        reject(err);
      });
  });
};

/**
 * Return if the app consuming Browser SDK is electron app or not.
 */
export const isElectronApp = function (): boolean {
  // Renderer process
  if (typeof window !== 'undefined' && typeof (window as any).process === 'object' && (window as any).process.type === 'renderer') {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  return false;
};

/**
 * Updating the default input & output device
 */
export const updateWindowDeviceList = function (deviceList) : void {
  const groupIdDeviceId = {};
  deviceList.forEach((device) => {
    if (device.kind === 'audioinput' && device.deviceId === 'default') {
      defaultInputGroupId = device.groupId;
    }
    if (device.kind === 'audiooutput') {
      if (device.deviceId === 'default') {
        defaultOutputGroupId = device.groupId;
      }
      groupIdDeviceId[device.groupId] = device.deviceId;
    }
  });
  if (defaultInputGroupId !== defaultOutputGroupId && setDevice) {
    settingFromWindows = true;
    clientObject?.audio.speakerDevices.set(groupIdDeviceId[defaultInputGroupId]);
    setByWindows = true;
    Plivo.log.debug(`Updated the windows audio device with id ${groupIdDeviceId[defaultInputGroupId]}`);
  }
};

/**
 * Check the input & output audio device for windows machine such that both belong to same groupid
 */
export const setAudioDeviceForForWindows = function (devices,
  lastConnectedMicDevice, lastConnectedSpeakerDevice) : void {
  if ((lastConnectedMicDevice === '' || lastConnectedMicDevice === 'default') && (lastConnectedSpeakerDevice === null || lastConnectedSpeakerDevice === 'default' || setByWindows)) {
    updateWindowDeviceList(devices);
  }
};

/**
 * Check if input or output audio device has changed.
 */
export const checkAudioDevChange = function (): void {
  const client: Client = this;
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const isIE = /* @cc_on!@ */ false || !!document['documentMode'];
  const isEdge = !isIE && !!window.StyleMedia;
  const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  const isFirefox = typeof (window as any).InstallTrigger !== 'undefined';
  const isElectron = isElectronApp();
  const lastActiveSpeakerDevice = clientObject ? clientObject.audio.speakerDevices.get() : '';
  const lastConnectedMicDevice = clientObject ? clientObject.audio.microphoneDevices.get() : '';

  audioDevDictionary()
    .then((deviceInfo: DeviceDictionary) => {
      const { devices, audioRef } = deviceInfo;
      if (availableAudioDevices && devices) {
        // Check if device is newly added with devices
        devices.forEach((device) => {
          // update device name : device Id Map
          activeDeviceLabelDeviceIdMap[device.label] = device.deviceId;
          // update device Id : device Name Map
          activeDeviceIdDeviceLabelMap[device.deviceId] = device.label;

          if (
            !availableAudioDevices.filter((a) => a.deviceId === device.deviceId)
              .length
          ) {
            // If not present
            /*
            Setting USB audio device as default in mac sound settings will create below
            1. fire new default device obj for USB audio
            2. fire new device obj with proper lable name for USB audio
            So ignore any new default device object, since we reference point '2'
          */
            if (!/default/i.test(device.deviceId)) {
              client.emit('audioDeviceChange', {
                change: 'added',
                device,
              });
              addedDevice = device.label;
              if (
                device.kind === 'audioinput'
              ) {
                if (isEdge || isChrome || isSafari || isElectron) {
                  replaceAudioTrack(device.deviceId, client, 'added', device.label);
                } else if (isFirefox) {
                  replaceAudioTrackForFireFox(device.deviceId, client, 'added');
                }
              }
            }
          }
        });
        // Check if device is removed with exising audioDic
        availableAudioDevices.forEach((device) => {
          if (!devices.filter((a) => a.deviceId === device.deviceId).length) { // If not present
            // Ignore any default device object which is removed
            if (!/default/i.test(device.deviceId)) {
              client.emit('audioDeviceChange', { change: 'removed', device });
              // update device name : device Id Map
              if (activeDeviceLabelDeviceIdMap[device.label] !== undefined) {
                delete activeDeviceLabelDeviceIdMap[device.label];
                delete activeDeviceIdDeviceLabelMap[device.deviceId];
              }
              if (device.kind === 'audioinput') {
                if (isEdge || isChrome || isSafari || isElectron) {
                  replaceAudioTrack(device.deviceId, client, 'removed', device.label);
                } else if (isFirefox) {
                  replaceAudioTrackForFireFox(device.deviceId, client, 'removed');
                }
              }
              if (device.kind === 'audiooutput' && (lastActiveSpeakerDevice !== '' && lastActiveSpeakerDevice !== 'default') && clientObject) {
                if (!client._currentSession) {
                  const initialRemoteView = document.getElementById(REMOTE_VIEW_ID);
                  initialRemoteView?.remove();
                  setupRemoteView();
                }
                clientObject.remoteView = document.getElementById(REMOTE_VIEW_ID);
                clientObject.audio.speakerDevices.set('default');
              }
            }
          }
        });
      }
      if (!availableAudioDevices) {
        client.emit('audioDeviceChange', { change: '', device: '' });
      }
      if (devices) {
        // Update existing audioDevDic
        availableAudioDevices = devices;
        // Calling audioDevDicSetterCb for backward compatibity
        if (audioDevDicSetterCb) audioDevDicSetterCb(audioRef);
      }
      return ([devices, addedDevice, lastActiveSpeakerDevice, lastConnectedMicDevice]);
    })
    .then((deviceInfo) => {
      const deviceList = deviceInfo[0];
      const newAddedDevice = deviceInfo[1];
      const newLastActiveSpeakerDevice = deviceInfo[2];
      const newLastConnectedMicDevice = deviceInfo[3];
      if (navigator.platform === 'Win32' || navigator.platform === 'Win16' || navigator.platform.toString().toLocaleLowerCase().includes('win')) {
        if (newAddedDevice !== "" && newAddedDevice.toLowerCase().includes('bluetooth')) {
          setAudioDeviceForForWindows(
            deviceList, newLastConnectedMicDevice, newLastActiveSpeakerDevice,
          );
        }
      }
    })
    .then(() => {
      settingFromWindows = false;
    })
    .catch((err) => {
      Plivo.log.error('Error checkAudioDevChange() ', err);
    });
};

/**
 * Unmute the local stream.
 */
export const unmute = function (): void {
  if (currentLocalStream) {
    currentLocalStream.getAudioTracks()[0].enabled = true;
  } else {
    this._currentSession.session.unmute();
  }
  currentAudioState = true;
};

/**
 * Stop all tracks in the local stream.
 */
export const updateAudioDeviceFlags = function (): void {
  if (currentLocalStream) {
    currentLocalStream.getTracks().forEach((track) => track.stop());
  }
  currentLocalStream = null;
};

/**
 * Set the callback which is used for storing list of audio device labels.
 * @param {Function} setter - callback for storing device labels
 */
export const audioDevDicSetter = function (
  setter: (set: any) => void,
): void {
  audioDevDicSetterCb = setter;
};

/**
 * Detect if input or output audio device has changed.
 */
export const detectDeviceChange = function (): void {
  // pool for device change on chrome less than v57
  if (
    this.browserDetails.browser === 'chrome'
    && this.browserDetails.version < 57
  ) {
    setInterval(() => {
      checkAudioDevChange.call(this);
    }, 5000);
  } else {
    navigator.mediaDevices.ondevicechange = () => {
      checkAudioDevChange.call(this);
    };
  }
};

/**
 * Get input and output audio device information to send to plivo stats.
 * @returns Fulfills with audio device information or reject with error
 */
export const getAudioDevicesInfo = function (): Promise<DeviceAudioInfo> {
  return navigator.mediaDevices.enumerateDevices().then((devices) => {
    const deviceInfo: DeviceAudioInfo = {
      noOfAudioInput: 0,
      noOfAudioOutput: 0,
      audioInputLables: '',
      audioOutputLables: '',
      audioInputGroupIds: '',
      audioOutputGroupIds: '',
      audioInputIdSet: this.audio.microphoneDevices.get() || '',
      audioOutputIdSet: this.audio.speakerDevices.get() || '',
      activeInputAudioDevice: '',
      activeOutputAudioDevice: '',
    };
    let activeInputDeviceForSafari: any = null;
    devices.forEach((d) => {
      if (d.deviceId === 'default' && d.kind === 'audioinput') {
        // eslint-disable-next-line
        d['defaultInputDeviceGroupId'] = d.groupId;
      } else if (d.deviceId === 'default' && d.kind === 'audiooutput') {
        // eslint-disable-next-line
        d['defaultOutputDeviceGroupId'] = d.groupId;
      }

      if (d.kind === 'audioinput') {
        deviceIdDeviceLableMap.set(d.deviceId, d.label);
        deviceInfo.noOfAudioInput += 1;
        if (deviceInfo.noOfAudioInput === 1) {
          activeInputDeviceForSafari = d.label;
        }
        deviceInfo.audioInputLables += `${d.label} ,`;
        deviceInfo.audioInputGroupIds += `${d.groupId} ,`;
      } else if (d.kind === 'audiooutput') {
        deviceIdDeviceLableMap.set(d.deviceId, d.label);
        deviceInfo.noOfAudioOutput += 1;
        deviceInfo.audioOutputLables += `${d.label} ,`;
        deviceInfo.audioOutputGroupIds += `${d.groupId} ,`;
      }
    });
    if (deviceInfo.audioInputIdSet === '') {
      deviceInfo.activeInputAudioDevice = deviceIdDeviceLableMap.get('default');
      if (getBrowserDetails().browser === 'safari') {
        deviceInfo.activeInputAudioDevice = activeInputDeviceForSafari;
      }
    } else {
      deviceInfo.activeInputAudioDevice = deviceIdDeviceLableMap.get(
        deviceInfo.audioInputIdSet,
      );
    }
    if (deviceInfo.audioOutputIdSet === '') {
      deviceInfo.activeOutputAudioDevice = deviceIdDeviceLableMap.get(
        'default',
      );
    } else {
      deviceInfo.activeOutputAudioDevice = deviceIdDeviceLableMap.get(
        deviceInfo.audioOutputIdSet,
      );
    }
    return deviceInfo;
  });
};

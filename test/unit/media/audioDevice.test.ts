import * as AudioDevice from '../../../lib/media/audioDevice';
import { Client } from '../../../lib/client';
import { NoiseSuppression } from '../../../lib/rnnoise/NoiseSuppression';

describe('AudioDevice', () => {
  let inputDevice;
  let outputDevice;
  let mediaStream;
  let context;

  beforeAll(() => {
    inputDevice = {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - MacBook Pro Microphone (Built-in)',
      groupId: 'default',
    };
    outputDevice = {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - MacBook Pro Speakers (Built-in)',
      groupId: 'default',
    };
    mediaStream = { getTracks() { return []; }, getAudioTracks() { return [{ enabled: null }]; } };
    mockUserMedia(mediaStream, [inputDevice, outputDevice]);
    context = {
      audioConstraints: {
        optional: [{
          googAutoGainControl: false,
        }],
      },
      audio: {
        microphoneDevices: AudioDevice.inputDevices,
        speakerDevices: AudioDevice.outputDevices,
      },
      enableNoiseReduction: false,
      getPeerConnection: () => ({
        pc: {},
      }),
      _currentSession: {
        startSpeechRecognition() {},
        stopSpeechRecognition() {},
        session: {
          mute() {},
          unmute() {},
          connection: { getSenders() { return [{ replaceTrack() {return new Promise((resolve, reject) => {})} }]; }, catch() {}, getRemoteStreams() { return []; }, getLocalStreams() { return []; } },
        },
      },
    };
    let noiseSuppresion = new NoiseSuppression(context)
    context.noiseSuppresion = noiseSuppresion;
    AudioDevice.setAudioContraints(context as unknown as Client);
    AudioDevice.audioDevDicSetter((d) => {
      context.audioDevDic = d;
    });
    AudioDevice.audioDevDictionary(true);
    createAudioElement('plivo_ringbacktone', 'speakerDevice');
  });

  it('should get list of input audio devices', () => {
    expect(AudioDevice.availableDevices('input')).resolves.toStrictEqual([inputDevice]);
  });

  it('should get list of output audio devices', () => {
    expect(AudioDevice.availableDevices('output')).resolves.toStrictEqual([outputDevice]);
  });

  it('should get list of input and output audio devices', () => {
    expect(AudioDevice.availableDevices()).resolves.toStrictEqual([inputDevice, outputDevice]);
  });

  it('should fail in getting list of audio devices', () => {
    const enumerateFn = jest.spyOn((window as any).navigator.mediaDevices, 'enumerateDevices').mockImplementation(() => Promise.reject('Error in listing devices'));
    expect(AudioDevice.availableDevices()).rejects.toMatch('Error in listing devices');
    enumerateFn.mockRestore();
  });

  it('should get media stream', () => {
    expect(AudioDevice.revealAudioDevices('returnStream')).resolves.toStrictEqual(mediaStream);
  });

  it('should stop tracks in mediastream and resolve', () => {
    expect(AudioDevice.revealAudioDevices()).resolves.toBe('success');
  });

  it('should reject with failed to get user media error', () => {
    const error = {
      name: 'failed to get user media',
    };
    const userMediaFn = jest.spyOn((window as any).navigator.mediaDevices, 'getUserMedia').mockImplementation(() => Promise.reject(error));
    expect(AudioDevice.revealAudioDevices()).rejects.toMatch(error.name);
    userMediaFn.mockRestore();
  });

  it('should reject when media devices is empty object', () => {
    (window as any).navigator.mediaDevices = {};
    expect(AudioDevice.revealAudioDevices()).rejects.toMatch('no getUserMedia support');
    mockUserMedia(mediaStream, [inputDevice, outputDevice]);
  });

  describe('input audio devices', () => {
    it('should set input audio device', () => {
      expect(AudioDevice.inputDevices.get()).not.toBe('default');
      expect(AudioDevice.inputDevices.set('default')).toBeTruthy();
      expect(AudioDevice.inputDevices.get()).toBe('default');
    });

    it('should get input audio device which is being used', () => {
      AudioDevice.inputDevices.set('default');
      expect(AudioDevice.inputDevices.get()).toBe('default');
    });

    it('should reset input audio devices', () => {
      expect(AudioDevice.inputDevices.get()).not.toBe('');
      expect(AudioDevice.inputDevices.reset()).toBeTruthy();
      expect(AudioDevice.inputDevices.get()).toBe('');
    });
  });

  describe('output audio devices', () => {
    beforeAll(() => {
      createAudioElement('dtmfstar', 'speakerDevice');
    });
    it('should set output audio device', () => {
      expect(AudioDevice.outputDevices.get()).not.toBe('default');
      expect(AudioDevice.outputDevices.set('default')).toBeTruthy();
      expect(AudioDevice.outputDevices.get()).toBe('default');
    });

    it('should get output audio device which is being used', () => {
      AudioDevice.outputDevices.set('default');
      expect(AudioDevice.outputDevices.get()).toBe('default');
    });

    it('should reset output audio devices', () => {
      expect(AudioDevice.outputDevices.get()).not.toBe(null);
      expect(AudioDevice.outputDevices.reset()).toBeTruthy();
      expect(AudioDevice.outputDevices.get()).toBe(null);
    });

    it('should get ringback tone media element by default', () => {
      const ringbackToneElement = document.getElementById('plivo_ringbacktone');
      expect(AudioDevice.outputDevices.media()).toBe(ringbackToneElement);
    });

    it('should get dtmf star media element when `dtmfstar` passed as source', () => {
      const dtmfElement = document.getElementById('dtmfstar');
      expect(AudioDevice.outputDevices.media('dtmf')).toBe(dtmfElement);
    });
  });

  describe('ringtone audio devices', () => {
    beforeAll(() => {
      createAudioElement('plivo_ringtone', 'ringtoneDevice');
    });

    it('should set ringtone audio device', () => {
      expect(AudioDevice.ringtoneDevices.get()).not.toBe('default');
      expect(AudioDevice.ringtoneDevices.set('default')).toBeTruthy();
      expect(AudioDevice.ringtoneDevices.get()).toBe('default');
    });

    it('should get ringtone device id which is being used', () => {
      AudioDevice.ringtoneDevices.set('default');
      expect(AudioDevice.ringtoneDevices.get()).toBe('default');
    });

    it('should reset ringtone audio devices', () => {
      expect(AudioDevice.ringtoneDevices.get()).not.toBe(null);
      expect(AudioDevice.ringtoneDevices.reset()).toBeTruthy();
      expect(AudioDevice.ringtoneDevices.get()).toBe(null);
    });

    it('should get ringtone media element', () => {
      const ringToneElement = document.getElementById('plivo_ringtone');
      expect(AudioDevice.ringtoneDevices.media()).toBe(ringToneElement);
    });
  });

  it('should change ondevicechange definition when detectDeviceChange is called', () => {
    context.browserDetails = {
      browser: 'chrome',
      version: 76,
    };
    expect(navigator.mediaDevices.ondevicechange).toBe(undefined);
    AudioDevice.detectDeviceChange.call(context);
    expect(navigator.mediaDevices.ondevicechange).not.toBe(undefined);
  });

  describe('audio device change', () => {
    let newDevice; let deviceEvent; let deviceChange; let
      deviceKind;

    beforeAll(() => {
      newDevice = {
        deviceId: 'f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef',
        kind: null,
        label: 'JBL TUNE 110BT',
        groupId: 'f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef',
      };
      context.emit = (event, data) => {
        deviceEvent = event;
        deviceChange = data.change;
        deviceKind = data.device.kind;
      };
      (window as any).chrome = {
        webstore: {},
        runtime: {},
      };
    });

    it('should detect when input device is added', async () => {
      newDevice.kind = 'audioinput';
      mockUserMedia(mediaStream, [inputDevice, newDevice, outputDevice]);
      AudioDevice.checkAudioDevChange.call(context);
      await new Promise<void>((res) => setTimeout(() => {
        expect(deviceEvent).toBe('audioDeviceChange');
        expect(deviceChange).toBe('added');
        expect(deviceKind).toBe('audioinput');
        res();
      }, 100));
    });

    it('should detect when input device is removed', async () => {
      mockUserMedia(mediaStream, [inputDevice, outputDevice]);
      AudioDevice.audioDevDictionary();
      AudioDevice.mute.call(context);
      AudioDevice.checkAudioDevChange.call(context);
      await new Promise<void>((res) => setTimeout(() => {
        expect(deviceEvent).toBe('audioDeviceChange');
        expect(deviceChange).toBe('removed');
        expect(deviceKind).toBe('audioinput');
        res();
      }, 100));
    });

    it('should detect when output device is added', async () => {
      newDevice.kind = 'audiooutput';
      mockUserMedia(mediaStream, [inputDevice, newDevice, outputDevice]);
      AudioDevice.checkAudioDevChange.call(context);
      await new Promise<void>((res) => setTimeout(() => {
        expect(deviceEvent).toBe('audioDeviceChange');
        expect(deviceChange).toBe('added');
        expect(deviceKind).toBe('audiooutput');
        res();
      }, 100));
    });

    it('should detect when output device is removed', async () => {
      mockUserMedia(mediaStream, [inputDevice, outputDevice]);
      AudioDevice.checkAudioDevChange.call(context);
      await new Promise<void>((res) => setTimeout(() => {
        expect(deviceEvent).toBe('audioDeviceChange');
        expect(deviceChange).toBe('removed');
        expect(deviceKind).toBe('audiooutput');
        res();
      }, 100));
    });
  });

  it('should mute through local stream', () => {
    const muteSpy = jest.spyOn(mediaStream, 'getAudioTracks');
    AudioDevice.mute.call(context);
    expect(muteSpy).toHaveBeenCalledTimes(1);
    muteSpy.mockRestore();
  });

  it('should unmute through local stream', () => {
    const unmuteSpy = jest.spyOn(mediaStream, 'getAudioTracks');
    AudioDevice.unmute.call(context);
    expect(unmuteSpy).toHaveBeenCalledTimes(1);
    unmuteSpy.mockRestore();
  });

  it('should mute through session', () => {
    const audioFlagfn = jest.spyOn(AudioDevice, 'updateAudioDeviceFlags');
    AudioDevice.updateAudioDeviceFlags();
    const muteSpy = jest.spyOn(context._currentSession.session, 'mute');
    AudioDevice.mute.call(context);
    expect(muteSpy).toHaveBeenCalledTimes(1);
    audioFlagfn.mockRestore();
  });

  it('should unmute through session', () => {
    const audioFlagfn = jest.spyOn(AudioDevice, 'updateAudioDeviceFlags');
    AudioDevice.updateAudioDeviceFlags();
    const unmuteSpy = jest.spyOn(context._currentSession.session, 'unmute');
    AudioDevice.unmute.call(context);
    expect(unmuteSpy).toHaveBeenCalledTimes(1);
    audioFlagfn.mockRestore();
  });

  it('should get audio device info for call stats', () => {
    const expected = {
      activeInputAudioDevice: 'Default - MacBook Pro Microphone (Built-in)',
      activeOutputAudioDevice: 'Default - MacBook Pro Speakers (Built-in)',
      audioInputGroupIds: 'default ,',
      audioInputIdSet: 'default',
      audioInputLables: 'Default - MacBook Pro Microphone (Built-in) ,',
      audioOutputGroupIds: 'default ,',
      audioOutputIdSet: 'default',
      audioOutputLables: 'Default - MacBook Pro Speakers (Built-in) ,',
      noOfAudioInput: 1,
      noOfAudioOutput: 1,
      activeInputDeviceGroupId: 'default',
      activeOutputDeviceGroupId: 'default'
    };
    expect(AudioDevice.getAudioDevicesInfo.call(context)).resolves.toStrictEqual(expected);
  });
});

const mockUserMedia = (mediaStream, devices) => {
  (window as any).navigator.mediaDevices = {
    enumerateDevices: () => Promise.resolve(devices),
    getUserMedia: () => Promise.resolve(mediaStream),
  };
};

const createAudioElement = (id, attributeName) => {
  const audioElement = document.createElement('audio') as any;
  audioElement.id = id;
  audioElement.sinkId = id;
  audioElement.setSinkId = (deviceId) => {
    audioElement.sinkId = deviceId;
    return Promise.resolve();
  };
  audioElement.setAttribute('data-devicetype', attributeName);
  document.body.appendChild(audioElement);
};

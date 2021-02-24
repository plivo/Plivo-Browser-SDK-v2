import { handleChromeStats, handleFirefoxSafariStats } from '../../../lib/stats/rtpStats';
import { getChromeStatsResponse, getFirefoxSafariStatsResponse } from '../../mock/RTCStatsResponse';
import rtpStatsResponse from '../../payloads/rtpStatsEvent.json';
import * as AudioDevice from '../../../lib/media/audioDevice';
import { Client } from '../../../lib/client';

describe('RTPStats', () => {
  let stream;
  let context;
  let client;

  let inputDevice;
  let outputDevice;
  let mediaStream;

    beforeEach(() => {
        stream = {codec:'',local:{}, remote:{}, networkType: ''};
        Date.now = jest.fn(() => 1599026892574)
        context = {
            clientScope: {
                browserDetails: {
                    browser: ''
                },
                audioConstraints: {
                  optional: [{
                    googAutoGainControl: false,
                  }],
                },
                options : {
                  enableTracking: true,
                  enableQualityTracking: "ALL"
                },
                audio: {
                  microphoneDevices: AudioDevice.inputDevices,
                  speakerDevices: AudioDevice.outputDevices,
                },
                getPeerConnection: () => ({
                  pc: {},
                }),
                _currentSession: {
                  session: {
                    mute() {},
                    unmute() {},
                    isMuted() {
                      return{}
                    },
                    connection: { getSenders() { return [{ replaceTrack() {} }]; }, getRemoteStreams() { return []; }, getLocalStreams() { return []; } },
                  },
                },
            },
            audioConstraints: {
              optional: [{
                googAutoGainControl: false,
              }],
            },
            packets: {
                prePacketsReceived: null
            },
            options : {
                enableTracking: true,
                enableQualityTracking: "ALL"
            },
            callstatskey: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
            xcallUUID: 'bd4a82d9-e3d6-4a63-92b4-26c63a0b993d',
            callUUID: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
            corelationId: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
            userName: 'testing',
            statsioused: true,
            storage: {
                mosLocalMeasures: [],
                mosRemoteMeasures: [],
                warning: {
                    mosLocalMeasures: null,
                    mosRemoteMeasures: null
                }
            },
            pc: {}
        };
    });

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
      client = {
        audioConstraints: {
          optional: [{
            googAutoGainControl: false,
          }],
        },
        audio: {
          microphoneDevices: AudioDevice.inputDevices,
          speakerDevices: AudioDevice.outputDevices,
        },
        getPeerConnection: () => ({
          pc: {},
        }),
        _currentSession: {
          session: {
            mute() {},
            unmute() {},
            connection: { getSenders() { return [{ replaceTrack() {} }]; }, getRemoteStreams() { return []; }, getLocalStreams() { return []; } },
          },
        },
      }
      mediaStream = { getTracks() { return []; }, getAudioTracks() { return [{ enabled: null }]; } };
      mockUserMedia(mediaStream, [inputDevice, outputDevice]);
      AudioDevice.setAudioContraints(client as unknown as Client);
      AudioDevice.audioDevDicSetter((d) => {
        client.audioDevDic = d;
      });
      AudioDevice.audioDevDictionary(true);
      createAudioElement('plivo_ringbacktone', 'speakerDevice');
    });

    it('should validate chrome stats', () => {
        updateChromeContext(context);
        handleChromeStats.call(context, stream);
        // call second time for collecting basepackets
        handleChromeStats.call(context, stream);
        setTimeout(() => {
          expect(context.collected).toStrictEqual(rtpStatsResponse);
        }, 0)
    });

    it('should validate chrome stats when enableQualityTracking flag is set to remoteonly', () => {
        updateChromeContext(context);
        context.options.enableQualityTracking = "REMOTEONLY";
        handleChromeStats.call(context, stream);
        // call second time for collecting basepackets
        handleChromeStats.call(context, stream);
        setTimeout(() => {
          expect(context.collected).toStrictEqual(rtpStatsResponse);
        }, 0)
    });

    it('should validate chrome stats when enableQualityTracking flag is default and enableTraking is false', () => {
        updateChromeContext(context);
        context.options.enableTracking = false;
        handleChromeStats.call(context, stream);
        // call second time for collecting basepackets
        handleChromeStats.call(context, stream);
        setTimeout(() => {
          expect(context.collected).toStrictEqual(rtpStatsResponse);
        }, 0)
    });


    it('should validate firefox stats', async () => {
        updateFirefoxContext(context);
        handleFirefoxSafariStats.call(context, stream);
        // call second time for collecting basepackets
        handleFirefoxSafariStats.call(context, stream);
        setTimeout(async () => {
          await new Promise<void>(res => setTimeout(() => {
              let expected = JSON.parse(JSON.stringify(rtpStatsResponse));
              expected.local.rtt = 0.026;
              expected.networkType = 'unknown';
              expect(context.collected).toStrictEqual(expected);
              res();
          }, 100))
        }, 0)
    });

  it('should validate firefox stats', async () => {
    updateFirefoxContext(context);
    handleFirefoxSafariStats.call(context, stream);
    // call second time for collecting basepackets
    handleFirefoxSafariStats.call(context, stream);
    setTimeout(async () => {
      await new Promise<void>((res) => setTimeout(() => {
        const expected = JSON.parse(JSON.stringify(rtpStatsResponse));
        expected.local.rtt = 0.026;
        expected.networkType = 'unknown';
        expect(context.collected).toStrictEqual(expected);
        res();
      }, 100));
    }, 0)
  });

  it('should fail with error in getStats local streams API', async () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    context.pc = {
      getSenders: () => [
        {
          getStats: () => Promise.reject('stats not available'),
        },
      ],
      remoteDescription: {
        sdp: 'a=rtpmap:0 opus/8000',
      },
    };
    handleFirefoxSafariStats.call(context, stream);
    setTimeout(async () => {
      await new Promise<void>((res) => setTimeout(() => {
        expect(consoleSpy.mock.calls[0][1]).toMatch(/Error in getStats LocalStreams API/);
        res();
      }, 100));
    }, 0)
  });

  it('should validate safari stats', async () => {
    updateSafariContext(context);
    handleFirefoxSafariStats.call(context, stream);
    // call second time for collecting basepackets
    stream = {
      codec: '', local: {}, remote: {}, networkType: '',
    };
    handleFirefoxSafariStats.call(context, stream);
    setTimeout( async () => {
      await new Promise<void>((res) => setTimeout(() => {
        const expected = JSON.parse(JSON.stringify(rtpStatsResponse));
        expected.codec = 'pcmu';
        expected.networkType = 'unknown';
        expect(context.collected).toStrictEqual(expected);
        res();
      }, 100));
    }, 0)
  });
});

const updateChromeContext = (context: any) => {
  context.pc = {
    getStats: (cb, selector, errback) => {
      cb(getChromeStatsResponse());
    },
  };
  context.clientScope.browserDetails.browser = 'chrome';
};

const updateFirefoxContext = (context: any) => {
  context.pc = {
    getSenders: ffSafariGetStatsMock,
    getReceivers: ffSafariGetStatsMock,
    remoteDescription: {
      sdp: 'a=rtpmap:0 opus/8000',
    },
  };
  context.clientScope.browserDetails.browser = 'firefox';
};

const updateSafariContext = (context: any) => {
  context.pc = {
    getSenders: ffSafariGetStatsMock,
    getReceivers: ffSafariGetStatsMock,
    remoteDescription: {
      sdp: 'a=rtpmap:0 pcmu/8000',
    },
  };
  context.clientScope.browserDetails.browser = 'safari';
};

const ffSafariGetStatsMock = () => [
  {
    getStats: () => Promise.resolve(getFirefoxSafariStatsResponse()),
  },
];

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
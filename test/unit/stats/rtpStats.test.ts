import { resolve } from 'path';
import { handleWebRTCStats } from '../../../lib/stats/rtpStats';
import { getChromeStatsResponse, getFirefoxSafariStatsResponse } from '../../mock/RTCStatsResponse';
import rtpStatsResponse from '../../payloads/rtpStatsEvent.json';

describe('RTPStats', () => {
  let stream;
  let context;

    beforeEach(() => {
        stream = {codec:'',local:{}, remote:{}, networkType: ''};
        Date.now = jest.fn(() => 1599026892574)
        context = {
            clientScope: {
                browserDetails: {
                    browser: ''
                },
                timeTakenForStats: {
                  mediaSetup:{
                    init: 0,
                    end: 0
                  },
                  pdd:{
                    init: 0,
                    end: 0
                  },
                }
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

    it('should validate chrome stats', async () => {
        updateChromeContext(context);
        handleWebRTCStats.call(context, stream);
        // call second time for collecting basepackets
        handleWebRTCStats.call(context, stream);
        await new Promise<void>(res => setTimeout(() => {
          let expected = JSON.parse(JSON.stringify(rtpStatsResponse));
          expect(context.collected).toStrictEqual(expected);
          res();
      }, 100))    
    });

    it('should validate chrome stats when enableQualityTracking flag is set to remoteonly', async () => {
        updateChromeContext(context);
        context.options.enableQualityTracking = "REMOTEONLY";
        handleWebRTCStats.call(context, stream);
        // call second time for collecting basepackets
        handleWebRTCStats.call(context, stream);
        await new Promise<void>(res => setTimeout(() => {
          let expected = JSON.parse(JSON.stringify(rtpStatsResponse));
          expect(context.collected).toStrictEqual(expected);
          res();
      }, 100))    
    });

    it('should validate chrome stats when enableQualityTracking flag is default and enableTraking is false', async () => {
        updateChromeContext(context);
        context.options.enableTracking = false;
        handleWebRTCStats.call(context, stream);
        // call second time for collecting basepackets
        handleWebRTCStats.call(context, stream);
        console.log(context.collected);
        await new Promise<void>(res => setTimeout(() => {
          let expected = JSON.parse(JSON.stringify(rtpStatsResponse));
          expect(context.collected).toStrictEqual(expected);
          res();
      }, 100))    });


    it('should validate firefox stats', async () => {
        updateFirefoxContext(context);
        handleWebRTCStats.call(context, stream);
        // call second time for collecting basepackets
        handleWebRTCStats.call(context, stream);
        await new Promise<void>(res => setTimeout(() => {
            let expected = JSON.parse(JSON.stringify(rtpStatsResponse));
            expected.local.rtt = 0.026;
            expected.networkType = 'unknown';
            expected.remote.jitterBufferDelay = null;
            expected.local.googEchoCancellationReturnLossEnhancement = null;
            expected.local.googEchoCancellationReturnLoss = null;
            expected.mediaSetupTime = 0;
            expected.pdd = 0;
            expected.remote.googJitterBufferMs= null;
            expected.remote.packetsDiscarded= null;
            expected.local.audioLevel = -100;
            expected.remote.audioLevel = -100;
            expect(context.collected).toStrictEqual(expected);
            res();
        }, 100))
    });

  it('should validate firefox stats', async () => {
    updateFirefoxContext(context);
    handleWebRTCStats.call(context, stream);
    // call second time for collecting basepackets
    handleWebRTCStats.call(context, stream);
    await new Promise<void>((res) => setTimeout(() => {
      const expected = JSON.parse(JSON.stringify(rtpStatsResponse));
      expected.local.rtt = 0.026;
      expected.networkType = 'unknown';
      expected.remote.jitterBufferDelay = null;
      expected.local.googEchoCancellationReturnLossEnhancement = null;
      expected.local.googEchoCancellationReturnLoss = null;
      expected.mediaSetupTime = 0;
      expected.pdd = 0;
      expected.remote.googJitterBufferMs= null;
      expected.remote.packetsDiscarded= null;
      expected.local.audioLevel = -100;
      expected.remote.audioLevel = -100;
      expect(context.collected).toStrictEqual(expected);
      res();
    }, 100));
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
    handleWebRTCStats.call(context, stream);
    await new Promise<void>((res) => setTimeout(() => {
      expect(consoleSpy.mock.calls[0][1]).toMatch(/Error in getStats LocalStreams API/);
      res();
    }, 100));
  });

  it('should validate safari stats', async () => {
    updateSafariContext(context);
    handleWebRTCStats.call(context, stream);
    // call second time for collecting basepackets
    stream = {
      codec: '', local: {}, remote: {}, networkType: '',
    };
    handleWebRTCStats.call(context, stream);
    await new Promise<void>((res) => setTimeout(() => {
      const expected = JSON.parse(JSON.stringify(rtpStatsResponse));
      expected.codec = 'pcmu';
      expected.networkType = 'unknown';
      expected.remote.jitterBufferDelay = null;
      expected.local.googEchoCancellationReturnLossEnhancement = null;
      expected.local.googEchoCancellationReturnLoss = null;
      expected.mediaSetupTime = 0;
      expected.pdd = 0;
      expected.remote.googJitterBufferMs= null;
      expected.remote.packetsDiscarded= null;
      expected.local.audioLevel = -100;
      expected.remote.audioLevel = -100;
      expect(context.collected).toStrictEqual(expected);
      res();
    }, 100));
  });
});

const updateChromeContext = (context: any) => {
  context.pc = {
    getSenders: chromeGetStatsMock,
    getReceivers: chromeGetStatsMock,
    remoteDescription: {
      sdp: 'a=rtpmap:0 opus/8000',
    },
  }
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

const chromeGetStatsMock = () => [
  {
    getStats: () => Promise.resolve(getChromeStatsResponse()),
  },
];

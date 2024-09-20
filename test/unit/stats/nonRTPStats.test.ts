import * as nonRTPStats from '../../../lib/stats/nonRTPStats';
import { StatsSocket } from '../../../lib/stats/ws';
import { getSDKVersion, getSdkVersionPre } from '../../../lib/utils/device';
import WebSocket from '../../mock/WebSocket';
import pkg from '../../../package.json';
import nonRTPStatsResponse from '../../payloads/nonRTPStatsEvent';
import { NoiseSuppression } from '../../../lib/rnnoise/NoiseSuppression';

describe('NonRTPStats', () => {
  let context;
  let deviceInfo;
  let signallingInfo;
  let mediaConnectionInfo;
  let callSession;
  let callInfoObj;

  beforeAll(() => {
    context = {
      userName: 'testing',
      _currentSession: {
        sipCallID: 'b5a8119abmvsdagfsf',
        callUUID: '96b08f37-5b9c-4105-b072-b64821ce28e5',
      },
      options: {
        debug: 'ALL',
      },
      enableNoiseReduction: false,
      callstatskey: null,
      statsSocket: null,
      callStats: null,
    };
    deviceInfo = {
      activeInputAudioDevice: 'Default - MacBook Pro Speakers (Built-in)',
      activeOutputAudioDevice: 'Default - MacBook Pro Speakers (Built-in)',
      audioInputGroupIds: 'f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,',
      audioInputLables: 'Default - MacBook Pro Microphone (Built-in) ,MacBook Pro Microphone (Built-in) ,',
      audioOutputGroupIds: 'f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,',
      audioOutputLables: 'Default - MacBook Pro Speakers (Built-in) ,MacBook Pro Speakers (Built-in) ,',
    };
    signallingInfo = {
      answer_time: 1598624425593,
      call_confirmed_time: 1598624425606,
      call_initiation_time: 1598624416233,
      hangup_party: 'local',
      hangup_reason: 'Terminated',
      hangup_time: 1598624430625,
      post_dial_delay: 3006,
      ring_start_time: 1598624419239,
    };
    mediaConnectionInfo = {
      ice_connection_state_checking: 1598624419243,
      ice_connection_state_connected: 1598624419285,
      stream_success: 1598624419244,
    };
    callInfoObj = {
      callstats_key: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
      callUUID: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
      corelationId: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
      xcallUUID: 'bd4a82d9-e3d6-4a63-92b4-26c63a0b993d',
      timeStamp: 1599026892574,
      userName: context.userName,
      domain: 'phone.plivo.com',
      source: 'BrowserSDK',
      version: 'v1',
    };
    callSession = {
      sipCallID: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
      callUUID: 'bd4a82d9-e3d6-4a63-92b4-26c63a0b993d',
    };
    Date.now = jest.fn(() => 1599026892574);
    (window as any).WebSocket = WebSocket;
    delete (window as any).HTMLElement;
    const sdkVersionParse = getSDKVersion();
    let noiseSuppresion = new NoiseSuppression(context)
    context.noiseSuppresion = noiseSuppresion;
    updateSDKVersions(sdkVersionParse);
  });

  beforeEach(() => {
    context.callstatskey = callInfoObj.callstats_key;
    context.statsSocket = new StatsSocket();
    context.statsSocket.connect();
    context.callStats = {
      reportError() {},
      webRTCFunctions: {
        applicationLog: null,
      },
    };
    jest.clearAllMocks();
  });

  it('should send call answered event for incoming call', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    nonRTPStats.sendCallAnsweredEvent.call(context, deviceInfo, true);
    expect(sendFn).toHaveBeenCalledTimes(1);
    const message = context.statsSocket.ws.message;
    message.timeStamp = 1599026892574;
    const testOs = process.env.USERAGENT_OS;
    console.log("OS AGENT", testOs)
    if (message.userAgent !== `Mozilla/5.0 (${testOs}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`) {
      message.userAgent = `Mozilla/5.0 (${testOs}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`;
    }
    expect(message).toEqual(nonRTPStatsResponse.ANSWER_EVENT);
  });

  it('should send call answered event for outgoing call', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    nonRTPStats.sendCallAnsweredEvent.call(context, null, false);
    expect(sendFn).toHaveBeenCalledTimes(1);
    delete (nonRTPStatsResponse.ANSWER_EVENT as any).audioDeviceInfo;
    nonRTPStatsResponse.ANSWER_EVENT.info = 'Outgoing call answered';
    const message = context.statsSocket.ws.message;
    message.timeStamp = 1599026892574;
    const testOs = process.env.USERAGENT_OS;
    if (message.userAgent !== `Mozilla/5.0 (${testOs}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`) {
      message.userAgent = `Mozilla/5.0 (${testOs}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`;
    }
    expect(message).toStrictEqual(nonRTPStatsResponse.ANSWER_EVENT);
  });

  it('should not send call answered event when callstatskey is missing', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    context.callstatskey = null;
    nonRTPStats.sendCallAnsweredEvent.call(context, deviceInfo, false);
    expect(sendFn).toHaveBeenCalledTimes(0);
    expect(context.statsSocket.ws.message).toMatch('');
  });

  it('should not send events when stats socket is null', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    context.statsSocket = null;
    nonRTPStats.sendCallAnsweredEvent.call(context, deviceInfo, false);
    expect(sendFn).toHaveBeenCalledTimes(0);
  });

  it('should send call summary event', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    nonRTPStats.sendCallSummaryEvent.call(context, deviceInfo, signallingInfo, mediaConnectionInfo, context._currentSession);
    expect(sendFn).toHaveBeenCalledTimes(1);
  });

  it('should not send call summary event when callstatskey is missing', () => {
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    context.callstatskey = null;
    nonRTPStats.sendCallSummaryEvent.call(context, deviceInfo, signallingInfo, mediaConnectionInfo, context._currentSession);
    expect(sendFn).toHaveBeenCalledTimes(0);
    expect(context.statsSocket.ws.message).toMatch('');
  });

  it('should add callinfo to stats', () => {
    expect(nonRTPStats.addCallInfo(callSession, {} as any, callInfoObj.callstats_key, callInfoObj.userName, 1599026892574)).toStrictEqual(callInfoObj);
  });

  it('should send user feedback to stats socket', () => {
    const feedback = {
      overall: 4,
      comment: 'audio_lag Good',
    };
    const expectedMsg = {
      msg: 'FEEDBACK', info: feedback, sdkVersion: pkg.version, ...callInfoObj,
    };
    const sendFn = jest.spyOn(context.statsSocket.ws, 'send');
    nonRTPStats.sendFeedbackEvent.call(context, callSession, feedback);
    expect(sendFn).toBeCalledTimes(1)
    // expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should get error reason based on error code', () => {
    expect(nonRTPStats.signallingEvent(404)).toBe('Call authorization failed');
    expect(nonRTPStats.signallingEvent(501)).toBe('Incompatible client configuration');
    expect(nonRTPStats.signallingEvent(487)).toBe('Call cancelled by caller');
    expect(nonRTPStats.signallingEvent(484)).toBe('Invalid destination format');
    expect(nonRTPStats.signallingEvent(500)).toBe('Internal Server Error');
  });

  it('should send ice failure message to stats socket', () => {
    const error = 'ice_timeout';
    const expectedMsg = { msg: 'ICE_FAILURE', error, ...callInfoObj };
    nonRTPStats.onIceFailure.call(context, callSession, new Error(error));
    context.statsSocket.ws.message.timeStamp = 1599026892574;
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should send media failure message to stats socket', () => {
    const error = 'PermissionDeniedError';
    const expectedMsg = { msg: 'MEDIA_FAILURE', error, ...callInfoObj };
    nonRTPStats.onMediaFailure.call(context, callSession, new Error(error));
    context.statsSocket.ws.message.timeStamp = 1599026892574;
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should send sdp failure message to stats socket', () => {
    const error = 'createofferfailed';
    const expectedMsg = { msg: 'SDP_FAILURE', error, ...callInfoObj };
    nonRTPStats.onSDPfailure.call(context, callSession, new Error(error));
    context.statsSocket.ws.message.timeStamp = 1599026892574;
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should send toggle mute message to stats socket', () => {
    const action = 'mute';
    const expectedMsg = { msg: 'TOGGLE_MUTE', action, ...callInfoObj };
    nonRTPStats.onToggleMute.call(context, callSession, action);
    context.statsSocket.ws.message.timeStamp = 1599026892574;
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should send app error', () => {
    const reportErrorFn = jest.spyOn(context.callStats, 'reportError');
    const err = { name: 'hangup', message: 'hangup initialized', method: 'hangup()' };
    nonRTPStats.AppError.call(context, err, true);
    expect(reportErrorFn).toHaveBeenCalledTimes(1);
  });

  it('should not send app error when username and callstats.io is null', () => {
    const reportErrorFn = jest.spyOn(context.callStats, 'reportError');
    context.userName = null;
    context.callStats = null;
    const err = { name: 'hangup', message: 'hangup initialized', method: 'hangup()' };
    nonRTPStats.AppError.call(context, err, true);
    expect(reportErrorFn).toHaveBeenCalledTimes(0);
  });
});

const updateSDKVersions = (sdkVersionParse) => {
  nonRTPStatsResponse.ANSWER_EVENT.sdkVersionMajor = sdkVersionParse.major;
  nonRTPStatsResponse.ANSWER_EVENT.sdkVersionMinor = sdkVersionParse.minor;
  nonRTPStatsResponse.ANSWER_EVENT.sdkVersionPatch = sdkVersionParse.patch;
  nonRTPStatsResponse.ANSWER_EVENT.sdkVersionPre = getSdkVersionPre(sdkVersionParse) === '' ? 'beta.0' : getSdkVersionPre(sdkVersionParse);
  nonRTPStatsResponse.SUMMARY_EVENT.sdkVersionMajor = sdkVersionParse.major;
  nonRTPStatsResponse.SUMMARY_EVENT.sdkVersionMinor = sdkVersionParse.minor;
  nonRTPStatsResponse.SUMMARY_EVENT.sdkVersionPatch = sdkVersionParse.patch;
  nonRTPStatsResponse.SUMMARY_EVENT.sdkVersionPre = sdkVersionParse.pre;
};

const ANSWER_EVENT = {
  msg: "CALL_ANSWERED",
  info: "Incoming call answered",
  clientName: "Not a supported browser.",
  userAgent:
    `Mozilla/5.0 (${process.env.USERAGENT_OS}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`,
  clientVersionMajor: "4",
  clientVersionMinor: "0",
  clientVersionPatch: "0",
  sdkName: "plivo-browser-sdk",
  sdkVersionMajor: 2,
  sdkVersionMinor: 1,
  sdkVersionPatch: 31,
  devicePlatform: "",
  deviceOs: "Unknown OS",
  setupOptions: {
    debug: "ALL",
  },
  audioDeviceInfo: {
    activeInputAudioDevice: "Default - MacBook Pro Speakers (Built-in)",
    activeOutputAudioDevice: "Default - MacBook Pro Speakers (Built-in)",
    audioInputGroupIds:
      "f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,",
    audioInputLables:
      "Default - MacBook Pro Microphone (Built-in) ,MacBook Pro Microphone (Built-in) ,",
    audioOutputGroupIds:
      "f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,",
    audioOutputLables:
      "Default - MacBook Pro Speakers (Built-in) ,MacBook Pro Speakers (Built-in) ,",
  },
  callstats_key: "fb85a852-e7be-11ea-b940-5b5a84a8b39b",
  callUUID: "b5a8119abmvsdagfsf",
  corelationId: "b5a8119abmvsdagfsf",
  xcallUUID: "96b08f37-5b9c-4105-b072-b64821ce28e5",
  timeStamp: 1599026892574,
  userName: "testing",
  domain: "phone.plivo.com",
  source: "BrowserSDK",
  noiseReduction: {
    enabled: false,
    noiseSuprressionStarted: false,
  },
  version: "v1",
};

const SUMMARY_EVENT = {
  msg: "CALL_SUMMARY",
  signalling: {
    answer_time: 1598624425593,
    call_confirmed_time: 1598624425606,
    call_initiation_time: 1598624416233,
    hangup_party: "local",
    hangup_reason: "Terminated",
    hangup_time: 1598624430625,
    post_dial_delay: 3006,
    ring_start_time: 1598624419239,
  },
  mediaConnection: {
    ice_connection_state_checking: 1598624419243,
    ice_connection_state_connected: 1598624419285,
    stream_success: 1598624419244,
  },
  clientName: "Not a supported browser.",
  userAgent:
    `Mozilla/5.0 (${process.env.USERAGENT_OS}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0`,
  clientVersionMajor: "4",
  clientVersionMinor: "0",
  clientVersionPatch: "0",
  sdkName: "plivo-browser-sdk",
  sdkVersionMajor: 2,
  sdkVersionMinor: 1,
  sdkVersionPatch: 31,
  devicePlatform: "",
  deviceOs: "Unknown OS",
  setupOptions: {
    debug: "ALL",
  },
  audioDeviceInfo: {
    activeInputAudioDevice: "Default - MacBook Pro Speakers (Built-in)",
    activeOutputAudioDevice: "Default - MacBook Pro Speakers (Built-in)",
    audioInputGroupIds:
      "f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,",
    audioInputLables:
      "Default - MacBook Pro Microphone (Built-in) ,MacBook Pro Microphone (Built-in) ,",
    audioOutputGroupIds:
      "f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,f327844e976aff304ae49488035945128ad7610b78b1f1e39c3f460a9a6ac1ef ,",
    audioOutputLables:
      "Default - MacBook Pro Speakers (Built-in) ,MacBook Pro Speakers (Built-in) ,",
  },
  callstats_key: "fb85a852-e7be-11ea-b940-5b5a84a8b39b",
  callUUID: "b5a8119abmvsdagfsf",
  corelationId: "b5a8119abmvsdagfsf",
  xcallUUID: "96b08f37-5b9c-4105-b072-b64821ce28e5",
  timeStamp: 1599026892574,
  userName: "testing",
  domain: "phone.plivo.com",
  source: "BrowserSDK",
  noiseReduction: {
    enabled: false,
    noiseSuprressionStarted: false,
  },
  version: "v1",
};

module.exports.ANSWER_EVENT = ANSWER_EVENT
module.exports.SUMMARY_EVENT = SUMMARY_EVENT
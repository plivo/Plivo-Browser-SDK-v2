/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-var */
/* eslint-disable import/no-mutable-exports */

// Signalling
export const DOMAIN = 'phone.plivo.com';
export const WS_SERVERS = ['wss://client.plivo.com/signalling', 'wss://client-fb.plivo.com/signalling'];

// SDK option settings
export const DEFAULT_LOG_LEVEL = 'INFO';
export const DEFAULT_ENABLE_QUALITY_TRACKING = 'ALL';
export const ENABLE_QUALITY_TRACKING_ALLOWED_VALUES = ['ALL', 'NONE', 'REMOTEONLY', 'LOCALONLY'];
export const LOCALONLY = 'LOCALONLY';
export const REMOTEONLY = 'REMOTEONLY';
export const AUDIO_CONSTRAINTS = {
  optional: [{
    googAutoGainControl: false,
  }],
};
export const DEFAULT_DTMFOPTIONS = {
  sendDtmfType: ['INBAND', 'OUTBAND'],
};
// webrtc settings
export const NUMBER_OF_SIMULTANEOUS_INCOMING_CALLS_ALLOWED = 50;
export const REGISTER_EXPIRES_SECONDS = 120;
export const SESSION_TIMERS_EXPIRES = 300;
export const WS_RECOVERY_MAX_INTERVAL = 20;
export const WS_RECOVERY_MIN_INTERVAL = 2;
export const DEFAULT_MDNS_CANDIDATE = '192.168.0.1';
export const ICE_GATHERING_TIMEOUT = 2000;
export const ICE_RECONNECT_INTERVAL = 2000;
export const ICE_RECONNECT_COUNT = 5;
export const NETWORK_CHANGE_INTERVAL = 10000;
export const STUN_SERVERS = [
  'stun:stun.plivo.com:3408',
  'stun:stun.l.google.com:19302',
];

export const SOCKET_SEND_STATS_RETRY_SECONDS_COUNT = 1;
export const SOCKET_SEND_STATS_RETRY_ATTEMPTS = 5;
export const DTMF_TONE_PLAY_RETRY_ATTEMPTS = 4;

export const SIP_ERROR_CODE = {
  486: 'User was busy',
  408: 'No response from user',
  480: 'No response from user',
  603: 'Call rejected by user',
  484: 'Invalid destination format',
  503: 'Network issue while connecting the call',
  501: 'Incompatible client configuration',
  487: 'Call cancelled by caller',
  400: 'Bad request - Parameters not valid',
  401: 'Call authorization failed',
  403: 'Call authorization failed',
  404: 'Call authorization failed',
  405: 'Call authorization failed',
  483: 'Too many hops detected for call connection',
  500: 'Internal Server Error',
  502: 'There is an issue with the Carrier Gateway',
};

// Options
export const DEFAULT_CODECS = ['OPUS', 'PCMU'];
export const DTMF_OPTIONS = ['INBAND', 'OUTBAND'];
export const CONSOLE_LOGS_BUFFER_SIZE = 900;
export const MAX_AVERAGE_BITRATE = 48000;
export const MIN_AVERAGE_BITRATE = 8000;
export const REGION = [
  'usa_west',
  'usa_east',
  'australia',
  'europe',
  'asia',
  'south_america',
];
export const DEBUG_MODES = [
  'INFO',
  'DEBUG',
  'WARN',
  'ERROR',
  'ALL',
  'ALL-PLAIN',
  'OFF',
];
export const DEFAULT_COMMENTS = {
  AUDIO_LAG: 'audio_lag',
  BROKEN_AUDIO: 'broken_audio',
  CALL_DROPPED: 'call_dropped',
  CALLERID_ISSUES: 'callerid_issue',
  DIGITS_NOT_CAPTURED: 'digits_not_captured',
  ECHO: 'echo',
  HIGH_CONNECT_TIME: 'high_connect_time',
  LOW_AUDIO_LEVEL: 'low_audio_level',
  ONE_WAY_AUDIO: 'one_way_audio',
  OTHERS: 'others',
  ROBOTIC_AUDIO: 'robotic_audio',
};

// Media
export const RINGTONE_URL = 'https://cdn.plivo.com/sdk/browser/audio/us-ring.mp3';
// same url with a parameter for workaround for chrome bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=770694
export const RINGBACK_URL = 'https://cdn.plivo.com/sdk/browser/audio/us-ring.mp3?v=ringback';
export const CONNECT_TONE_URL = 'https://cdn.plivo.com/sdk/browser/audio/connect-tone.mp3';
export const SILENT_TONE_URL = 'https://cdn.plivo.com/sdk/browser/audio/silent-audio.mp3';
export const SELF_VIEW_ID = 'plivo_webrtc_selfview';
export const REMOTE_VIEW_ID = 'plivo_webrtc_remoteview';
export const RINGBACK_ELEMENT_ID = 'plivo_ringbacktone';
export const RINGTONE_ELEMENT_ID = 'plivo_ringtone';
export const CONNECT_TONE_ELEMENT_ID = 'plivo_connect_tone';
export const SILENT_TONE_ELEMENT_ID = 'plivo_silent_tone';
export const AUDIO_DEVICE_ABORT_ERROR_CODE = 20;
export const AUDIO_DEVICE_SECURITY_ERROR = 'SecurityError';
export const DTMF_TONE_FLAG = {
  0: true,
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
  '#': true,
  '*': true,
};

// Stats
export const S3BUCKET_API_URL = 'https://stats.plivo.com/v1/browser/bucketurl/';
export const STATSSOCKET_URL = 'wss://insights.plivo.com/ws';
export const STATS_API_URL = 'https://stats.plivo.com/v1/browser/validate/';
export const SDKVERSION_API_URL = "https://stats.plivo.com/v1/browser/websdkversion/";
export const STATS_API_URL_ACCESS_TOKEN = 'https://stats.plivo.com/v1/browser/validate/jwt/';
export const S3BUCKET_API_URL_JWT = 'https://stats.plivo.com/v1/browser/bucketurl/jwt/';
export const STATS_SOURCE = 'BrowserSDK';
export const STATS_VERSION = 'v1';
export const GETSTATS_INTERVAL = 5000;
export const AUDIO_INTERVAL = 1000;
export const GETSTATS_HEARTBEATINTERVAL = 100000;
export const STATSSOCKET_RECONNECT_SEC = 10000;
export const STATS_ANALYSIS_WAIT_TIME = 5000;
export const NETWORK_CHANGE_INTERVAL_IDLE_STATE = 10000;
export const NETWORK_CHANGE_INTERVAL_ON_CALL_STATE = 4000;
export const MESSAGE_CHECK_TIMEOUT_IDLE_STATE = 5000;
export const MESSAGE_CHECK_TIMEOUT_ON_CALL_STATE = 2000;
export const IP_ADDRESS_FETCH_RETRY_COUNT = 10;

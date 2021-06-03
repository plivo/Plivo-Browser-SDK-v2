/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
/* eslint func-names: ["error", "as-needed"] */
/* eslint-disable no-underscore-dangle */
import { Client, Storage, PlivoObject } from '../client';
import * as C from '../constants';
import { AudioLevel } from '../media/audioLevel';
import { processStreams } from './mediaMetrics';
import { Logger } from '../logger';
import { CallSession } from '../managers/callSession';

export interface StatsLocalStream {
  ssrc?: number;
  packetsLost?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  jitter?: number | null;
  audioLevel?: number;
  rtt?: number | null;
  mos?: number | null;
  fractionLoss?: number;
  audioInputLevel?: number;
  audioOutputLevel?: number;
  bytesSent?: number;
  packetsSent?: number;
  googJitterReceived?: number;
  googRtt?: number;
}

export interface StatsRemoteStream {
  ssrc?: number;
  packetsLost?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  jitter?: number | null;
  audioLevel?: number;
  fractionLoss?: number;
  audioInputLevel?: number;
  audioOutputLevel?: number;
  googJitterReceived?: number;
  googRtt?: number;
  jitterBufferDelay?: number;
}

export interface StatsObject {
  msg: string;
  callstats_key: string;
  local: StatsLocalStream;
  remote: StatsRemoteStream;
  codec: string;
  xcallUUID: string;
  callUUID: string;
  corelationId: string;
  userName: string;
  timeStamp: number;
  domain: string;
  source: string;
  version: string;
  networkType: string;
  networkEffectiveType: string;
  networkDownlinkSpeed: number;
  statsIOUsed: boolean;
  pdd?: number;
  mediaSetupTime?: number;
}

interface RtpStatsStream {
  codec: string;
  local: StatsLocalStream;
  remote: StatsRemoteStream;
  networkType: string;
  gotNetworkType?: boolean;
}

const Plivo: PlivoObject = { log: Logger };

/**
 * Add two numbers.
 * @param {Number} oldVal - previous stat value
 * @param {Number} newVal - latest stat value
 * @returns Sum of two numbers
 */
const getSum = function (oldVal: number | null, newVal: number | null): number | null {
  if ((oldVal == null || isNaN(oldVal)) && (newVal == null || isNaN(newVal))) {
    return null;
  }
  if (oldVal == null || isNaN(oldVal)) {
    return newVal;
  }
  if (newVal == null || isNaN(newVal)) {
    return oldVal;
  }
  return oldVal + newVal;
};

/**
 * Collect audio levels every second for local and remote streams.
 */
const startAudioTimer = function (): void {
  const getStatsRef: GetRTPStats = this;
  getStatsRef.audioTimer = setInterval(() => {
    // Check if the stream is active or not.
    // If stream is not active, fetch the current active stream and assign to audio helper
    if (getStatsRef.senderMediaStream && getStatsRef.senderMediaStream.active === false) {
      getStatsRef.senderMediaStream.getTracks().forEach((track) => track.stop());
      getStatsRef.senderMediaStream = null;
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        }).then((stream) => stream).then((stream) => {
          getStatsRef.senderMediaStream = stream;
          getStatsRef.localAudioLevelHelper = new AudioLevel(getStatsRef.senderMediaStream);
        });
      }
    }

    if (!getStatsRef.clientScope.isCallMuted) {
      getStatsRef.audioInputLevel = getSum(
        getStatsRef.audioInputLevel,
        getStatsRef.localAudioLevelHelper.getAudioLevel(),
      );
      getStatsRef.audioInputCount += 1;
    }
    getStatsRef.audioOutputLevel = getSum(
      getStatsRef.audioOutputLevel,
      getStatsRef.remoteAudioLevelHelper.getAudioLevel(),
    );
    getStatsRef.audioOutputCount += 1;
  }, C.AUDIO_INTERVAL);
};

/**
 * Reset audio level variables.
 */
const clearAudioSamples = function (): void {
  const getStatsRef: GetRTPStats = this;
  getStatsRef.audioInputLevel = null;
  getStatsRef.audioOutputLevel = null;
  getStatsRef.audioInputCount = 0;
  getStatsRef.audioOutputCount = 0;
};

/**
 * Convert stat value to other data type or handle not a number value.
 * @param {Number} value - stat value
 * @param {String} type - data type to convert the value
 * @param {Number} defaultVal - use default value when value is not a number
 * @param {Boolean} useDefault - decide the usage of default value
 */
const handleStat = function (
  value: number | null,
  type: string = 'int',
  defaultVal: number | null = value,
  useDefault: boolean = false,
): number {
  let result: number | any;
  if (value == null || isNaN(value)) {
    result = useDefault ? defaultVal : value;
    return result;
  }
  result = type === 'int' ? Number(value) : Number(Number(value).toFixed(3));
  return result;
};

/**
 * Handle value when it is not a number.
 * @param {Number} value - stat value
 * @param {Number} defaultVal - use default value when value is not a number
 * @param {Boolean} useDefault - decide the usage of default value
 */
const handleNull = function (
  value?: number,
): number | null {
  if (value == null || isNaN(value)) {
    return null;
  }
  return value;
};

/**
 * Store previous stat packets information.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 */
function basePackets(stream: RtpStatsStream): void {
  (this as GetRTPStats).packets.prePacketsReceived = handleStat(
    handleNull(stream.remote.packetsReceived),
  );
  (this as GetRTPStats).packets.prePacketsSent = handleStat(
    handleNull(stream.local.packetsSent),
  );
  (this as GetRTPStats).packets.preRemotePacketsLoss = handleStat(
    handleNull(stream.remote.packetsLost),
  );
  (this as GetRTPStats).packets.preLocalPacketsLoss = handleStat(
    handleNull(stream.local.packetsLost),
  );
}

/**
 * Calculate MOS for local or remote streams.
 * @param {String} type - specify local or remote
 * @param {Number} rtt - round trip time
 * @param {Number} jitter - variation in the delay of received packets
 * @param {Number} fractionLoss - number of packets lost divided by number of packets sent/received
 */
const mosCal = function (
  mosObj: number[],
  type: string,
  rtt: number,
  jitter: number,
  fractionLoss: number,
): void {
  const getStatsRef: GetRTPStats = this;
  let effectiveLatency = 0;
  let Rval = 0;
  const Rfactor = getStatsRef.storage.audioCodec === 'opus' ? 95 : 93.2;
  let mos: number;
  effectiveLatency = rtt + jitter * 2 + 10;
  if (effectiveLatency < 160) {
    Rval = Rfactor - effectiveLatency / 40;
  } else {
    Rval = Rfactor - (effectiveLatency - 120) / 10;
  }
  Rval -= 100 * fractionLoss * 2.5;
  if (Rval <= 0) {
    mos = 1;
  } else if (Rval < 100) {
    mos = 1 + 0.035 * Rval + 0.000007 * Rval * (Rval - 60) * (100 - Rval);
    mos = parseFloat(mos.toFixed(3));
  } else {
    mos = 4.5;
  }
  mosObj.push(mos);
  Plivo.log.debug(`mos ${type}`, mos);

  if (type === 'mosLocalMeasures') {
    getStatsRef.collected.local.mos = Number(mos) || 0;
  }
  if (type === 'mosRemoteMeasures') {
    getStatsRef.collected.local.mos = Math.min(
      Number(mos) || 0,
      getStatsRef.collected.local.mos as number,
    );
  }
};

/**
 * Validate and calculate MOS for local or remote streams.
 * @param {String} type - specify local or remote
 * @param {Number} rtt - round trip time
 * @param {Number} jitter - variation in the delay of received packets
 * @param {Number} fractionLoss - number of packets lost divided by number of packets sent/received
 */
const processMos = function (
  type: string,
  rtt: number,
  jitter: number,
  fractionLoss: number,
): void {
  const getStatsRef: GetRTPStats = this;
  const mosObj: number[] = getStatsRef.storage[type];
  if (
    (handleNull(jitter) == null)
    || (handleNull(fractionLoss) == null)
    || Number(rtt || 0) === 0
  ) {
    getStatsRef.collected.local.mos = null as unknown as undefined;
    return;
  }
  if (getStatsRef.clientScope.browserDetails.browser === 'firefox') {
    rtt = Number(rtt) * 1000;
    jitter = Number(jitter) * 1000;
  }
  if (mosObj.length === 2) {
    mosCal.call(getStatsRef, mosObj, type, rtt, jitter, fractionLoss);
    const totMosObj = mosObj.filter((item) => item < 3);
    if (totMosObj.length >= 2) {
      getStatsRef.storage.warning[type] = true;
    } else if (getStatsRef.storage.warning[type]) {
      getStatsRef.storage.warning[type] = false;
    }
  } else {
    mosCal.call(getStatsRef, mosObj, type, rtt, jitter, fractionLoss);
  }
  if (mosObj.length === 3) mosObj.splice(0, 2);
};

/**
 * Calculate MOS and fraction loss for local and remote streams.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 */
const calculateStats = function (stream: RtpStatsStream): void {
  const getStatsRef: GetRTPStats = this;
  if (!getStatsRef.baseStatsCollected) {
    const packetsLostLocal = handleStat(stream.local.packetsLost as number);
    const packetsLostRemote = handleStat(stream.remote.packetsLost as number);
    const packetsSent = handleStat(stream.local.packetsSent as number);
    const packetsReceived = handleStat(stream.remote.packetsReceived as number) + packetsLostRemote;

    if (packetsLostLocal === 0 && packetsSent === 0) {
      getStatsRef.collected.local.fractionLoss = 0;
    } else if (packetsSent === 0) {
      getStatsRef.collected.local.fractionLoss = 1.0;
    } else {
      getStatsRef.collected.local.fractionLoss = handleStat(packetsLostLocal / packetsSent, 'float');
    }

    if (packetsLostRemote === 0 && packetsReceived === 0) {
      getStatsRef.collected.remote.fractionLoss = 0;
    } else if (packetsReceived === 0) {
      getStatsRef.collected.remote.fractionLoss = 1.0;
    } else {
      getStatsRef.collected.remote.fractionLoss = handleStat(packetsLostRemote / packetsReceived, 'float');
    }

    basePackets.call(getStatsRef, stream);
    getStatsRef.baseStatsCollected = true;
    return;
  }
  // Calculate local packet Loss
  const localPacketsLost = handleStat(stream.local.packetsLost as number)
    - getStatsRef.packets.preLocalPacketsLoss;
  const localPacketsSent = handleStat(stream.local.packetsSent as number)
    - getStatsRef.packets.prePacketsSent;

  if (localPacketsLost === 0 && localPacketsSent === 0) {
    getStatsRef.collected.local.fractionLoss = 0;
  } else if (localPacketsSent === 0) {
    getStatsRef.collected.local.fractionLoss = 1.0;
  } else {
    getStatsRef.collected.local.fractionLoss = handleStat(localPacketsLost / localPacketsSent, 'float');
  }

  // Calculate remote packet Loss
  const remotePacketsLost = handleStat(stream.remote.packetsLost as number)
    - getStatsRef.packets.preRemotePacketsLoss;
  const remotePacketsReceived = handleStat(stream.remote.packetsReceived as number)
    - getStatsRef.packets.prePacketsReceived
    + remotePacketsLost;

  if (remotePacketsLost === 0 && remotePacketsReceived === 0) {
    getStatsRef.collected.remote.fractionLoss = 0;
  } else if (remotePacketsReceived === 0) {
    getStatsRef.collected.remote.fractionLoss = 1.0;
  } else {
    getStatsRef.collected.remote.fractionLoss = handleStat(remotePacketsLost / remotePacketsReceived, 'float');
  }

  // Calculate Mean Opinion Score
  processMos.call(
    getStatsRef,
    'mosLocalMeasures',
    getStatsRef.collected.local.rtt,
    getStatsRef.collected.local.jitter,
    getStatsRef.collected.local.fractionLoss,
  );
  processMos.call(
    getStatsRef,
    'mosRemoteMeasures',
    getStatsRef.collected.local.rtt,
    getStatsRef.collected.remote.jitter,
    getStatsRef.collected.remote.fractionLoss,
  );
  basePackets.call(getStatsRef, stream);
};

/**
 * Send call stats event to Plivo stats.
 * @param {StatsObject} statMsg - Holds rtp stats and call info
 */
const sendStats = function (statMsg: StatsObject): void {
  const client: Client = this;
  if (
    client.statsSocket
    && client.callstatskey
    && client._currentSession
    && client.rtp_enabled
    && (
      (
        this.options.enableQualityTracking === C.DEFAULT_ENABLE_QUALITY_TRACKING
        && this.options.enableTracking
      )
      || (this.options.enableQualityTracking === C.REMOTEONLY)
    )
  ) {
    client.statsSocket.send(statMsg, client);
    if ((window as any)._PlivoDevLogging) {
      Plivo.log.info(statMsg);
    }
  }
  if (
    client._currentSession
    && client._currentSession.session
    && client.browserDetails.browser === 'chrome'
    && (
      (
        this.options.enableQualityTracking === C.DEFAULT_ENABLE_QUALITY_TRACKING
        && this.options.enableTracking
      )
      || this.options.enableQualityTracking === C.LOCALONLY
    )
  ) {
    processStreams.call(
      client,
      statMsg,
      (client._currentSession.session.isMuted() as any).audio,
    );
  }
};

/**
 * Prepare and send CALL_STATS event to Plivo stats.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 */
const processStats = function (stream: RtpStatsStream): void {
  const getStatsRef: GetRTPStats = this;
  getStatsRef.collected = {
    msg: 'CALL_STATS',
    callstats_key: getStatsRef.callstatskey,
    local: {},
    remote: {},
    codec: stream.codec,
    xcallUUID: getStatsRef.xcallUUID,
    callUUID: getStatsRef.callUUID,
    corelationId: getStatsRef.corelationId,
    userName: getStatsRef.userName,
    timeStamp: Date.now(),
    domain: C.DOMAIN,
    source: C.STATS_SOURCE,
    version: C.STATS_VERSION,
    networkType: stream.networkType || 'unknown',
    networkEffectiveType: (navigator as any).connection
      ? (navigator as any).connection.effectiveType
      : 'unknown',
    networkDownlinkSpeed: (navigator as any).connection
      ? (navigator as any).connection.downlink
      : -1,
    statsIOUsed: getStatsRef.statsioused,
  };

  getStatsRef.collected.local.audioLevel = handleStat(
    stream.local.audioInputLevel as number,
    'int',
    null,
    true,
  );
  getStatsRef.collected.remote.audioLevel = handleStat(
    stream.remote.audioOutputLevel as number,
    'int',
    null,
    true,
  );
  getStatsRef.collected.remote.jitterBufferDelay = handleStat((stream.remote as any).googCurrentDelayMs, 'int', null, true);
  if (getStatsRef.clientScope.browserDetails.browser === 'chrome') {
    getStatsRef.collected.local.rtt = handleStat(stream.local.googRtt as number, 'float');
    getStatsRef.collected.local.jitter = handleStat(
      stream.local.googJitterReceived as number,
      'float',
    );
    getStatsRef.collected.remote.jitter = handleStat(
      stream.remote.googJitterReceived as number,
      'float',
    );
  } else if (
    getStatsRef.clientScope.browserDetails.browser === 'firefox'
    || getStatsRef.clientScope.browserDetails.browser === 'safari'
  ) {
    getStatsRef.collected.local.rtt = handleStat(stream.local.rtt as number, 'float');
    getStatsRef.collected.local.jitter = handleStat(
      stream.local.jitter as number,
      'float',
    );
    getStatsRef.collected.remote.jitter = handleStat(
      stream.remote.jitter as number,
      'float',
    );
  }
  getStatsRef.collected.remote.packetsReceived = handleStat(
    stream.remote.packetsReceived as number,
  );
  getStatsRef.collected.local.packetsSent = handleStat(
    stream.local.packetsSent as number,
  );
  getStatsRef.collected.remote.bytesReceived = handleStat(
    stream.remote.bytesReceived as number,
  );
  getStatsRef.collected.local.bytesSent = handleStat(stream.local.bytesSent as number);
  getStatsRef.collected.remote.packetsLost = handleStat(
    stream.remote.packetsLost as number,
  );
  getStatsRef.collected.local.packetsLost = handleStat(
    stream.local.packetsLost as number,
  );
  getStatsRef.collected.remote.ssrc = handleStat(stream.remote.ssrc as number);
  getStatsRef.collected.local.ssrc = handleStat(stream.local.ssrc as number);
  calculateStats.call(getStatsRef, stream);
  sendStats.call(getStatsRef.clientScope, getStatsRef.collected);
};

/**
 * Get RTP stats for chrome browser.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 */
export const handleChromeStats = function (stream: RtpStatsStream): void {
  (this as any).pc.getStats(
    (res: any) => {
      res.result().forEach((result: any) => {
        if (result.type === 'localcandidate') {
          if (
            result.stat('candidateType') === 'host'
            && stream.gotNetworkType
          ) {
            return;
          }
          switch (result.stat('networkType')) {
            case 'wlan':
              stream.networkType = 'wifi';
              break;
            case 'lan':
              stream.networkType = 'ethernet';
              break;
            default:
              stream.networkType = result.stat('networkType');
          }
          if (result.stat('candidateType') !== 'host') {
            stream.gotNetworkType = true;
          }
          return;
        }
        if (result.type !== 'ssrc') {
          return;
        }
        if (result.stat('bytesSent')) {
          result.names().forEach((e: string | number) => {
            stream.local[e] = result.stat(e);
          });
        }
        if (result.stat('bytesReceived')) {
          result.names().forEach((e: string | number) => {
            stream.remote[e] = result.stat(e);
          });
        }
        if (result.stat('googCodecName')) {
          stream.codec = result.stat('googCodecName');
        }
      });
      stream.local.audioInputLevel = this.audioInputLevel / this.audioInputCount;
      stream.remote.audioOutputLevel = this.audioOutputLevel / this.audioOutputCount;
      clearAudioSamples.call(this);
      processStats.call(this, stream);
    },
    null,
    (err: any) => {
      Plivo.log.error('Rtpstats peer connection getStats error', err);
    },
  );
};

/**
 * Get codec name from sdp.
 */
const getCodecName = function (): string {
  try {
    // the format of codec information in the sdp message
    // a=rtpmap:0 PCMU/8000
    const codec = this.pc.remoteDescription.sdp.match(/rtpmap:.*/)[0].split(' ')[1].split('/')[0];
    return codec;
  } catch (e) {
    Plivo.log.debug(
      'Error fetching codec from remote description message',
      e,
    );
    return '';
  }
};

/**
 * Converts rtt and jitter to milliseconds.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 * @returns Converted stream
 */
const handleSafariChanges = function (stream: RtpStatsStream): RtpStatsStream {
  stream.local.rtt = stream.local.rtt == null ? null : Number(stream.local.rtt) * 1000;
  stream.local.jitter = stream.local.jitter == null ? null : Number(stream.local.jitter) * 1000;
  stream.remote.jitter = stream.remote.jitter == null ? null : Number(stream.remote.jitter) * 1000;
  return stream;
};

/**
 * Get RTP stats for firefox and safari browsers.
 * @param {RtpStatsStream} stream - holds local and remote stat details
 */
export const handleFirefoxSafariStats = function (stream: RtpStatsStream): void {
  stream.codec = getCodecName.call(this);
  const senders = this.pc.getSenders();
  if (senders) {
    senders[0]
      .getStats()
      .then((senderResults: any[]) => {
        Array.from(senderResults.values()).forEach((stats: any) => {
          if (stats.type === 'outbound-rtp') {
            stream.local.rtt = stats.rtt == null || isNaN(stats.rtt)
              ? stream.local.rtt
              : stats.rtt;
            stream.local.jitter = stats.jitter == null || isNaN(stats.jitter)
              ? stream.local.jitter
              : stats.jitter;
            stream.local.packetsSent = stats.packetsSent == null || isNaN(stats.packetsSent)
              ? stream.local.packetsSent
              : stats.packetsSent;
            stream.local.packetsLost = stats.packetsLost == null || isNaN(stats.packetsLost)
              ? stream.local.packetsLost
              : stats.packetsLost;
            stream.local.bytesSent = stats.bytesSent == null || isNaN(stats.bytesSent)
              ? stream.local.bytesSent
              : stats.bytesSent;
            stream.local.ssrc = stats.ssrc == null || isNaN(stats.ssrc)
              ? stream.local.ssrc
              : stats.ssrc;
          }
          if (stats.type === 'remote-inbound-rtp') {
            const outboundRTCP = stats;
            stream.local.rtt = outboundRTCP.roundTripTime == null
            || isNaN(outboundRTCP.roundTripTime)
              ? stream.local.rtt
              : outboundRTCP.roundTripTime;
            stream.local.jitter = outboundRTCP.jitter == null || isNaN(outboundRTCP.jitter)
              ? stream.local.jitter
              : outboundRTCP.jitter;
            stream.local.packetsLost = outboundRTCP.packetsLost == null
            || isNaN(outboundRTCP.packetsLost)
              ? stream.local.packetsLost
              : outboundRTCP.packetsLost;
          }
          if (
            stats.type === 'candidate-pair'
          && (stream.local.rtt == null || isNaN(stream.local.rtt))
          ) {
            stream.local.rtt = stats.currentRoundTripTime;
          }
        });
        this.pc
          .getReceivers()[0]
          .getStats()
          .then((receiverResults: any[]) => {
            Array.from(receiverResults.values()).forEach((stats: any) => {
              if (stats.type === 'inbound-rtp') {
                stream.remote = stats;
                stream.local.audioInputLevel = this.audioInputLevel / this.audioInputCount;
                stream.remote.audioOutputLevel = this.audioOutputLevel / this.audioOutputCount;
                clearAudioSamples.call(this);
                if (this.clientScope.browserDetails.browser === 'safari') {
                  stream = handleSafariChanges(stream);
                }
                processStats.call(this, stream);
              }
            });
          })
          .catch((e: any) => {
            Plivo.log.debug('Error in getStats RemoteStreams API ', e);
          });
      })
      .catch((e: any) => {
        Plivo.log.debug('Error in getStats LocalStreams API ', e);
      });
  }
};

/**
 * Collect RTP stats every 5 seconds during call for local and remote streams.
 */
const startStatsTimer = function (): void {
  const getStatsRef: GetRTPStats = this;
  getStatsRef.statsTimer = setInterval(() => {
    const stream: RtpStatsStream = {
      codec: '',
      local: {},
      remote: {},
      networkType: '',
    };
    if (getStatsRef.clientScope.browserDetails.browser === 'chrome' || getStatsRef.clientScope.browserDetails.browser === 'edge') {
      handleChromeStats.call(getStatsRef, stream);
    } else if (
      getStatsRef.clientScope.browserDetails.browser === 'firefox'
      || getStatsRef.clientScope.browserDetails.browser === 'safari'
    ) {
      handleFirefoxSafariStats.call(getStatsRef, stream);
    } else {
      Plivo.log.error(
        `Plivo Browser SDK is not supported in ${getStatsRef.clientScope.browserDetails.browser}`,
      );
    }
  }, C.GETSTATS_INTERVAL);
};

/**
 * Initialize and create timers, media streams for RTP stats.
 */

export class GetRTPStats {
  /**
   * Client class reference
   */
  clientScope: Client;

  /**
   * Represents a WebRTC connection between caller and callee
   * @private
   */
  pc: RTCPeerConnection;

  /**
   * Unique identifier generated for a call by server
   * @private
   */
  xcallUUID: string;

  /**
   * Identifier generated by JSSIP when a new RTCSession is created for the call
   * @private
   */
  callUUID: string;

  /**
   * Identifier generated by JSSIP when a new RTCSession is created for the call
   * @private
   */
  corelationId: string;

  /**
   * Username given when logging in
   * @private
   */
  userName: string;

  /**
   * Holds rtp stat information which will be used in capturing media metrics
   * @private
   */
  storage: Storage;

  /**
   * It is a unique identifer which is not null when callstats permission is present
   * @private
   */
  callstatskey: string;

  /**
   * Set to true if user is using callstats.io
   * @private
   */
  statsioused: boolean;

  /**
   * Set to true if rtp stats are collected for the first time
   * @private
   */
  baseStatsCollected: boolean;

  /**
   * Holds the packet information of the previous stat
   * @private
   */
  packets: {
    prePacketsReceived?: any;
    prePacketsSent?: any;
    preRemotePacketsLoss?: any;
    preLocalPacketsLoss?: any;
  };

  /**
   * Used for capturing local media stream
   * @private
   */
  senderMediaStream: MediaStream | null;

  /**
   * Used for capturing remote media stream
   * @private
   */
  receiverMediaStream: MediaStream;

  /**
   * Holds the audio level instance of the sender media stream
   * @private
   */
  localAudioLevelHelper: AudioLevel;

  /**
   * Holds the audio level instance of the receiver media stream
   * @private
   */
  remoteAudioLevelHelper: AudioLevel;

  /**
   * Describes the audio level for the local stream
   * @private
   */
  audioInputLevel: null | number;

  /**
   * Describes the audio level for the remote stream
   * @private
   */
  audioOutputLevel: null | number;

  /**
   * Input audio samples collected count
   * @private
   */
  audioInputCount: number;

  /**
   * Output audio samples collected count
   * @private
   */
  audioOutputCount: number;

  /**
   * Timer for collecting audio levels
   * @private
   */
  audioTimer: ReturnType<typeof setInterval>;

  /**
   * Timer for collecting RTP stats
   * @private
   */
  statsTimer: ReturnType<typeof setInterval>;

  /**
   * Holds rtp stats and call info
   * @private
   */
  collected: StatsObject;

  /**
   * @constructor
   * @param {Object} that - client reference
   * @private
   */
  constructor(client: Client) {
    this.clientScope = client;
    this.pc = (client._currentSession as CallSession).session.connection as RTCPeerConnection;
    this.xcallUUID = (client._currentSession as CallSession).callUUID as string;
    this.callUUID = (client._currentSession as CallSession).sipCallID as string;
    this.corelationId = (client._currentSession as CallSession).sipCallID as string;
    this.userName = client.userName as string;
    this.storage = client.storage as Storage;
    this.callstatskey = client.callstatskey as string;
    this.statsioused = client.statsioused;
    if (!this.pc || !this.callUUID) {
      if (!this.pc) {
        Plivo.log.error('pc obj is null, webrtc stats error');
      }
      if (!this.callUUID) {
        Plivo.log.error('CallUUID is null, webrtc stats error');
      }
      return;
    }
    this.baseStatsCollected = false;
    this.packets = {};
    this.senderMediaStream = new MediaStream();
    this.senderMediaStream.addTrack(this.pc.getSenders()[0].track as MediaStreamTrack);
    this.receiverMediaStream = new MediaStream();
    this.receiverMediaStream.addTrack(this.pc.getReceivers()[0].track);
    this.localAudioLevelHelper = new AudioLevel(this.senderMediaStream);
    this.remoteAudioLevelHelper = new AudioLevel(this.receiverMediaStream);
    this.audioInputLevel = null;
    this.audioOutputLevel = null;
    this.audioInputCount = 0;
    this.audioOutputCount = 0;
    startAudioTimer.call(this);
    startStatsTimer.call(this);
  }

  /**
   * Stop analysing audio levels for local and remote streams.
   */
  public stop = (): void => {
    this.localAudioLevelHelper.stop();
    this.remoteAudioLevelHelper.stop();
  };
}

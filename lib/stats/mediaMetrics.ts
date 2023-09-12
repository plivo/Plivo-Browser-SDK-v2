/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { Logger } from '../logger';
import { StatsObject } from './rtpStats';
import { Client, PlivoObject } from '../client';
import * as C from '../constants';

const Plivo: PlivoObject = { log: Logger };

/**
 * Send media metrics during call
 * @param {String} group - specifies the category(audio or network) for which this metric belongs
 * @param {String} level - severity level. Currently, it is only 'warning'
 * @param {String} type - warning type
 * @param {String} value - average value of the stat
 * @param {Boolean} active - if true warning is still present, else warning is not present
 * @param {String} desc - description for the warning
 * @param {String} stream - type of RTP stats
 */
export const emitMetrics = function (
  group: string,
  level: string,
  type: string,
  value: number,
  active: boolean,
  desc: string,
  stream: string,
): void {
  const client: Client = this;
  if (
    (
      this.options.enableQualityTracking === C.DEFAULT_ENABLE_QUALITY_TRACKING
      && this.options.enableTracking
    )
    || this.options.enableQualityTracking === C.LOCALONLY
  ) {
    const msgTemplate = {
      group,
      level,
      type,
      value,
      active,
      desc: desc || '',
      stream,
    };
    client.emit('mediaMetrics', msgTemplate);
  }
};

/**
 * Analyse audio level during call.
 * @param {String} type - specify if it local or remote audio
 * @param {Number} val - local or remote audio value
 * @param {String} stream - type of RTP stats to consider
 * @param {Boolean} isLocalMuted - mute status for local audio
 */
const processAudioLevel = function (
  type: string,
  val: number,
  stream: string,
  isLocalMuted: boolean,
): void {
  const client: Client = this;
  const audioObj = client.storage ? client.storage[type] : [];
  // check at every 3rd collection
  if (audioObj.length === 2) {
    audioObj.push(Number(val));
    // unchanged volume level is processed here
    const identicalCollector = {};
    let audioVol: number | null = null;
    audioObj.forEach((eachVal) => {
      identicalCollector[eachVal] = identicalCollector[eachVal] + 1 || 1;
    });
    const keys = Object.keys(identicalCollector);
    keys.forEach((vol) => {
      // if 2 or more vol is same out of 3 samples
      if (identicalCollector[vol] >= 2) {
        audioVol = Number(vol);
      }
    });
    if (typeof audioVol === 'number' && client.storage) {
      client.storage.warning[type] = true;
      if (audioVol > 1) {
        Plivo.log.debug(
          `Same audio level detected for ${type} : `,
          JSON.stringify(audioObj),
        );
      } else {
        Plivo.log.debug(
          `${C.LOGCAT.CALL} | Audio mute detected for ${type} : `,
          JSON.stringify(audioObj),
        );
      }
      if (!(isLocalMuted && type === 'local_audio')) {
        emitMetrics.call(
          client,
          'audio',
          'warning',
          'no_audio_received',
          audioVol,
          true,
          type,
          stream,
        );
      }
    } else if (client.storage && client.storage.warning[type]) {
      client.storage.warning[type] = false;
      emitMetrics.call(
        client,
        'audio',
        'warning',
        'no_audio_received',
        0,
        false,
        type,
        stream,
      );
    }
  } else {
    audioObj.push(Number(val));
  }
  // remove first 2, after every 3 samples
  if (audioObj.length === 3) audioObj.splice(0, 2);
};

/**
 * Analyse round trip time during call.
 * @param {String} type - specify if it local or remote rtt
 * @param {Number} val - local or remote rtt value
 */
const processRtt = function (type: string, val: number): void {
  const numberVal = Number(val);
  const client: Client = this;
  const rttObj = client.storage ? client.storage[type] : [];
  if (rttObj.length === 2) {
    rttObj.push(numberVal);
    const totRttObj = rttObj.filter((item) => item > 400);
    if (totRttObj.length >= 2) {
      const rttSum = totRttObj.reduce((sum, value) => sum + value);
      const rttAvg = (rttSum / totRttObj.length).toFixed(2);
      if (client.storage) {
        client.storage.warning[type] = true;
      }
      Plivo.log.debug(
        `${C.LOGCAT.CALL} | ${type} : getting high rtt  : `,
        JSON.stringify(totRttObj),
      );
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_rtt',
        rttAvg,
        true,
        'high latency',
        'None',
      );
    } else if (client.storage && client.storage.warning[type]) {
      client.storage.warning[type] = false;
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_rtt',
        0,
        false,
        'high latency',
        'None',
      );
    }
  } else {
    rttObj.push(numberVal);
  }
  // remove first 2, after every 3 samples
  if (rttObj.length === 3) rttObj.splice(0, 2);
};

/**
 * Analyse jitter during call.
 * @param {String} type - specify if it local or remote jitter
 * @param {Number} val - local or remote jitter value
 * @param {String} stream - type of RTP stats to consider
 */
const processJitter = function (type: string, val: number, stream: string): void {
  const numberVal = Number(val);
  const client: Client = this;
  const jitterObj = client.storage ? client.storage[type] : [];
  if (jitterObj.length === 2) {
    jitterObj.push(numberVal);
    const totJitterObj = jitterObj.filter((item) => item > 30);
    if (totJitterObj.length >= 2) {
      const jitterSum = totJitterObj.reduce((sum, value) => sum + value);
      const jitterAvg = jitterSum / totJitterObj.length;
      if (client.storage) {
        client.storage.warning[type] = true;
      }
      Plivo.log.debug(
        `${C.LOGCAT.CALL} | ${type} : getting high jitter rate : `,
        JSON.stringify(totJitterObj),
      );
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_jitter',
        jitterAvg,
        true,
        type,
        stream,
      );
    } else if (client.storage && client.storage.warning[type]) {
      client.storage.warning[type] = false;
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_jitter',
        0,
        false,
        type,
        stream,
      );
    }
  } else {
    jitterObj.push(numberVal);
  }
  // remove first 2, after every 3 samples
  if (jitterObj.length === 3) jitterObj.splice(0, 2);
};

/**
 * Analyse mean opinion score during call.
 * @param {String} type - specify if it local or remote mos
 * @param {Number} val - local or remote mos value
 */
const processMos = function (type: string, val: number): void {
  // Ignore first 3 MOS score of a new call, since first 2-3 mos comes as fair
  const client: Client = this;
  const mosObj = client.storage ? client.storage[type] : [];
  if (mosObj.length === 2) {
    mosObj.push(val);
    // filter if the mos score is less than 3. https://www.voip-info.org/call-quality-metrics/
    const totMosObj = mosObj.filter((item) => item < 3.5);
    if (totMosObj.length >= 2) {
      if (client.storage) {
        client.storage.warning[type] = true;
      }
      Plivo.log.debug(`${C.LOGCAT.CALL} | ${type} : getting low mos : `, JSON.stringify(mosObj));
      emitMetrics.call(
        client,
        'network',
        'warning',
        'low_mos',
        totMosObj[0],
        true,
        type,
        'None',
      );
    } else if (client.storage && client.storage.warning[type]) {
      client.storage.warning[type] = false;
      emitMetrics.call(
        client,
        'network',
        'warning',
        'low_mos',
        0,
        false,
        type,
        'None',
      );
    }
  } else {
    mosObj.push(val);
  }
  // remove first 2, after every 3 samples
  if (mosObj.length === 3) mosObj.splice(0, 2);
};

/**
 * Analyse fraction loss during call.
 * @param {String} type - specify if it local or remote fraction loss
 * @param {Number} val - local or remote fraction loss value
 * @param {String} stream - type of RTP stats to consider
 */
const processPacketLoss = function (
  type: string,
  val: number,
  stream: string,
): void {
  const numberVal = Number(val);
  const client: Client = this;
  const plossObj = client.storage ? client.storage![type] : [];
  // Check at every 3 collection
  if (plossObj.length === 2) {
    plossObj.push(numberVal);
    const totPlossObj = plossObj.filter((item) => {
      if (client.storage && client.storage.audioCodec === 'opus') {
        // greater than 10%
        return item >= 0.1;
      }
      // greater than 2%
      return item >= 0.02;
    });
    if (totPlossObj.length >= 2) {
      const plossSum = totPlossObj.reduce((sum, value) => sum + value);
      let plossAvg = plossSum / totPlossObj.length;
      plossAvg = parseFloat(plossAvg.toFixed(3));
      if (client.storage) {
        client.storage.warning[type] = true;
      }
      Plivo.log.debug(
        `${C.LOGCAT.CALL} |
        ${type} : packet loss value is high :`,
        JSON.stringify(totPlossObj),
      );
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_packetloss',
        plossAvg,
        true,
        type,
        stream,
      );
    } else if (client.storage && client.storage.warning[type]) {
      client.storage.warning[type] = false;
      emitMetrics.call(
        client,
        'network',
        'warning',
        'high_packetloss',
        0,
        false,
        type,
        stream,
      );
    }
  } else {
    plossObj.push(numberVal);
  }
  // remove first 2, after every 3 samples
  if (plossObj.length === 3) plossObj.splice(0, 2);
};

/**
 * Start analysing media metrics during call.
 * @param {StatsObject} streams - RTP stats(local and remote)
 * @param {Boolean} isLocalMuted - mute status for local audio
 */
export const processStreams = function (
  streams: StatsObject,
  isLocalMuted: boolean,
): void {
  const client: Client = this;
  if (!client.storage || !client.storage.startAnalysis) {
    return;
  }
  if (streams.local) {
    processRtt.call(client, 'rtt', streams.local.rtt);
    processJitter.call(
      client,
      'jitterLocalMeasures',
      streams.local.jitter,
      'local',
    );
    processMos.call(client, 'mosRemoteMeasures', streams.local.mos);
    processPacketLoss.call(
      client,
      'packetLossLocalMeasures',
      streams.local.fractionLoss,
      'local',
    );
    processAudioLevel.call(
      client,
      'local_audio',
      streams.local.audioLevel,
      'local',
      isLocalMuted,
    );
  }
  if (streams.remote) {
    processJitter.call(
      client,
      'jitterRemoteMeasures',
      streams.remote.jitter,
      'remote',
    );
    processPacketLoss.call(
      client,
      'packetLossRemoteMeasures',
      streams.remote.fractionLoss,
      'remote',
    );
    processAudioLevel.call(
      client,
      'remote_audio',
      streams.remote.audioLevel,
      'remote',
      isLocalMuted,
    );
  }
};

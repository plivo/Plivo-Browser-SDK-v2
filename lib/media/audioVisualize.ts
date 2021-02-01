/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { Client } from '../client';
import { Logger } from '../logger';

let that: {
  emit: (
    arg0: string,
    arg1: { inputVolume: string; outputVolume: string },
  ) => void;
};
let localContext: AudioContext;
let remoteContext: {
  suspend: () => any;
  resume: () => any;
  createGain: () => any;
  createMediaStreamSource: (arg0: any) => any;
  createAnalyser: () => any;
};
let reqFrame: number;
let AudioContext: AudioContext | any;
let localAnalyserNode: AudioNode;
let remoteAnalyserNode: {
  fftSize: number;
  frequencyBinCount: Iterable<number>;
  getByteFrequencyData: (arg0: Uint8Array) => void;
};

export interface AudioVisualize {
  start: (
    clientObject: Client,
    localStream: MediaStream,
    remoteStream: any,
  ) => void;
  stop: () => void;
}

/**
 * Calculate audio levels in decibles from frequency bins and emit volume event.
 */
const emitLocalRemoteAudioVolumes = function (): void {
  reqFrame = window.requestAnimationFrame(emitLocalRemoteAudioVolumes);
  const localFrequencyData = new Uint8Array(
    (localAnalyserNode as any).frequencyBinCount,
  );
  const remoteFrequencyData = new Uint8Array(
    remoteAnalyserNode.frequencyBinCount,
  );
  (localAnalyserNode as any).getByteFrequencyData(localFrequencyData);
  remoteAnalyserNode.getByteFrequencyData(remoteFrequencyData);
  let localTotal = 0;
  let remoteTotal = 0;
  for (let j = 0; j < localFrequencyData.length; j += 1) {
    localTotal += localFrequencyData[j];
    remoteTotal += remoteFrequencyData[j];
  }
  const localAvg = ((localTotal / localFrequencyData.length) / 255.0).toFixed(3);
  const remoteAvg = ((remoteTotal / remoteFrequencyData.length) / 255.0).toFixed(3);
  const audioStats = { inputVolume: localAvg, outputVolume: remoteAvg };
  that.emit('volume', audioStats);
};

/**
 * Start analysing local and remote streams.
 * @param {Client} clientObject - client reference
 * @param {MediaStream} localStream - senders stream
 * @param {MediaStream} remoteStream - receivers stream
 */
const start = function (
  clientObject: Client,
  localStream: MediaStream,
  remoteStream: MediaStream,
): void {
  that = clientObject;
  if (!localStream || !remoteStream) return;
  if (localContext) {
    localContext.resume();
  } else {
    (localContext = new (AudioContext as any)());
  }
  if (remoteContext) {
    remoteContext.resume();
  } else {
    (remoteContext = new (AudioContext as any)());
  }
  const localInputPoint = localContext.createGain();
  const remoteInputPoint = remoteContext.createGain();
  const localSource = localContext.createMediaStreamSource(localStream);
  localSource.connect(localInputPoint);
  const remoteSource = remoteContext.createMediaStreamSource(remoteStream);
  remoteSource.connect(remoteInputPoint);
  localAnalyserNode = localContext.createAnalyser();
  remoteAnalyserNode = remoteContext.createAnalyser();
  localAnalyserNode['fftSize'] = 128;
  remoteAnalyserNode.fftSize = 128;
  localInputPoint.connect(localAnalyserNode);
  remoteInputPoint.connect(remoteAnalyserNode);
  emitLocalRemoteAudioVolumes();
};

/**
 * Initialize audio visualize.
 */
const audioVisualize = (): AudioVisualize => {
  AudioContext = window.AudioContext
    || window['webkitAudioContext']
    || window['mozAudioContext'];
  return {
    start,
    stop() {
      Logger.info('stopping the requesting frame');
      if (localContext) {
        localContext.suspend();
      }
      if (remoteContext) {
        remoteContext.suspend();
      }
      if (reqFrame) {
        window.cancelAnimationFrame(reqFrame);
      }
    },
  };
};

export default audioVisualize;

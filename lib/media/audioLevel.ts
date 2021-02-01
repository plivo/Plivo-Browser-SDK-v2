/* eslint-disable max-classes-per-file */
// Based on https://github.com/otalk/hark and https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

import { Logger } from '../logger';

/**
 * Initialize the audio context factory.
 */
class AudioContextFactory {
  /**
   * DOM AudioContext
   * @private
   */
  audioContext: null | AudioContext;

  /**
   * Audio context use count
   * @private
   */
  audioContextCount: number;

  /**
   * Create and return a new audio context.
   */
  public getAudioContext = (): AudioContext => {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    this.audioContextCount += 1;
    return this.audioContext;
  };

  /**
   * Close the audio context.
   */
  public stop = (): void => {
    if (!this.audioContext) return;
    this.audioContextCount -= 1;
    if (this.audioContextCount === 0) {
      this.audioContext.close();
      this.audioContext = null;
      Logger.debug('AudioContext no longer needed so closed');
    }
  };

  /**
   * @constructor
   * @private
   */
  constructor() {
    this.audioContext = null;
    this.audioContextCount = 0;
  }
}

const audioContextFactory = new AudioContextFactory();

/**
 * Analyse the audio level for a stream(local/remote).
 */

// eslint-disable-next-line import/prefer-default-export
export class AudioLevel {
  /**
   * Audio volume in decibles
   * @private
   */
  volumeLevel: number;

  /**
   * Audio frequency segments
   * @private
   */
  fftBins: null | Float32Array;

  /**
   * Analyze the audio levels from a media stream
   * @private
   */
  analyser: null | AnalyserNode;

  /**
   * It is used for checking if audio level analysis stopped
   * @private
   */
  stopped: boolean;

  /**
   * Holds media obtained through microphone or peer connection
   * @private
   */
  sourceNode: MediaStreamAudioSourceNode;

  /**
   * Get audio level in decibles.
   */
  public getAudioLevel = (): number => {
    let maxVolume = -100;
    const { fftBins } = this;
    if (fftBins && this.analyser) {
      this.analyser.getFloatFrequencyData(fftBins);
    }
    if (fftBins) {
      for (let i = 4, ii = fftBins.length; i < ii; i += 1) {
        if (fftBins[i] > maxVolume && fftBins[i] < 0) {
          maxVolume = fftBins[i];
        }
      }
    }
    return maxVolume;
  };

  /**
   * Stop analysing audio levels.
   */
  public stop = (): void => {
    if (this.stopped) return;
    this.stopped = true;
    if (this.analyser) {
      this.analyser.disconnect();
    }
    this.sourceNode.disconnect();
    audioContextFactory.stop();
  };

  /**
   * @constructor
   * @param {MediaStream} stream - instance of MediaStream
   * @private
   */
  constructor(stream: MediaStream) {
    this.volumeLevel = -100;
    this.fftBins = null;
    this.analyser = null;
    this.stopped = false;

    const audioContext = audioContextFactory.getAudioContext();
    this.analyser = audioContext.createAnalyser();

    this.analyser.fftSize = 1024;
    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = 0;
    this.analyser.smoothingTimeConstant = 0.1;
    this.fftBins = new Float32Array(this.analyser.frequencyBinCount);
    this.sourceNode = audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);
  }
}

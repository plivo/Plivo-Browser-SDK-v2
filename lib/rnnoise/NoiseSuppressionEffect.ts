// eslint-disable-next-line import/no-cycle
import { Logger } from "../logger";
import * as C from "../constants";

let audioContext: AudioContext;

const Plivo = {
  log: Logger,
};

/**
 * Initializes the RNNoise audio worklet and creates the filter node.
 *
 * @returns {Promise<AudioWorkletNode | undefined>}
 */
function initializeKRnnoise(): Promise<AudioWorkletNode | undefined> {
  return new Promise((resolve) => {
    audioContext.resume().then(() => {
      const distjs = `https://csdk-test.s3.ap-south-1.amazonaws.com/processor.js`;

      try {
        audioContext.audioWorklet.addModule(distjs).then(() => {
          resolve(new AudioWorkletNode(audioContext, 'NoiseSuppressorWorklet-ts'));
        });
      } catch (e) {
        Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while initializing noise suppression effect ${e}`);
        resolve(undefined);
      }
    });
  });
}

/**
 * Class Implementing the effect expected by a NoiseSupression.
 * Effect applies rnnoise denoising on a audio localTrack.
 */
export class NoiseSuppressionEffect {
  /**
   * Source that will be attached to the track affected by the effect.
   */
  private audioSource: MediaStreamAudioSourceNode | undefined;

  /**
   * Destination that will contain denoised audio from the audio worklet.
   */
  private audioDestination: MediaStreamAudioDestinationNode | undefined;

  /**
   * `AudioWorkletProcessor` associated node.
   */
  public noiseSuppressorNode?: AudioWorkletNode;

  /**
   * Audio track extracted from the original MediaStream to which the effect is applied.
   */
  private originalMediaTrack: MediaStreamTrack | undefined;

  /**
   * Noise suppressed audio track extracted from the media destination node.
   */
  private outputMediaTrack: MediaStreamTrack | undefined;

  private init: any;

  prepareAudioWorklet = function (): Promise<AudioWorkletNode | undefined> {
    return new Promise((resolve) => {
      if (!audioContext) {
        audioContext = new AudioContext();
      }

      initializeKRnnoise().then((node) => {
        if (node) {
          this.noiseSuppressorNode = node;
          resolve(this.noiseSuppressorNode);
        } else {
          resolve(undefined);
        }
      });
    });
  };

  /**
   * Effect interface called by source NoiseSuppresion.
   * Applies effect that uses a {@code NoiseSuppressor} service
   * initialized with {@code RnnoiseProcessor}
   * for denoising.
   *
   * @param {MediaStream} audioStream - Audio stream which will be mixed with _mixAudio.
   * @returns {MediaStream} - MediaStream containing both audio tracks mixed together.
   */
  startEffect(audioStream: MediaStream): MediaStream {
    try {
      // eslint-disable-next-line prefer-destructuring
      this.originalMediaTrack = audioStream.getAudioTracks()[0];
      this.audioSource = audioContext.createMediaStreamSource(audioStream);
      this.audioDestination = audioContext.createMediaStreamDestination();
      // eslint-disable-next-line prefer-destructuring
      this.outputMediaTrack = this.audioDestination.stream.getAudioTracks()[0];

      if (this.noiseSuppressorNode && this.audioSource && this.audioDestination) {
        this.audioSource.connect(this.noiseSuppressorNode);
        this.noiseSuppressorNode.connect(this.audioDestination);
      }

      // Sync the effect track muted state with the original track state.
      this.outputMediaTrack.enabled = this.originalMediaTrack.enabled;

      // // We enable the audio on the original track because
      // mute/unmute action will only affect the audio destination
      // // output track from this point on.
      this.originalMediaTrack.enabled = true;

      return this.audioDestination.stream;
    } catch (e) {
      Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while starting noise suppression effect ${e}`);
      return audioStream;
    }
  }

  /**
   * Clean up resources acquired by noise suppressor and rnnoise processor.
   *
   * @returns {void}
   */
  stopEffect(): void {
    try {
      if (this.originalMediaTrack && this.outputMediaTrack) {
        this.originalMediaTrack.enabled = this.outputMediaTrack.enabled;
      }

      this.audioDestination?.disconnect();
      this.audioSource?.disconnect();
    } catch (e) {
      Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while stopping noise suppression effect ${e}`);
    }
  }

  muteEffect(): void {
    try {
      if (this.noiseSuppressorNode && this.audioSource && this.audioDestination) {
        this.audioSource.disconnect(this.noiseSuppressorNode);
        this.noiseSuppressorNode.disconnect(this.audioDestination);
      }
    } catch (e) {
      Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while mute in noise suppression effect ${e}`);
    }
  }

  unmuteEffect(): void {
    try {
      if (this.noiseSuppressorNode && this.audioSource && this.audioDestination) {
        this.audioSource.connect(this.noiseSuppressorNode);
        this.noiseSuppressorNode.connect(this.audioDestination);
      }
    } catch (e) {
      Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while unmute in noise suppression effect ${e}`);
    }
  }

  clearEffect(): void {
    try {
      if (this.originalMediaTrack && this.outputMediaTrack) {
        // Sync original track muted state with effect state before removing the effect.
        this.originalMediaTrack.enabled = this.outputMediaTrack.enabled;
      }

      this.noiseSuppressorNode?.port?.close();

      this.audioDestination?.disconnect();
      this.noiseSuppressorNode?.disconnect();
      this.audioSource?.disconnect();

      audioContext.suspend();
    } catch (e) {
      Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while clearing noise suppression effect ${e}`);
    }
  }
}

export function getBaseUrl(w: typeof window = window) {
  const doc = w.document;
  const base = doc.querySelector('base');

  if (base?.href) {
    return base.href;
  }

  const { protocol, host } = w.location;

  return `${protocol}//${host}`;
}

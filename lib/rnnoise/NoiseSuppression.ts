/* eslint-disable import/no-cycle */
// eslint-disable-next-line import/named
import { Client } from "../client";
import { Logger } from "../logger";
import * as C from "../constants";
import { NoiseSuppressionEffect } from "./NoiseSuppressionEffect";
import { replaceStream } from "../media/audioDevice";
import getBrowserDetails from "../utils/browserDetection";

const Plivo = {
  log: Logger,
};

// eslint-disable-next-line import/prefer-default-export
export class NoiseSuppression {
  private client: Client;

  private noiseSuppresionEffect: NoiseSuppressionEffect;

  public noiseSupressionRunning: boolean = false;

  public started = false;

  constructor(client: Client) {
    this.client = client;
    if (client.enableNoiseReduction && !this.noiseSuppresionEffect && getBrowserDetails().browser !== 'safari') {
      Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression instance created`);
      this.initNoiseSuppresionEffect();
    }
  }

  public initNoiseSuppresionEffect = function (): Promise<void> {
    return new Promise((resolve) => {
      this.noiseSuppresionEffect = new NoiseSuppressionEffect();
      this.noiseSuppresionEffect.prepareAudioWorklet().then(() => {
        resolve();
      });
    });
  };

  public startNoiseSuppression = function (mediaStream?: MediaStream):
  Promise<MediaStream | null> {
    return new Promise((resolve) => {
      if (this.noiseSupressionRunning) {
        Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression is already running. Cannot start again`);
        resolve((window as any).localStream);
      } else if (mediaStream) {
        if (this.noiseSuppresionEffect
          && this.noiseSuppresionEffect.noiseSuppressorNode && this.started) {
          Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression started. Starting effect on current stream`);
          this.noiseSupressionRunning = true;
          const processedStream = this.noiseSuppresionEffect.startEffect(mediaStream);
          (window as any).localStream = processedStream;
          resolve(processedStream);
        } else {
          Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression is not running, returning mediastream`);
          (window as any).localStream = mediaStream;
          resolve(mediaStream);
        }
      } else {
        this.setLocalMediaStream().then((stream: any) => {
          Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Fetching new stream to process`);
          if (stream) {
            if (this.noiseSuppresionEffect
              && this.noiseSuppresionEffect.noiseSuppressorNode && this.started) {
              Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression started. Starting effect on new stream`);
              this.noiseSupressionRunning = true;
              const processedStream = this.noiseSuppresionEffect.startEffect(stream);
              (window as any).localStream = processedStream;
              resolve(processedStream);
            } else {
              Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression is not running, returning new stream without processing`);
              resolve(stream);
            }
          } else {
            Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Could not fetch new stream. Returning current localStream`);
            resolve((window as any).localStream);
          }
        }).catch((err) => {
          Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | Error while fetching the new stream ${err}`);
          resolve((window as any).localStream);
        });
      }
    });
  };

  public stopNoiseSuppresion = (): void => {
    if (this.noiseSuppresionEffect && this.noiseSuppresionEffect.noiseSuppressorNode) {
      if (!this.noiseSupressionRunning) {
        Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Noise Suppression is already stopped. Cannot stop again`);
        return;
      }
      Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Stopping noise suppression`);
      this.noiseSupressionRunning = false;
      this.noiseSuppresionEffect.stopEffect();
    }
  };

  public setLocalMediaStream = function (): Promise<MediaStream | null> {
    return new Promise((resolve, reject) => {
      if ((window as any).localStream) {
        Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Returning current localstream`);
        resolve((window as any).localStream);
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: this.client.options.audioConstraints, video: false })
          .then((mediaStream) => {
            Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Got the new stream from getUserMedia`);
            (window as any).localStream = mediaStream;
            resolve(mediaStream);
          }).catch((err) => {
            Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Error in navigator.getUserMedia ${err}`);
            reject(err);
          });
      } else {
        Plivo.log.error(`${C.LOGCAT.CALL_QUALITY} | getUserMedia not available`);
        reject(new Error('getUserMedia not available'));
      }
    });
  };

  public updateProcessingStream = function (stream: MediaStream): Promise<MediaStream | null> {
    return new Promise((resolve) => {
      if (this.noiseSuppresionEffect && (this.noiseSupressionRunning || this.started)) {
        this.stopNoiseSuppresion();
        this.startNoiseSuppression(stream).then((newStream) => {
          Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Updated stream with a new stream`);
          (window as any).localStream = newStream;
          resolve(newStream);
        });
      } else {
        Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Noise suppresion not started. Returning current stream`);
        resolve(stream);
      }
    });
  };

  public clearNoiseSupression = (): void => {
    if (this.noiseSuppresionEffect) {
      Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | Noise suppression cleared`);
      this.noiseSupressionRunning = false;
      this.started = false;
      this.noiseSuppresionEffect.clearEffect();
    }
  };

  public muteStream = (): void => {
    if (this.noiseSuppresionEffect && this.noiseSupressionRunning) {
      Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | processed stream muted`);
      this.noiseSuppresionEffect.muteEffect();
    }
  };

  public unmuteStream = (): void => {
    if (this.noiseSuppresionEffect && this.noiseSupressionRunning) {
      Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | processed stream unmuted`);
      this.noiseSuppresionEffect.unmuteEffect();
    }
  };

  // eslint-disable-next-line func-names
  public startNoiseSuppresionManual = function (): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.noiseSuppresionEffect
        && this.noiseSuppresionEffect.noiseSuppressorNode
        && this.client) {
        Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | starting noise suppresion`);
        if (this.started) {
          Plivo.log.info(`${C.LOGCAT.CALL_QUALITY} | noise suppresion already started. Cannot start again`);
          reject(new Error('Noise suprresion is already started'));
        } else {
          this.started = true;
          replaceStream(this.client, { audio: this.client.options.audioConstraints, video: false })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        }
      } else {
        reject(new Error('Noise reduction is not instantiated. Please check if "enableNoiseReduction" is passed as true while initializing the SDK'));
      }
    });
  };

  // eslint-disable-next-line func-names
  public stopNoiseSuppressionManual = function (): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.noiseSuppresionEffect
        && this.noiseSuppresionEffect.noiseSuppressorNode
        && this.client) {
        Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | stopping noise suppresion`);
        if (!this.started) {
          Plivo.log.debug(`${C.LOGCAT.CALL_QUALITY} | noise suppresion already stopped. Cannot stop again`);
          reject(new Error('Noise suprresion is already stopped'));
        } else {
          this.started = false;
          replaceStream(this.client, { audio: this.client.options.audioConstraints, video: false })
            .then(() => {
              resolve();
            }).catch((err) => {
              reject(err);
            });
        }
      } else {
        reject(new Error('Noise reduction is not instantiated. Please check if "enableNoiseReduction" is passed as true while initializing the SDK'));
      }
    });
  };
}

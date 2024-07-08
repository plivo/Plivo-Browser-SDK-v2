/* eslint-disable import/extensions */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

// eslint-disable-next-line import/extensions, import/no-cycle
import { Logger } from '../logger';
import NetworkCheckWorker from '../networkCheckTimer.worker.ts';
import { LOGCAT } from '../constants';

const Plivo = { log: Logger };
export class WorkerManager {
  workerInstance: Worker | null;

  networkCheckRunning: boolean = false;

  onTimerCallback: any;

  responseCallback: any;

  timerStartedOnMain: any;

  constructor() {
    Plivo.log.debug(`${LOGCAT.NIMBUS} | starting the worker thread`);
    this.workerInstance = new NetworkCheckWorker();
    this.timerStartedOnMain = false;
    if (this.workerInstance) {
      this.workerInstance.addEventListener('message', (msg) => {
        this.onMessageReceived(msg);
      });
      this.workerInstance.addEventListener('error', (error) => {
        this.onErrorReceived(error);
        this.workerInstance?.removeEventListener('message', () => {});
        this.workerInstance?.removeEventListener('error', () => {});
        this.workerInstance = null;
      });
    }
  }

  /**
  * Callback triggered when error is received while starting worker thread.
  * @param {ErrorEvent} msg - error message received
  */
  onErrorReceived = (msg: ErrorEvent) => {
    Plivo.log.debug(`${LOGCAT.NIMBUS} | received error from the worker thread ${msg}`);
    this.workerInstance = null;
  };

  /**
  * Callback triggered when message is received from the worker thread.
  * @param {any} msg - message received
  */
  onMessageReceived = (msg: any) => {
    if (msg && msg.data) {
      const { event } = msg.data;
      if (event !== 'timerExecuted') {
        Plivo.log.debug(`${LOGCAT.NIMBUS} | received event from the worker thread: ${event}`);
      }
      switch (event) {
        case 'timerStarted':
          this.responseCallback = null;
          break;

        case 'timerExecuted':
          if (this.timerStartedOnMain) {
            Plivo.log.debug(`${LOGCAT.NIMBUS} | timer already running on the main thread`);
            this.stopNetworkChecktimer();
            this.timerStartedOnMain = false;
          } else if (this.onTimerCallback) {
            this.onTimerCallback();
          }
          break;

        case 'timerStopped':
          break;

        case 'initSuccess':
          break;

        default:
          break;
      }
    }
  };

  /**
  * Start the network check timer.
  * @param {number} networkCheckInterval - time interval at which the timer is to be executed.
  * @param {any} callback - callback to be trigerred when the timer executes.
  */
  startNetworkCheckTimer = (networkCheckInterval: number, callback: any, responseCallback: any) => {
    Plivo.log.debug(`${LOGCAT.NIMBUS} | starting the network check timer`);
    this.networkCheckRunning = true;
    if (this.workerInstance) {
      this.workerInstance.postMessage({
        event: 'startTimer',
        networkCheckInterval,
      });
      this.responseCallback = responseCallback;
      this.onTimerCallback = callback;
      setTimeout(() => {
        if (this.responseCallback) {
          this.responseCallback();
          this.responseCallback = null;
        }
      }, 1000);
    }
  };

  /**
  * Stop the network check timer.
  */
  stopNetworkChecktimer = () => {
    Plivo.log.debug(`${LOGCAT.NIMBUS} | stopping the network check timer`);
    this.networkCheckRunning = false;
    if (this.workerInstance) {
      this.workerInstance.postMessage({
        event: 'stopTimer',
      });
    }
  };
}

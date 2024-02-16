/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

// eslint-disable-next-line import/no-cycle
import { Client } from './client';
import {
  CONSOLE_LOGS_BUFFER_SIZE, LOGCAT, LOG_COLLECTION, LOG_COLLECTION_JWT,
} from './constants';
import Storage from './storage';
import { getOS, getSDKVersion } from './utils/device';

/* eslint-disable no-undef */
const consoleLogsArr: string[] = [];
const customLocalStorage = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : window.localStorage;
const allowedMethods = ['INFO', 'DEBUG', 'WARN', 'ERROR', 'ALL', 'OFF'];
const logHierarchy = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'ALL'];
const DEFAULT_LOG_METHOD = 'INFO';

export type AvailableLogMethods = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'ALL' | 'OFF' | 'ALL-PLAIN';
export type AvailableFlagValues = 'ALL' | 'NONE' | 'REMOTEONLY' | 'LOCALONLY';

export interface DtmfOptions {
  sendDtmfType : string[]
}
interface LoggerOptions{
  enableDate?: boolean,
  loggingName?: 'PlivoSDK',
  logMethod?: AvailableLogMethods
}

interface Body{
  username: string | null,
  logs: string[],
  jwt?: string | null,
  sdk_v: string,
  sdk_name: string,
  user_agent: string,
  call_uuid: string,
}

/**
 * Create a new logger.
 */
class PlivoLogger {
  private options:LoggerOptions;

  private logMethod:AvailableLogMethods;

  constructor(options:LoggerOptions = {}) {
    this.options = options;
    this.logMethod = this.options.logMethod || DEFAULT_LOG_METHOD;
  }

  public info = (...rest:any[]): void => this.logging('INFO', rest);

  public debug = (...rest:any[]): void => this.logging('DEBUG', rest);

  public warn = (...rest:any[]): void => this.logging('WARN', rest);

  public error = (...rest:any[]): void => this.logging('ERROR', rest);

  public setLevel = (method:AvailableLogMethods): string => this._setLevel(method);

  public level = (): string => this.logMethod;

  public consolelogs = (): string[] => consoleLogsArr;

  // public send = (): void => this._send();

  /**
   * Enable sip logs if log level is ALL.
   * @param {AvailableLogMethods} debugLevel - passed by user while initializing client
   */
  public enableSipLogs = (debugLevel:AvailableLogMethods): void => this._enableSipLogs(debugLevel);

  // private methods

  private _setLevel = (method:AvailableLogMethods): string => {
    const ucMethod = method.toUpperCase() as AvailableLogMethods;
    if (allowedMethods.indexOf(ucMethod) !== -1) {
      this.logMethod = ucMethod;
      if (['DEBUG', 'ALL'].indexOf(ucMethod) === -1) {
        (customLocalStorage as any).debug = '';
      }
      return `logLevel is now : ${this.logMethod}`;
    }
    return (
      `only : ${allowedMethods.toString()} are allowed in run time!`
    );
  };

  private _enableSipLogs = (debugLevel:AvailableLogMethods): void => {
    if (['ALL', 'ALL-PLAIN'].indexOf(debugLevel) !== -1) {
      (customLocalStorage as any).debug = 'JsSIP:*';
      (window as any)._PlivoUseColorLog = true;
      // Turn off coloring in SIPlib console
      if (debugLevel === 'ALL-PLAIN') {
        (window as any)._PlivoUseColorLog = false;
      }
    } else {
      (customLocalStorage as any).debug = '';
    }
  };

  private _appendToQueue = (premsg, arg1, arg2) => {
    let flag : boolean = false;

    if (arg1.includes(LOGCAT.INIT)) flag = true;
    if (arg1.includes(LOGCAT.CALL)) flag = true;
    if (arg1.includes(LOGCAT.LOGIN)) flag = true;
    if (arg1.includes(LOGCAT.LOGOUT)) flag = true;
    if (arg1.includes(LOGCAT.CRASH)) flag = true;
    if (arg1.includes(LOGCAT.CALL_QUALITY)) flag = true;
    if (arg1.includes(LOGCAT.NETWORK_CHANGE)) flag = true;
    if (arg1.includes(LOGCAT.NIMBUS)) flag = true;

    if (flag) Storage.getInstance().setData(premsg, arg1, arg2);
  };

  /**
   * Add console logs in memory and achieve log hierarchy.
   * @param {AvailableLogMethods} filter - log type
   * @param {Array<String>} args - logger arguments
   */
  private logging = (filter:AvailableLogMethods, args:string[]): void => {
    const ucFilter = filter.toUpperCase();
    const arg1 = args[0] || ' ';
    const arg2 = args[1] || ' ';

    if ((allowedMethods.indexOf(this.logMethod) !== -1) || (this.logMethod === ucFilter)) {
      const enableDate = this.options.enableDate || false;
      const loggingName = this.options.loggingName || '';
      const date = new Date();
      let msdate = '';
      if (enableDate) msdate = `[${date.toISOString().substring(0, 10)} ${date.toString().split(' ')[4]}.${date.getMilliseconds()}]`;
      const premsg = `${msdate} [${ucFilter}] ${loggingName} :: `;
      // Number of logs which sdk store in memory
      if (consoleLogsArr.length >= CONSOLE_LOGS_BUFFER_SIZE) consoleLogsArr.shift();
      consoleLogsArr.push(`${premsg + arg1 + arg2} \n`);
      this._appendToQueue(premsg, arg1, arg2);
      if (logHierarchy.indexOf(ucFilter) > logHierarchy.indexOf(this.logMethod)) {
        return;
      }
      switch (ucFilter) {
        case 'OFF':
          // do nothing
          break;
        case 'INFO':
          console.info(premsg, arg1, arg2);
          break;
        case 'DEBUG':
          console.debug(premsg, arg1, arg2);
          break;
        case 'WARN':
          console.warn(premsg, arg1, arg2);
          break;
        case 'ERROR':
          console.error(premsg, arg1, arg2);
          break;
        default:
          console.log(premsg, arg1, arg2);
      }
    }
  };

  private _getLogsBatchData = (arr: Array<string>, splitInterval: number): Array<Array<string>> => {
    let logsCount = 0;
    const batchData: Array<Array<string>> = [];
    let currentBatch: Array<string> = [];
    arr.forEach((log:string) => {
      logsCount += log.length;
      if (logsCount > splitInterval) {
        currentBatch.push("...continue");
        batchData.push(currentBatch);
        currentBatch = [];
        logsCount = 0;
      }
      currentBatch.push(log);
    });
    if (currentBatch.length !== 0) {
      if (batchData.length > 0) {
        currentBatch.push("...continue");
      }
      batchData.push(currentBatch);
    }
    return batchData;
  };

  private _sendBatchedLogsToServer = (
    client: Client,
    myHeaders,
    logs: Array<Array<string>>,
    index: number,
    callUUID: string = "",
    userName: string | null = "",
  ): Promise<string> => new Promise((resolve, reject) => {
    const sdkVersionParse = getSDKVersion();
    const deviceOs = getOS();

    const body: Body = {
      username: client.userName,
      logs: logs[index],
      sdk_v: sdkVersionParse.version,
      sdk_name: "BrowserSDK",
      user_agent: deviceOs,
      call_uuid: client.getCallUUID() ?? "",
    };

    if (callUUID && callUUID !== "") {
      body.call_uuid = callUUID;
    }

    if (userName && userName !== "") {
      body.username = userName;
    }

    if (client.isAccessToken) body.jwt = client.accessToken;

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(body),
      redirect: 'follow',
    };
    const url = (client.isAccessToken) ? LOG_COLLECTION_JWT : LOG_COLLECTION;
    fetch(url.trimEnd(), requestOptions)
      .then((response) => {
        if (!response.ok) {
          this.info(`${LOGCAT.NIMBUS} | Error while uploading logs to nimbus`);
          reject(new Error('failure'));
        } else {
          index += 1;
          if (logs.length > index) {
            this._sendBatchedLogsToServer(client, myHeaders, logs, index,
              body.call_uuid,
              body.username);
          } else {
            Storage.getInstance().clear();
          }
          resolve('success');
        }

        response.text();
      })
      .then((result) => console.log(result))
      .catch((error) => {
        console.log('error', error);
        reject(error);
      });
  });

  /**
 * Send logs to Plivo kibana.
 */
  send = (client: Client): void => {
    if (!process.env.PLIVO_ENV) return;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const data = Storage.getInstance().getData();

    if (!data) {
      console.log("No data to send");
      return;
    }

    if (!client.userName) return;

    const parsedData = JSON.parse(data);
    const arr = parsedData.split("\n");
    const batchData = this._getLogsBatchData(arr, 20000);
    this._sendBatchedLogsToServer(client, myHeaders, batchData, 0);
  };
}

export const Logger = new PlivoLogger({
  enableDate: true,
  loggingName: 'PlivoSDK',
  logMethod: 'DEBUG',
});

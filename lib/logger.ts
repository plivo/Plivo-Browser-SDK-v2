/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import { CONSOLE_LOGS_BUFFER_SIZE, LOGCAT } from './constants';
import Storage from './storage';

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

    if (premsg.includes(LOGCAT.INIT)) flag = true;
    if (premsg.includes(LOGCAT.CALL)) flag = true;
    if (premsg.includes(LOGCAT.LOGIN)) flag = true;
    if (premsg.includes(LOGCAT.LOGOUT)) flag = true;
    if (premsg.includes(LOGCAT.CRASH)) flag = true;
    if (premsg.includes(LOGCAT.CALL_QUALITY)) flag = true;

    if (flag) Storage.getInstance().setData(premsg, arg1, arg2); else console.log("*** LOG SKIPPED ***");
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
      if (logHierarchy.indexOf(ucFilter) > logHierarchy.indexOf(this.logMethod)) {
        return;
      }
      this._appendToQueue(premsg, arg1, arg2);
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
}

export const Logger = new PlivoLogger({
  enableDate: true,
  loggingName: 'PlivoSDK',
  logMethod: 'DEBUG',
});

/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import * as C from '../constants';
import {
  Logger, AvailableLogMethods, AvailableFlagValues, DtmfOptions,
} from '../logger';
import { ConfiguationOptions } from '../client';

const Plivo = { log: Logger };

// Default options flag
// eslint-disable-next-line
const _options: ConfiguationOptions = {
  codecs: C.DEFAULT_CODECS,
  enableTracking: true,
  enableQualityTracking: C.DEFAULT_ENABLE_QUALITY_TRACKING,
  debug: C.DEFAULT_LOG_LEVEL,
  permOnClick: false,
  enableIPV6: false,
  audioConstraints: C.AUDIO_CONSTRAINTS as any,
  dscp: true,
  appId: null,
  appSecret: null,
  registrationDomainSocket: null,
  clientRegion: null,
  preDetectOwa: false,
  disableRtpTimeOut: false,
  allowMultipleIncomingCalls: false,
  closeProtection: false,
  useDefaultAudioDevice: false,
  maxAverageBitrate: C.MAX_AVERAGE_BITRATE,
  dtmfOptions: C.DEFAULT_DTMFOPTIONS,
  enableNoiseReduction: false,
  usePlivoStunServer: false,
  registrationRefreshTimer: C.REGISTER_EXPIRES_SECONDS,
};

/**
 * Check if the value is boolean or not
 * @param {String} key - option key
 * @param {Boolean} val - option value
 */
const isBoolean = function (key: string, val?: boolean): boolean {
  if (typeof val === 'boolean') {
    return true;
  }
  Plivo.log.error(`${key} has to be boolean. ${val} is not accepted`);
  return false;
};

/**
 * Check if provided codecs are present in the list of predefined codecs.
 * @param {Array<String>} codecOptions - codecs passed by user while initializing client
 */
const checkCodecs = function (codecOptions?: string[]): boolean {
  const defaultCodecs = C.DEFAULT_CODECS;
  if (Array.isArray(codecOptions)) {
    let isCheckPassed = true;
    codecOptions.forEach((codec) => {
      if (defaultCodecs.indexOf(codec) === -1) {
        isCheckPassed = false;
        Plivo.log.warn('Ignoring invalid codec - ', codec);
        Plivo.log.debug('Allowed list: ', defaultCodecs);
      }
    });
    return isCheckPassed;
  }
  Plivo.log.error('Please send codecs in array format. Eg:', defaultCodecs);
  return false;
};

/**
 * Check if the value is number or not
 * @param {String} key - option key
 * @param {Number} val - option value
 */
const isNumber = function (key: any, val?: number): boolean {
  if (typeof val === 'number') {
    return true;
  }
  Plivo.log.error(`${key} has to be number. ${val} is not accepted`);
  return false;
};

/**
 * Check if the value is whole number or not
 * @param {Number} num - option value
 */
const isWholeNumber = function (num?: number): boolean {
  return num === Math.round(num!);
};

/**
 * Check if provided debug mode is present in the list of predefined modes.
 * @param {AvailableLogMethods} mode - debug mode passed by user while initializing client
 */
const checkDebug = function (mode?: AvailableLogMethods): boolean {
  const defaultModes = C.DEBUG_MODES;
  if (defaultModes.indexOf(mode!) === -1) {
    Plivo.log.error(`debug method ${mode} is not allowed`);
    Plivo.log.debug('Allowed list for debug: ', defaultModes);
    return false;
  }
  return true;
};

/**
 * Check if provided region name is present in the list of predefined regions.
 * @param {String} name - region name passed by user while initializing client
 */
const checkRegion = function (name: string): boolean {
  const defaultRegions = C.REGION;
  if (defaultRegions.indexOf(name) === -1) {
    Plivo.log.error(`region name ${name} is not allowed`);
    Plivo.log.debug('Allowed list for regions: ', defaultRegions);
    return false;
  }
  return true;
};

/**
 * Check if provided dtmf options are present in the list of predefined dtmf options.
 * @param {Array<String>} dtmfOptions - dtmf options passed by user while initializing client
 */
const checkDTMFOptions = function (dtmfOptions: DtmfOptions): DtmfOptions {
  let dtmfoptionsLocal: string[];
  const finalDtmfOptions: string[] = [];
  if (dtmfOptions && 'sendDtmfType' in dtmfOptions) {
    dtmfoptionsLocal = dtmfOptions.sendDtmfType;
  } else {
    return C.DEFAULT_DTMFOPTIONS;
  }
  const allowedDtmfOptions = C.DTMF_OPTIONS;
  if (Array.isArray(dtmfoptionsLocal)) {
    dtmfoptionsLocal.forEach((dtmf) => {
      if (allowedDtmfOptions.indexOf(dtmf.toUpperCase()) === -1) {
        Plivo.log.warn('Ignoring invalid dtmf option - ', dtmf);
        Plivo.log.debug('Allowed list of dtmf options : ', allowedDtmfOptions);
      } else {
        finalDtmfOptions.push(dtmf.toUpperCase());
      }
    });
    if (finalDtmfOptions.length === 0) return C.DEFAULT_DTMFOPTIONS;
    return { sendDtmfType: finalDtmfOptions };
  }
  Plivo.log.error('Please send dtmfoption in following format. Eg: ', C.DEFAULT_DTMFOPTIONS);
  return C.DEFAULT_DTMFOPTIONS;
};

/**
 * Validate all options we get during initialization.
 * @param {ConfiguationOptions} options - client configuration parameters
 * @returns Validated options
 */
const validateOptions = function (
  options: ConfiguationOptions,
): ConfiguationOptions {
  if (typeof options !== 'undefined') {
    const keys = Object.keys(options);
    keys.forEach((key) => {
      // Use default options when validation fails
      switch (key) {
        case 'enableTracking':
          if (isBoolean(key, options[key])) {
            _options.enableTracking = options[key];
          } else {
            _options.enableTracking = true;
          }
          break;

        case 'enableQualityTracking':
          if (options[key] !== undefined) {
            const optionValue = options[key]!.toString().toUpperCase() as AvailableFlagValues;
            if (C.ENABLE_QUALITY_TRACKING_ALLOWED_VALUES.indexOf(optionValue) !== -1) {
              _options.enableQualityTracking = optionValue;
            } else {
              Plivo.log.error(`The value set for ${key} is ${options[key]} which is not valid. Please choose one from following string values : [ ${C.ENABLE_QUALITY_TRACKING_ALLOWED_VALUES} ]`);
            }
          }
          break;

        case 'debug':
          // Convert log mode to all uppercase
          options[key] = options[key]!.toUpperCase() as AvailableLogMethods;
          if (checkDebug(options[key])) {
            _options.debug = options[key];
            if (options[key] === 'ALL-PLAIN') {
              _options[key] = 'ALL'; // Since logger module does not support all-plain
            }
            Plivo.log.setLevel(options[key]!);
          } else {
            Plivo.log.setLevel('INFO');
          }
          break;

        case 'permOnClick':
          if (isBoolean(key, options[key])) {
            this.permOnClick = options[key];
            _options.permOnClick = options[key];
          }
          break;

        case 'audioConstraints':
          if (options[key] && typeof options[key] === 'object') {
            _options.audioConstraints = options[key];
          } else {
            _options.audioConstraints = C.AUDIO_CONSTRAINTS as any;
          }
          break;

        case 'dscp':
          if (isBoolean(key, options[key])) {
            _options.dscp = options[key];
          }
          break;

        case 'enableNoiseReduction':
          if (isBoolean(key, options[key])) {
            _options.enableNoiseReduction = options[key];
          }
          break;

        case 'codecs':
          if (checkCodecs(options[key])) {
            _options.codecs = options[key];
          }
          break;

        case 'useDefaultAudioDevice':
          if (isBoolean(key, options[key])) {
            _options.useDefaultAudioDevice = options[key];
          }
          break;

        case 'usePlivoStunServer':
          if (isBoolean(key, options[key])) {
            _options.usePlivoStunServer = options[key];
          }
          break;

        case 'appSecret':
          _options.appSecret = options[key];
          break;

        case 'appId':
          _options.appId = options[key];
          break;

        case 'registrationRefreshTimer':
          if (isNumber(key, options[key])) {
            if (options[key]! >= C.MIN_REGISTRATION_REFRESH_TIMER
              && options[key]! <= C.MAX_REGISTRATION_REFRESH_TIMER) {
              _options.registrationRefreshTimer = options[key];
            } else {
              Plivo.log.error(
                `registrationRefreshTimer should be an integer in between ${
                  C.MIN_REGISTRATION_REFRESH_TIMER
                } and ${
                  C.MAX_REGISTRATION_REFRESH_TIMER}`,
              );
            }
          }
          break;

        case 'registrationDomainSocket':
          _options.registrationDomainSocket = options[key];
          break;

        case 'enableIPV6':
          break;

        case 'clientRegion':
          if (checkRegion(options[key] as string)) {
            _options.clientRegion = options[key];
          }
          break;

        case 'preDetectOwa':
          if (isBoolean(key, options[key])) {
            _options.preDetectOwa = false;
          }
          break;

        case 'disableRtpTimeOut':
          if (isBoolean(key, options[key])) {
            _options.disableRtpTimeOut = options[key];
          }
          break;
        case 'allowMultipleIncomingCalls':
          if (isBoolean(key, options[key])) {
            _options.allowMultipleIncomingCalls = options[key];
          }
          break;
        case 'closeProtection':
          if (isBoolean(key, options[key])) {
            _options.closeProtection = options[key];
          }
          break;
        case 'maxAverageBitrate':
          if (isNumber(key, options[key])) {
            if (
              options[key]! >= C.MIN_AVERAGE_BITRATE
              && options[key]! <= C.MAX_AVERAGE_BITRATE
              && isWholeNumber(options[key])
            ) {
              _options.maxAverageBitrate = Math.floor(options[key]!);
            } else {
              Plivo.log.error(
                `maxAverageBitrate should be an integer in between ${
                  C.MIN_AVERAGE_BITRATE
                } and ${
                  C.MAX_AVERAGE_BITRATE}`,
              );
            }
          }
          break;
        case 'dtmfOptions':
          if (options[key] && typeof options[key] === 'object') {
            _options.dtmfOptions = checkDTMFOptions(options[key] as any);
          } else {
            _options.dtmfOptions = C.DEFAULT_DTMFOPTIONS;
          }
          break;
        default:
          Plivo.log.warn(`Ignoring invalid option key ${key}`);
      }
    });
  }
  return _options;
};

export default validateOptions;

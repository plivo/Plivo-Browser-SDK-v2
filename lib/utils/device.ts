import semverParser from 'semver-parser';
import pkg from '../../package.json';

export interface SemverParserVersion {
  version: string;
  matches: boolean;
  major: number;
  minor: number;
  patch: number;
  pre: Array<string | number>;
  build: Array<string | number>;
}

/**
 * Get OS name on which SDK is running.
 */
export const getOS = (): string => {
  let OSName = 'Unknown OS';
  if (navigator.userAgent.indexOf('Win') !== -1) OSName = 'Windows';
  if (navigator.userAgent.indexOf('Mac') !== -1) OSName = 'Macintosh';
  if (navigator.userAgent.indexOf('Linux') !== -1) OSName = 'Linux';
  if (navigator.userAgent.indexOf('Android') !== -1) OSName = 'Android';
  if (navigator.userAgent.indexOf('like Mac') !== -1) OSName = 'iOS';
  if (navigator.userAgent.indexOf('CrOS') !== -1) OSName = 'Chromium';
  return OSName;
};

/**
 * Check if media devices are supported in browser.
 */
export const checkMediaDevices = (): void => {
  if (!navigator.mediaDevices) {
    if (/Chrome/.test(navigator.userAgent)) {
      throw new Error(
        'This Chrome version supports microphone access only in HTTPS web applications. https://bit.ly/2SiWjWN',
      );
    } else if (/Firefox/.test(navigator.userAgent)) {
      throw new Error(
        'This Firefox version supports microphone access only in HTTPS web applications. https://mzl.la/2LSLIkr',
      );
    } else {
      throw new Error(
        'This Browser version supports microphone access only in HTTPS web applications.',
      );
    }
  }
};

/**
 * Get SDK version.
 */
export const getSDKVersion = (): SemverParserVersion => semverParser.parseSemVer(
  pkg.version, false,
);

/**
 * Get pre SDK version.
 */
export const getSdkVersionPre = (sdkVersionParse) => {
  if (!sdkVersionParse.pre) return '';
  const firstElement = sdkVersionParse.pre ? sdkVersionParse.pre[0] : '';
  const secondElement = sdkVersionParse.pre ? sdkVersionParse.pre[1] : '';
  return (firstElement !== '' && secondElement !== '') ? `${firstElement}.${secondElement}` : firstElement || secondElement || '';
};

/**
 * Get browser version.
 */
const getBrowserVersion = (): string => {
  const N = navigator.appName;
  const ua = navigator.userAgent;
  let tem: RegExpMatchArray | null;
  let M = ua.match(
    /(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i,
  );
  // eslint-disable-next-line no-cond-assign
  if (M && (tem = ua.match(/version\/([.\d]+)/i)) !== null) {
    // eslint-disable-next-line prefer-destructuring
    M[2] = tem[1];
  }
  M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
  return M[1];
};

/**
 * Get client version parsed through semver.
 */
export const getClientVersion = (): SemverParserVersion | number[] => {
  const browserVersion = getBrowserVersion();
  return semverParser.parseSemVer(browserVersion, false).matches
    ? semverParser.parseSemVer(browserVersion, false)
    : browserVersion.split('.');
};

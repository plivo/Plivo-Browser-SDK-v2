import semverParser from 'semver-parser';
import {
  getOS, checkMediaDevices, getSDKVersion, getClientVersion,
} from '../../../lib/utils/device';
import pkg from '../../../package.json';

describe('Device', () => {
  let macUserAgent: string; let winUserAgent: string; let linuxUserAgent: string; let androidUserAgent: string; let iOSUserAgent: string; let chromiumUserAgent: string; let firefoxUserAgent: string; let
    operaUserAgent: string;

  beforeAll(() => {
    // chrome useragents
    macUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';
    winUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';
    linuxUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';
    androidUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.81 Mobile Safari/537.36';
    iOSUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    chromiumUserAgent = 'Mozilla/5.0 (X11; CrOS armv7l 9592.96.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.114 Safari/537.36';
    // firefox useragent
    firefoxUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0';
    // opera useragent
    operaUserAgent = 'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.2.15 Version/10.00';
    //
  });

  it('should identify OS as Macintosh', () => {
    setUserAgent(macUserAgent);
    expect(getOS()).toBe('Macintosh');
  });

  it('should identify OS as Windows', () => {
    setUserAgent(winUserAgent);
    expect(getOS()).toBe('Windows');
  });

  it('should identify OS as Linux', () => {
    setUserAgent(linuxUserAgent);
    expect(getOS()).toBe('Linux');
  });

  it('should identify OS as Android', () => {
    setUserAgent(androidUserAgent);
    expect(getOS()).toBe('Android');
  });

  it('should identify OS as iOS', () => {
    setUserAgent(iOSUserAgent);
    expect(getOS()).toBe('iOS');
  });

  it('should identify OS as Chromium', () => {
    setUserAgent(chromiumUserAgent);
    expect(getOS()).toBe('Chromium');
  });

  it('should throw error when media devices not present for chrome', () => {
    setUserAgent(macUserAgent);
    expect(() => { checkMediaDevices(); }).toThrow(/This Chrome version/);
  });

  it('should throw error when media devices not present for firefox', () => {
    setUserAgent(firefoxUserAgent);
    expect(() => { checkMediaDevices(); }).toThrow(/This Firefox version/);
  });

  it('should throw error when media devices not present for other browsers', () => {
    setUserAgent(operaUserAgent);
    expect(() => { checkMediaDevices(); }).toThrow(/This Browser version/);
  });

  it('should give SDK version', () => {
    const expected = semverParser.parseSemVer(pkg.version, false);
    expect(getSDKVersion()).toStrictEqual(expected);
  });

  it('should give client version with version attribute in user agent', () => {
    const expected = ['10', '00'];
    setUserAgent(operaUserAgent);
    expect(getClientVersion()).toStrictEqual(expected);
  });

  it('should give client version without version attribute in user agent', () => {
    const expected = ['85', '0', '4183', '83'];
    setUserAgent(macUserAgent);
    expect(getClientVersion()).toStrictEqual(expected);
  });
});

const setUserAgent = (userAgent: any) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => userAgent,
    configurable: true,
  });
};

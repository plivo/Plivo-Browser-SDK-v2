/* eslint-disable import/no-cycle */
import adapter from 'webrtc-adapter';
import { BrowserDetails } from '../client';

/* eslint-disable no-undef */
declare const InstallTrigger: any;
declare const safari: any;
declare const opr: any;

const getBrowserDetails = (): BrowserDetails => {
  const browserDetails = {
    version: adapter.browserDetails.version as number,
    browser: adapter.browserDetails.browser,
  };
  if ((!!(window as any).opr && !!opr.addons) || !!(window as any).opera || navigator.userAgent.indexOf('OPR/') >= 0) {
    browserDetails.browser = 'opera';
    return browserDetails;
  }
  if (typeof InstallTrigger !== 'undefined') {
    browserDetails.browser = 'firefox';
    return browserDetails;
  }
  if (/constructor/i.test(window.HTMLElement as unknown as string) || (((p) => p.toString() === '[object SafariRemoteNotification]')(!(window as any).safari || (typeof safari !== 'undefined' && safari.pushNotification)))
  ) {
    // Safari 3.0+ "[object HTMLElementConstructor]"
    browserDetails.browser = 'safari';
    return browserDetails;
  }
  if (window.StyleMedia || ((!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)) && (navigator.userAgent.indexOf('Edg') !== -1))) {
    // Edge (based on chromium) detection
    browserDetails.browser = 'edge';
    return browserDetails;
  }
  if (!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)) {
    // Chrome 1 - 79
    browserDetails.browser = 'chrome';
    return browserDetails;
  }
  return browserDetails;
};

export default getBrowserDetails;

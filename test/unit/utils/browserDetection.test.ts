import getBrowserDetails from '../../../lib/utils/browserDetection';

describe('GetBrowserDetails', () => {

it('should be opera', () => {
		window['opera'] = {};
    expect(getBrowserDetails()).toStrictEqual({
			browser: 'opera',
			version: null
		})
	});
	
it('should be edge', () => {
		window['opera'] = null;
		(window as any)['HTMLElement'] = null;
		(window as any)['chrome'] = {
			runtime: {},
			webstore: {}
		};
		const EdgeUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36 Edg/86.0.622.38'
		setUserAgent(EdgeUserAgent)
    expect(getBrowserDetails()).toStrictEqual({
			browser: 'edge',
			version: null
		})
	});
	
	it('should be chrome', () => {
		window['opera'] = null;
		(window as any)['HTMLElement'] = null;
		(window as any)['chrome'] = {
			runtime: {},
			webstore: {}
		};
		const chromiumUserAgent = 'Mozilla/5.0 (X11; CrOS armv7l 9592.96.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.114 Safari/537.36';
		setUserAgent(chromiumUserAgent)
    expect(getBrowserDetails()).toStrictEqual({
			browser: 'chrome',
			version: null
		})
  });
});


const setUserAgent = (userAgent: any) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => userAgent,
    configurable: true,
  });
};
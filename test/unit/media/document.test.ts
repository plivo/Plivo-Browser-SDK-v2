import { setup, playAudio, stopAudio } from '../../../lib/media/document';
import * as C from '../../../lib/constants';

describe('Document', () => {
  let options;
  let eventType;
  let setupStatus;
  let isMediaAllowed;
  let context;

  beforeAll(() => {
    options = {
      permOnClick: true,
      audioConstraints: {
        optional: [{
          googAutoGainControl: false,
        }],
      },
    };
    context = {
      userName: 'testing',
      emit: (event, data) => {
        eventType = event;
        setupStatus = data && data.status;
        isMediaAllowed = data && data.stream;
      },
      callStats: {
        reportError() {},
        webRTCFunctions: {
          applicationLog: null,
        },
      },
    };
    (window as any).navigator.mediaDevices = {
      enumerateDevices: () => Promise.resolve([]),
      getUserMedia: () => Promise.resolve({}),
    };
    (window as any).RTCPeerConnection = {};
  });

  it('should create all the DOM elements which are used in the SDK', () => {
    expect(document.getElementById(C.REMOTE_VIEW_ID)).toBe(null);
    expect(document.getElementById(C.CONNECT_TONE_ELEMENT_ID)).toBe(null);
    expect(document.getElementById(C.RINGBACK_ELEMENT_ID)).toBe(null);
    expect(document.getElementById(C.RINGTONE_ELEMENT_ID)).toBe(null);
    expect(document.getElementById(C.SILENT_TONE_ELEMENT_ID)).toBe(null);
    expect(document.getElementById('dtmfstar')).toBe(null);
    expect(document.getElementById('dtmfpound')).toBe(null);
    setup(context, options);
    expect(document.getElementById(C.REMOTE_VIEW_ID)).not.toBe(null);
    expect(document.getElementById(C.CONNECT_TONE_ELEMENT_ID)).not.toBe(null);
    expect(document.getElementById(C.RINGBACK_ELEMENT_ID)).not.toBe(null);
    expect(document.getElementById(C.RINGTONE_ELEMENT_ID)).not.toBe(null);
    expect(document.getElementById(C.SILENT_TONE_ELEMENT_ID)).not.toBe(null);
    expect(document.getElementById('dtmfstar')).not.toBe(null);
    expect(document.getElementById('dtmfpound')).not.toBe(null);
    expect(eventType).toBe('onMediaPermission');
    expect(setupStatus).toBe('success');
    expect(isMediaAllowed).toBeFalsy();
  });

  it('should create all the DOM elements and allow media permission', async () => {
    options.permOnClick = false;
    setup(context, options);
    await new Promise<void>((res) => setTimeout(() => {
      expect(eventType).toBe('onMediaPermission');
      expect(setupStatus).toBe('success');
      expect(isMediaAllowed).toBeTruthy();
      res();
    }, 100));
  });

  it('should emit webrtc is not supported event', async () => {
    (window as any).RTCPeerConnection = undefined;
    setup(context, options);
    await new Promise<void>((res) => setTimeout(() => {
      (document as any).onreadystatechange({} as any);
      expect(eventType).toBe('onWebrtcNotSupported');
      res();
    }, 100));
  });

  it('should fail if getUserMedia is rejected', async () => {
    const userMediaFn = jest.spyOn(window.navigator.mediaDevices, 'getUserMedia').mockImplementation(() => Promise.reject({}));
    options.permOnClick = false;
    setup(context, options);
    await new Promise<void>((res) => setTimeout(() => {
      expect(eventType).toBe('onMediaPermission');
      expect(setupStatus).toBe('failure');
      res();
    }, 100));
    userMediaFn.mockRestore();
  });

  it('should fail if getUserMedia not available', async () => {
    (window as any).navigator.mediaDevices = {};
    options.permOnClick = false;
    setup(context, options);
    await new Promise<void>((res) => setTimeout(() => {
      expect(eventType).toBe('onMediaPermission');
      expect(setupStatus).toBe('failure');
      res();
    }, 100));
  });

  it('should play audio based on element id', () => {
    const getElementFn = jest.spyOn(document, 'getElementById').mockImplementation(() => ({
      currentTime: null,
      play() { return Promise.resolve(); },
    } as any));
    const consoleSpy = jest.spyOn(console, 'debug');
    playAudio(C.RINGBACK_ELEMENT_ID);
    expect(consoleSpy.mock.calls[0][1]).toBe('playAudio - plivo_ringbacktone');
    getElementFn.mockRestore();
    consoleSpy.mockClear();
  });

  it('should fail to play audio based on element id', () => {
    const getElementFn = jest.spyOn(document, 'getElementById').mockImplementation(() => ({} as any));
    const consoleSpy = jest.spyOn(console, 'debug');
    playAudio(C.RINGBACK_ELEMENT_ID);
    expect(consoleSpy.mock.calls[0][1]).toMatch(/failed to play audio for elementId plivo_ringbacktone/);
    getElementFn.mockRestore();
    consoleSpy.mockClear();
  });

  it('should stop audio based on element id', () => {
    const getElementFn = jest.spyOn(document, 'getElementById').mockImplementation(() => ({
      pause() {},
    } as any));
    const consoleSpy = jest.spyOn(console, 'debug');
    stopAudio(C.RINGBACK_ELEMENT_ID);
    expect(consoleSpy.mock.calls[0][1]).toBe('stopAudio - plivo_ringbacktone');
    getElementFn.mockRestore();
    consoleSpy.mockClear();
  });

  it('should fail to stop audio based on element id', () => {
    const getElementFn = jest.spyOn(document, 'getElementById').mockImplementation(() => ({} as any));
    const consoleSpy = jest.spyOn(console, 'debug');
    stopAudio(C.RINGBACK_ELEMENT_ID);
    expect(consoleSpy.mock.calls[0][1]).toMatch(/failed to stop audio for elementId plivo_ringbacktone/);
    getElementFn.mockRestore();
    consoleSpy.mockClear();
  });
});

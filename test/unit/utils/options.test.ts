import validateOptions from '../../../lib/utils/options';

describe('ValidateOptions', () => {
  let options: any;

  beforeEach(() => {
    options = {
      codecs: ['OPUS', 'PCMU'],
      enableTracking: true,
      enableQualityTracking : "ALL",
      debug: 'INFO',
      permOnClick: false,
      enableIPV6: false,
      audioConstraints: {},
      dscp: true,
      appId: null,
      appSecret: null,
      registrationDomainSocket: null,
      clientRegion: null,
      preDetectOwa: false,
      disableRtpTimeOut: false,
      allowMultipleIncomingCalls: false,
      closeProtection: false,
      maxAverageBitrate: 48000,
    };
  });

  it('should pass because all the options are valid', () => {
    expect(validateOptions(options)).toStrictEqual(options);
  });

  it('should check if debug option is INFO when debug value is invalid', () => {
    const inputOptions = { ...options };
    inputOptions.debug = 'INFO,ERROR';
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should check if debug option is ALL when debug value is ALL-PLAIN', () => {
    const inputOptions = { ...options };
    const expected = { ...options };
    expected.debug = 'ALL';
    inputOptions.debug = 'ALL-PLAIN';
    expect(validateOptions(inputOptions)).toStrictEqual(expected);
  });

  it('should check if max average bitrate is 48000 when bitrate value is invalid', () => {
    const inputOptions = { ...options };
    inputOptions.maxAverageBitrate = 12345678;
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid options', () => {
    const inputOptions = { ...options };
    inputOptions.username = 'test';
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid codecs', () => {
    const inputOptions = { ...options };
    inputOptions.codecs = ['OPUS10'];
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid codec format', () => {
    const inputOptions = { ...options };
    inputOptions.codecs = 'OPUS';
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid boolean option', () => {
    const inputOptions = { ...options };
    inputOptions.enableTracking = 'true';
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid value for enableQualityTracking flag', () => {
      let inputOptions = {...options};
      inputOptions.enableQualityTracking = 'invalid';
      expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid number option', () => {
      let inputOptions = {...options};
      inputOptions.maxAverageBitrate = '48000';
      expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid client region', () => {
    const inputOptions = { ...options };
    inputOptions.clientRegion = 'newyork';
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate undefined options', () => {
    expect(validateOptions(undefined as any)).toStrictEqual(options);
  });

  it('should pass valid client region', () => {
    const inputOptions = { ...options };
    inputOptions.clientRegion = 'asia';
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptions);
  });
});

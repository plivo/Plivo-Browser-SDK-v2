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
      useDefaultAudioDevice: false,
      allowMultipleIncomingCalls: false,
      closeProtection: false,
      maxAverageBitrate: 48000,
      enableNoiseReduction: true,
      registrationRefreshTimer: 120,
      usePlivoStunServer: false,
      noiseReductionFilePath: "",
      dtmfOptions: {
        sendDtmfType: ['INBAND','OUTBAND']
      }
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

  it('should check if refreshRegistrationTimer is 120 when timer value is invalid', () => {
    const inputOptions = { ...options };
    inputOptions.registrationRefreshTimer = 10;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);
    inputOptions.registrationRefreshTimer = 864000;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);
    inputOptions.registrationRefreshTimer = "1200";
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);

    inputOptions.registrationRefreshTimer = true;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);

    inputOptions.registrationRefreshTimer = undefined;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);

    inputOptions.registrationRefreshTimer = null;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(120);
  });

  it('should check if refreshRegistrationTimer is valid', () => {
    const inputOptions = { ...options };
    inputOptions.registrationRefreshTimer = 3600;
    expect(validateOptions(inputOptions).registrationRefreshTimer).toStrictEqual(3600);
  });

  it('should check if useDefaultAudioDevice is valid', () => {
    const inputOptions = { ...options };
    inputOptions.useDefaultAudioDevice = "test";
    expect(validateOptions(inputOptions).useDefaultAudioDevice).toStrictEqual(false);
    inputOptions.useDefaultAudioDevice = 12345;
    expect(validateOptions(inputOptions).useDefaultAudioDevice).toStrictEqual(false);
    inputOptions.useDefaultAudioDevice = 12345.12345;
    expect(validateOptions(inputOptions).useDefaultAudioDevice).toStrictEqual(false);
    inputOptions.useDefaultAudioDevice = true;
    expect(validateOptions(inputOptions).useDefaultAudioDevice).toStrictEqual(true);
  });

  it('should check if noiseReductionFilePath is valid', () => {
    const input = { ...options };
    input.noiseReductionFilePath = true;
    expect(validateOptions(input).noiseReductionFilePath).toStrictEqual("");
    input.noiseReductionFilePath = 12345;
    expect(validateOptions(input).noiseReductionFilePath).toStrictEqual("");
    input.noiseReductionFilePath = 12345.12345;
    expect(validateOptions(input).noiseReductionFilePath).toStrictEqual("");
    input.noiseReductionFilePath = "processor.js";
    expect(validateOptions(input).noiseReductionFilePath).toStrictEqual("processor.js");
  });

  it('should check if usePlivoStunServer is valid', () => {
    const inputOptions = { ...options };
    inputOptions.usePlivoStunServer = "true";
    expect(validateOptions(inputOptions).usePlivoStunServer).toStrictEqual(false);
    inputOptions.usePlivoStunServer = 12345;
    expect(validateOptions(inputOptions).usePlivoStunServer).toStrictEqual(false);
    inputOptions.usePlivoStunServer = 12345.12345;
    expect(validateOptions(inputOptions).usePlivoStunServer).toStrictEqual(false);
    inputOptions.usePlivoStunServer = true;
    expect(validateOptions(inputOptions).usePlivoStunServer).toStrictEqual(true);
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

  it('should pass valid DTMF option', () => {
    const inpOpts = { ...options };
    inpOpts.dtmfOptions = {sendDtmfType:["INBAND","OUTBAND"]};
    expect(validateOptions(inpOpts)).toStrictEqual(inpOpts);
  });

  it('should validate invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["random","randomagain"]};
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtm:["inband","outband"]};
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should validate semi-invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["inband","sfhjsdf"]};
    const inputOptionsVerify = { ...options };
    inputOptionsVerify.dtmfOptions = {sendDtmfType:["INBAND"]};
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptionsVerify);
  });

  it('should validate semi-invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["gibberish","outband"]};
    const inputOptionsVerify = { ...options };
    inputOptionsVerify.dtmfOptions = {sendDtmfType:["OUTBAND"]};
    console.log(inputOptions);
    console.log(validateOptions(inputOptions));
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptionsVerify);
  });

  it('should validate DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["outband"]};
    const inputOptionsVerify = { ...options };
    inputOptionsVerify.dtmfOptions = {sendDtmfType:["OUTBAND"]};
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptionsVerify);
  });

  it('should validate DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["inBaNd"]};
    const inputOptionsVerify = { ...options };
    inputOptionsVerify.dtmfOptions = {sendDtmfType:["INBAND"]};
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptionsVerify);
  });

  it('should validate invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = {sendDtmfType:["fkgkkfgk"]};
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });


  it('should validate invalid DTMF option', () => {
    const inputOptions = { ...options };
    inputOptions.dtmfOptions = undefined;
    expect(validateOptions(inputOptions)).toStrictEqual(options);
  });

  it('should pass valid client region', () => {
    const inputOptions = { ...options };
    inputOptions.clientRegion = 'asia';
    expect(validateOptions(inputOptions)).toStrictEqual(inputOptions);
  });
});

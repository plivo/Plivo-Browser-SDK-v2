import { AudioLevel } from '../../../lib/media/audioLevel';
import { AudioContext, setAnalyserData } from '../../mock/AudioContext';

describe('AudioLevel', () => {
  let audioLevel;

  beforeAll(() => {
    (window as any).AudioContext = AudioContext;
  });

  it('should initialize audio level', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    audioLevel = new AudioLevel({} as MediaStream);
    expect(audioLevel).toHaveProperty('analyser');
    expect(audioLevel).toHaveProperty('sourceNode');
    expect(consoleSpy).toHaveBeenCalledWith('analyser created');
    expect(consoleSpy).toHaveBeenCalledWith('media stream source created');
  });

  it('should get default audio level value', () => {
    const getFloatFrequencyDataFn = jest.spyOn(audioLevel.analyser, 'getFloatFrequencyData').mockImplementation(() => {});
    expect(audioLevel.getAudioLevel()).toBe(-100);
    getFloatFrequencyDataFn.mockRestore();
  });

  it('should get audio level based on fftBins', () => {
    setAnalyserData([-59.18284606933594, -46.66769409179688, -44.99549102783203, -56.98125457763672, -31.0255355834961, -49.34342956542969, -37.17977905273438]);
    expect(audioLevel.getAudioLevel()).toBe(-31.025535583496094);
  });

  it('should stop audio analyser and stream source', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    expect(audioLevel.stopped).toBeFalsy();
    audioLevel.stop();
    expect(audioLevel.stopped).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalledWith('analyser disconnected');
    expect(consoleSpy).toHaveBeenCalledWith('media stream source disconnected');
  });

  it('should not create a new audio context if it is already created', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    audioLevel = new AudioLevel({} as MediaStream);
    expect(consoleSpy).toHaveBeenCalledWith('creating audio context');
    consoleSpy.mockClear();
    audioLevel = new AudioLevel({} as MediaStream);
    expect(consoleSpy).not.toHaveBeenCalledWith('creating audio context');
  });
});

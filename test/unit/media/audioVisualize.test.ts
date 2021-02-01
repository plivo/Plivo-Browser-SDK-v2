import AudioVisualize from '../../../lib/media/audioVisualize';
import { AudioContext, setAnalyserData } from '../../mock/AudioContext';

describe('AudioVisualize', () => {
  let audioVisual;

  beforeAll(() => {
    (window as any).AudioContext = AudioContext;
    audioVisual = AudioVisualize();
  });

  it('should start analysing streams and emit volume event', () => {
    let eventType;
    let inputVolume = null;
    let outputVolume = null;
    const context = {
      emit: (event: string, data: any) => {
        eventType = event;
        inputVolume = data.inputVolume;
        outputVolume = data.outputVolume;
      },
    };
    const emitSpy = jest.spyOn(context, 'emit');
    setAnalyserData([223, 219, 193, 170, 185]);
    audioVisual.start(context, {}, {});
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(eventType).toBe('volume');
    expect(inputVolume).toBe('0.776');
    expect(outputVolume).toBe('0.776');
  });

  it('should not emit volume event', () => {
    const context = {
      emit() {},
    };
    const emitSpy = jest.spyOn(context, 'emit');
    audioVisual.start(context, null, null);
    expect(emitSpy).toHaveBeenCalledTimes(0);
  });

  it('should stop analysing volume event', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info');
    const consoleLogSpy = jest.spyOn(console, 'log');
    audioVisual.stop();
    expect(consoleInfoSpy.mock.calls[0][1]).toMatch(/stopping the requesting frame/);
    expect(consoleLogSpy).toHaveBeenCalledWith('audio context suspended');
  });
});

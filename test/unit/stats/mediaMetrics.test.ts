import { processStreams } from '../../../lib/stats/mediaMetrics';

describe('MediaMetrics', () => {
  let context;
  let streams;
  let metricType = '';

    beforeEach(() => {
        streams = {
            local: {
                rtt: 34,
                jtter: 12,
                fractionLoss: 0.003,
                audioLevel: -35.433,
                mos: 4.193
            },
            remote: {
                jtter: 14,
                fractionLoss: 0.005,
                audioLevel: -45.433,
            }
        };
        context = {
            storage : {
                startAnalysis: true,
                rtt: [],
                jitterLocalMeasures: [],
                mosRemoteMeasures: [],
                packetLossLocalMeasures: [],
                local_audio: [],
                jitterRemoteMeasures: [],
                packetLossRemoteMeasures: [],
                remote_audio: [],
                warning: {
                    rtt: null,
                    jitterLocalMeasures: null,
                    mosRemoteMeasures: null,
                    packetLossLocalMeasures: null,
                    local_audio: null,
                    jitterRemoteMeasures: null,
                    packetLossRemoteMeasures: null,
                    remote_audio: null,
                }
            },
            options : {
                enableTracking: true,
                enableQualityTracking: "ALL"
            },
            emit : (type, template) => {
                metricType = template.type;
            }
        };
    });

  it('should not emit any metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -36.433);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -34.433);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not start processing if start analysis is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.storage.startAnalysis = false;
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not process if stream data is null', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    streams.local = null;
    streams.remote = null;
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enable tracking is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableTracking = false;
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is none', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking = 'NONE';
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is remoteonly', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'REMOTEONLY';
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is remoteonly and enableTracking is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'REMOTEONLY';
    context.options.enableTracking = false;
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is none and enableTracking is enabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'NONE';
    context.options.enableTracking = true;
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is none and enableTracking is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'NONE';
    context.options.enableTracking = false;
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should not emit metrics if enableQualityTracking is default value and enableTracking is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'ALL';
    context.options.enableTracking = false;
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    processStreams.call(context, streams, true);
    expect(emitMock).toHaveBeenCalledTimes(0);
    expect(metricType).toMatch('');
  });

  it('should emit audio muted metrics if enableQualityTracking is localonly', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'LOCALONLY';
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch('audio');
  });

  it('should emit audio muted metrics if enableQualityTracking is localonly and enableTracking is disabled', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.options.enableQualityTracking  = 'LOCALONLY';
    context.options.enableTracking = false;
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch('audio');
  });


  it('should emit low mos metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    streams.local.mos = 3.193;
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -36.433);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -34.433);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(metricType).toMatch(/mos/);
  });

  it('should emit audio muted metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch('audio');
  });

  it('should emit same audio level metrics ', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, 36);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, 36);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch('audio');
  });

  it('should emit high rtt metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    streams.local.rtt = 450;
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -36.433);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -34.433);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(metricType).toMatch(/rtt/);
  });

  it('should emit high jitter metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    streams.local.jitter = 33;
    streams.remote.jitter = 36;
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -36.433);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -34.433);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch(/jitter/);
  });

  it('should emit high fraction loss metrics', () => {
    const emitMock = jest.spyOn(context, 'emit' as any);
    context.storage.audioCodec = 'opus';
    streams.local.fractionLoss = 0.13;
    streams.remote.fractionLoss = 0.11;
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -36.433);
    processStreams.call(context, streams, false);
    updateAudioLevels(streams, -34.433);
    processStreams.call(context, streams, false);
    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(metricType).toMatch(/packetloss/);
  });
});

const updateAudioLevels = (streams, val) => {
  streams.local.audioLevel = val;
  streams.remote.audioLevel = val;
};

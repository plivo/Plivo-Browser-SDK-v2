import { createStatsSocket, initCallStatsIO } from '../../../lib/stats/setup';
import WebSocket from '../../mock/WebSocket';

describe('Setup', () => {
  let context;

  beforeEach(() => {
    context = {
      callstatskey: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
      options: {
        enableTracking: true,
        appId: 'f0dd8baf-a299-4535-8679-b0bcc725fea2',
      },
      callStats: undefined,
      userName: 'testing',
      statsioused: false,
    };
    (window as any).callstats = () => ({ initialize() {} });
    (window as any).WebSocket = WebSocket;
  });

  it('should create plivo call stats socket', () => {
    jest.useFakeTimers();
    createStatsSocket.call(context);
    expect(context.statsSocket.ws).not.toBe(null);
    jest.advanceTimersByTime(100000);
    const expectedMsg = {
      heartbeat: 'healthy',
      username: context.userName,
    };
    expect(context.statsSocket.heartbeat(context)).toBeTruthy();
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  // it('should initialize callstats.io', () => {
  //   expect(context.callStats).toBe(undefined);
  //   initCallStatsIO.call(context);
  //   expect(context.callStats).toBe(undefined);
  //   expect(context.statsioused).toBeTruthy();
  // });

  it('should not initialize callstats.io when appId is absent', () => {
    context.options.appId = null;
    initCallStatsIO.call(context);
    expect(context.callStats).toBe(undefined);
    expect(context.statsioused).toBeFalsy();
  });
});

import { StatsSocket } from '../../../lib/stats/ws';
import WebSocket from '../../mock/WebSocket';

describe('WS', () => {
  let context;

  beforeAll(() => {
    context = {
      userName: 'testing',
      callstatskey: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
    };
    (window as any).WebSocket = WebSocket;
  });

  beforeEach(() => {
    context.statsSocket = new StatsSocket();
    context.statsSocket.connect();
  });

  it('should send the heartbeat to stats socket', () => {
    const expectedMsg = {
      heartbeat: 'healthy',
      username: context.userName,
    };
    expect(context.statsSocket.heartbeat(context)).toBeTruthy();
    expect(context.statsSocket.ws.message).toStrictEqual(expectedMsg);
  });

  it('should send stats to stats socket', () => {
    const stat = { msg: 'TOGGLE_MUTE', action: 'mute' };
    expect(context.statsSocket.send(stat)).toBeTruthy();
    expect(context.statsSocket.ws.message).toStrictEqual(stat);
  });

  it('should not send the heartbeat if socket is closed', () => {
    context.statsSocket.ws.close();
    expect(context.statsSocket.heartbeat(context)).toBeFalsy();
  });

  it('should not send stats if socket is closed', () => {
    const stat = { msg: 'TOGGLE_MUTE', action: 'mute' };
    context.statsSocket.ws.close();
    expect(context.statsSocket.send(stat)).toBeFalsy();
  });

  it('should close the web socket', () => {
    expect(context.statsSocket.ws).not.toBe(null);
    context.statsSocket.disconnect();
    expect(context.statsSocket.ws).toBe(null);
  });
});

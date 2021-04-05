import { Logger } from '../../lib/logger';

describe('Logger', () => {
  it('should check info logs', () => {
    const consoleSpy = jest.spyOn(console, 'info');
    Logger.setLevel('INFO');
    Logger.info('test info log');
    expect(consoleSpy.mock.calls[0][1]).toMatch(/test info log/);
    consoleSpy.mockClear();
  });

  it('should check debug logs', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    Logger.setLevel('DEBUG');
    Logger.debug('test debug log');
    expect(consoleSpy.mock.calls[0][1]).toMatch(/test debug log/);
    consoleSpy.mockClear();
  });

  it('should check warn logs', () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    Logger.setLevel('WARN');
    Logger.warn('test warn log');
    expect(consoleSpy.mock.calls[0][1]).toMatch(/test warn log/);
  });

  it('should check error logs', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    Logger.setLevel('ERROR');
    Logger.error('test error log');
    expect(consoleSpy.mock.calls[0][1]).toMatch(/test error log/);
  });

  it('should not log if log level is off', () => {
    const consoleSpy = jest.spyOn(console, 'info');
    Logger.setLevel('OFF');
    Logger.info('test off log');
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should log at info level if log level is wrong', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    Logger.setLevel('DEBUG1' as any);
    Logger.debug('test log');
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it('should get current log level', () => {
    Logger.setLevel('INFO');
    expect(Logger.level()).toBe('INFO');
    Logger.setLevel('WARN');
    expect(Logger.level()).toBe('WARN');
  });

  it('should get console logs used till now', () => {
    const consoleLogs = Logger.consolelogs();
    const trimmedLogs = [];
    for (let i = 0; i < consoleLogs.length; i++) {
      trimmedLogs.push(consoleLogs[i].split(':: ')[1].replace(/\s*$/g, '') as never);
    }
    expect(trimmedLogs).toStrictEqual(['test info log', 'test debug log', 'test warn log', 'test error log', 'test off log', 'test log']);
  });

  it('should enable sip logs if log level is ALL', () => {
    Logger.enableSipLogs('ALL');
    expect(window.localStorage.debug).toBe('JsSIP:*');
  });

  it('should disable sip logs if log level is not ALL', () => {
    Logger.enableSipLogs('WARN');
    expect(window.localStorage.debug).toBe('');
  });

  it('should disable userColors in webpack if log level is ALL-PLAIN', () => {
    Logger.enableSipLogs('ALL-PLAIN');
    expect((window as any)._PlivoUseColorLog).toBeFalsy();
  });
});

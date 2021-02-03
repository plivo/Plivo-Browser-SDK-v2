import { Client1, Client2 } from './clients';

const masterUser = process.env.PLIVO_MASTER_USERNAME;
const masterPass = process.env.PLIVO_MASTER_PASSWORD;

const slaveUser = process.env.PLIVO_SLAVE_USERNAME;
const slavePass = process.env.PLIVO_SLAVE_PASSWORD;

function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10)) ? 100 : delay;
  setTimeout(() => {
    if (boolObj.status) {
      callback();
    } else {
      waitUntil(boolObj, callback, newDelay);
    }
  }, newDelay);
}

// eslint-disable-next-line no-undef
describe('event emitter', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;
  // eslint-disable-next-line no-undef
  before(() => {
    // console.log('********** triggered');
    // Client2.on('onLogin', () => {
    //   done();
    // });
    Client2.login(slaveUser, slavePass);
  });

  // eslint-disable-next-line no-undef
  describe('check events', () => {
    const events = {};

    const clientEvents = [
      'onConnectionChange',
      'onConnectionChangeConnected',
      'onConnectionChangeDisconnected',
      'onMediaConnected',
    ];
    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    // eslint-disable-next-line no-undef
    before(() => {
      console.log('********** triggered 2');
      Client1.on('onMediaConnected', () => {
        console.log('********** events1', events);
        events.onMediaConnected.status = true;
      });
      Client1.on('onConnectionChange', (obj) => {
        console.log('********** events2', events);
        events.onConnectionChange.status = true;
        if (obj.state === 'connected') {
          events.onConnectionChangeConnected.status = true;
        }
        if (obj.state === 'disconnected') {
          events.onConnectionChangeDisconnected.status = true;
        }
      });
    });

    // eslint-disable-next-line no-undef
    beforeEach(() => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        events[key].status = false;
      });
      clearTimeout(bailTimer);
    });

    // eslint-disable-next-line no-undef
    after(() => {
      Client1.logout();
      Client2.logout();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // eslint-disable-next-line no-undef
    it('should be able to emit onConnectionChange connected on login', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.login(masterUser, masterPass);
      Client1.on('onLogin', () => {
        waitUntil(events.onConnectionChangeConnected, done, 500);
      });
      bailTimer = setTimeout(() => {
        throw new Error('failed to emit onConnectionChange connected');
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('should be able to emit onConnectionChange disconnected on logout', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.logout();
      waitUntil(events.onConnectionChangeDisconnected, done, 500);
      bailTimer = setTimeout(() => {
        throw new Error('failed to emit onConnectionChange disconnected');
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('outbound call should emit onMediaConnected', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.login(masterUser, masterPass);
      Client1.on('onLogin', () => {
        const extraHeaders = {};
        extraHeaders['X-PH-conference'] = 'true';
        Client1.call(slaveUser, extraHeaders);
        waitUntil(events.onMediaConnected, done, 500);
        bailTimer = setTimeout(() => {
          bail = true;
          done(new Error('outgoing call failed'));
        }, TIMEOUT);
      });
    });
  });
});

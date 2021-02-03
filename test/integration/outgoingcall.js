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
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  before(() => {
    Client1.login(masterUser, masterPass);
    Client2.login(slaveUser, slavePass);
  });

  // eslint-disable-next-line no-undef
  describe('outgoing call', () => {
    const events = {};

    const clientEvents = [
      'onCallRemoteRinging',
      'onCallFailed',
      'onCallAnswered',
      'onCallTerminated',
      'onCalling',
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.on('onCallRemoteRinging', () => {
        events.onCallRemoteRinging.status = true;
      }); // done
      Client1.on('onCallFailed', () => {
        events.onCallFailed.status = true;
      }); // done
      Client1.on('onCallAnswered', () => {
        events.onCallAnswered.status = true;
      }); // done
      Client1.on('onCallTerminated', () => {
        events.onCallTerminated.status = true;
      }); // done
      Client1.on('onCalling', () => {
        events.onCalling.status = true;
      }); // done
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
    // after(() => {
    //   Client1.logout();
    //   Client2.logout();
    // });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // eslint-disable-next-line no-undef
    it('outbound call should go through', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      const extraHeaders = {};
      extraHeaders['X-PH-conference'] = 'true';
      Client2.on(
        'onIncomingCall',
        (callerName, extraHeaders2, callInfo) => {
          setTimeout(() => {
            Client2.answer(callInfo.callUUID);
          }, 500);
        },
      );
      if (Client1.isLoggedIn) {
        Client1.call(slaveUser, extraHeaders);
      } else {
        Client1.on('onLogin', () => {
          Client1.call(slaveUser, extraHeaders);
        });
      }
      waitUntil(events.onCalling, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('outbound call should ring', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      waitUntil(events.onCallRemoteRinging, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call ring failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('outbound call should be answered', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }

      waitUntil(events.onCallAnswered, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call answer failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('outbound call should be hungup', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.hangup();
      waitUntil(events.onCallTerminated, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call hangup failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('outbound call should be ended without answer', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.reject();
      Client1.call(slaveUser, {});
      bailTimer = setTimeout(() => {
        Client1.hangup();
      }, 2000);
      waitUntil(events.onCallFailed, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call end failed'));
      }, TIMEOUT);
    });
  });
});

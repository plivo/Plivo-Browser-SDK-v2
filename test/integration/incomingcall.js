import { Client1, Client2 } from './clients';

const masterUser = process.env.PLIVO_MASTER_USERNAME;
const masterPass = process.env.PLIVO_MASTER_PASSWORD;

const slaveUser = process.env.PLIVO_SLAVE_USERNAME;
const slavePass = process.env.PLIVO_SLAVE_PASSWORD;

function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10))
    ? 100
    : delay;
  setTimeout(() => {
    if (boolObj.status) {
      callback();
    } else {
      waitUntil(boolObj, callback, newDelay);
    }
  }, newDelay);
}

// eslint-disable-next-line no-undef
describe('Incoming call from Client2 to Client1', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  before(() => {
    // Client1.on('onLogin', () => done());
    Client1.login(masterUser, masterPass);
  });

  // eslint-disable-next-line no-undef
  describe('Client2 login', () => {
    // eslint-disable-next-line no-undef
    before((done) => {
      Client2.on('onLogin', () => done());
      Client2.login(slaveUser, slavePass);
    });

    // eslint-disable-next-line no-undef
    describe('check incoming call events', () => {
      const events = {};

      const clientEvents = [
        'onIncomingCallCanceled',
        'onCallFailed',
        'onCallAnswered',
        'onCallTerminated',
        'onIncomingCall',
      ];

      clientEvents.forEach((i) => {
        events[i] = { status: false };
      });

      let bail = false;

      // eslint-disable-next-line no-undef
      before(() => {
        Client1.on('onCallRemoteRinging', () => {
          events.onCallRemoteRinging.status = true;
        });
        Client1.on('onIncomingCallCanceled', () => {
          events.onIncomingCallCanceled.status = true;
        });
        Client1.on('onCallFailed', () => {
          events.onCallFailed.status = true;
        });
        Client1.on('onCallAnswered', () => {
          events.onCallAnswered.status = true;
        });
        Client1.on('onCallTerminated', () => {
          events.onCallTerminated.status = true;
        });
        Client1.on('onIncomingCall', () => {
          events.onIncomingCall.status = true;
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
      // after(() => {
      //   Client1.logout();
      //   Client2.logout();
      // });

      // eslint-disable-next-line no-undef
      afterEach((done) => {
        done();
      });

      // eslint-disable-next-line no-undef
      it('inbound call should come through', (done) => {
        if (bail) {
          done(new Error('bailing'));
        }
        Client2.call(masterUser, {});
        waitUntil(events.onIncomingCall, done, 500);
        bailTimer = setTimeout(() => {
          bail = true;
          done(new Error('incoming call failed'));
        }, TIMEOUT);
      });

      // eslint-disable-next-line no-undef
      it('inbound call should be answered', (done) => {
        if (bail) {
          done(new Error('bailing'));
        }
        Client1.answer();
        waitUntil(events.onCallAnswered, done, 500);
        bailTimer = setTimeout(() => {
          bail = true;
          done(new Error('outgoing call answer failed'));
        }, TIMEOUT);
      });

      // eslint-disable-next-line no-undef
      it('inbound call should be hungup', (done) => {
        if (bail) {
          done(new Error('bailing'));
        }
        Client1.hangup();
        waitUntil(events.onCallTerminated, done, 500);
        bailTimer = setTimeout(() => {
          bail = true;
          done(new Error('incoming call hangup failed'));
        }, TIMEOUT);
      });

      // eslint-disable-next-line no-undef
      it('inbound call should be ended without answer', (done) => {
        // terminate any ongoing calls
        Client2.hangup();
        if (bail) {
          done(new Error('bailing'));
        }
        setTimeout(() => {
          Client2.call(masterUser, {});
          setTimeout(() => {
            Client1.reject();
            waitUntil(events.onCallFailed, done, 500);
          }, 3000);
        }, 1000);
        bailTimer = setTimeout(() => {
          bail = true;
          done(new Error('incoming call end failed'));
        }, TIMEOUT);
      });
    });
  });
});

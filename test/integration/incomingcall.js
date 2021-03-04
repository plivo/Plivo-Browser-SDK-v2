/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '../../lib/client';

const options = {
  debug: "ALL",
  permOnClick: true,
  codecs: ["OPUS", "PCMU"],
  enableIPV6: false,
  audioConstraints: { optional: [{ googAutoGainControl: false }] },
  dscp: true,
  enableTracking: true,
  dialType: "conference",
};

const Client1 = new Client(options);
const Client2 = new Client(options);

const primary_user = process.env.PLIVO_ENDPOINT1_USERNAME;
const primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

const secondary_user = process.env.PLIVO_ENDPOINT2_USERNAME;
const secondary_pass = process.env.PLIVO_ENDPOINT2_PASSWORD;

// eslint-disable-next-line no-undef
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe('incoming call', function () {
    this.timeout(GLOBAL_TIMEOUT);

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

    function waitUntilIncoming(boolObj, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;
      setTimeout(() => {
        if (boolObj.status) {
          callback();
        } else {
          waitUntilIncoming(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before((done) => {
      Client1.login(primary_user, primary_pass);
      Client2.login(secondary_user, secondary_pass);
      Client2.on("onLogin", () => {
        done();
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
    beforeEach((done) => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        events[key].status = false;
      });
      done();
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
    it('inbound call should come through with extra headers', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.call(primary_user, {
        "X-Ph-Random": "true",
      });
      Client1.on(
        "onIncomingCall",
        (callerName, extraHeaders2) => {
          if (extraHeaders2 && extraHeaders2["X-Ph-Random"]) {
            done();
          } else {
            done(new Error('incoming call with extra headers failed'));
          }
        },
      );
      // waitUntilIncoming(events.onIncomingCall, done, 500);
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
      waitUntilIncoming(events.onCallAnswered, done, 500);
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
      waitUntilIncoming(events.onCallTerminated, done, 500);
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
      // eslint-disable-next-line no-underscore-dangle
      Client2._currentSession = null;
      Client2.call(primary_user, {});
      function reject() {
        Client1.reject();
        waitUntilIncoming(events.onCallFailed, done, 500);
      }
      waitUntilIncoming(events.onIncomingCall, reject, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call end failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    // it('inbound call should receive extra headers', (done) => {
    //   // terminate any ongoing calls
    //   Client2.hangup();
    //   if (bail) {
    //     done(new Error('bailing'));
    //   }
    //   setTimeout(() => {
    //     const extraHeaders = {
    //       "X-Ph-Random": "true",
    //     };
    //     Client2.on(
    //       "onIncomingCall",
    //       (callerName, extraHeaders2) => {
    //         if (extraHeaders2 && extraHeaders2["X-Ph-Random"]) {
    //           Client1.reject();
    //           done();
    //         } else {
    //           done(new Error('incoming call with extra headers failed'));
    //         }
    //       },
    //     );
    //     Client1.call(secondary_user, extraHeaders);
    //   }, 1000);
    // });
  });
});

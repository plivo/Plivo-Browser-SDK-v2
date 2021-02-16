/* eslint-disable no-underscore-dangle */
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

    // eslint-disable-next-line no-undef
    before((done) => {
      Client2.login(secondary_user, secondary_pass);
      Client1.login(primary_user, primary_pass);
      Client2.on('onLogin', () => {
        done();
      });
      // Client1.on('onIncomingCallCanceled', () => {
      //   events.onIncomingCallCanceled.status = true;
      // });
      // Client1.on('onCallFailed', () => {
      //   events.onCallFailed.status = true;
      // });
      // Client1.on('onCallAnswered', () => {
      //   events.onCallAnswered.status = true;
      // });
      // Client1.on('onCallTerminated', () => {
      //   events.onCallTerminated.status = true;
      // });
      // Client1.on('onIncomingCall', () => {
      //   events.onIncomingCall.status = true;
      // });
    });

    // eslint-disable-next-line no-undef
    beforeEach((done) => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        // events[key].status = false;
        Client1.removeAllListeners(key);
        Client2.removeAllListeners(key);
      });
      done();
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

    // #5
    // eslint-disable-next-line no-undef
    it('inbound call should come through', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.on("onIncomingCall", () => {
        done();
      });
      Client2.call(primary_user, {});
      // waitUntilIncoming(events.onIncomingCall, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // #6
    // eslint-disable-next-line no-undef
    it('inbound call should be answered', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.on("onCallAnswered", () => {
        done();
      });
      Client1.answer();
      // waitUntilIncoming(events.onCallAnswered, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call answer failed'));
      }, TIMEOUT);
    });

    // #7
    // eslint-disable-next-line no-undef
    it('inbound call should be hungup', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.on("onCallTerminated", () => {
        done();
      });
      Client1.hangup();
      // waitUntilIncoming(events.onCallTerminated, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call hangup failed'));
      }, TIMEOUT);
    });

    // #8
    // eslint-disable-next-line no-undef
    it('inbound call should be ended without answer', (done) => {
      // terminate any ongoing calls
      Client2.hangup();
      if (bail) {
        done(new Error('bailing'));
      }

      Client2._currentSession = null;
      Client1.on("onCallFailed", () => {
        done();
      });
      Client1.on("onIncomingCall", () => {
        Client1.reject();
      });
      Client2.call(primary_user, {});
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call end failed'));
      }, TIMEOUT);
    });

    // #9
    // eslint-disable-next-line no-undef
    it('inbound call should receive extra headers', (done) => {
      // terminate any ongoing calls
      Client2.hangup();
      // eslint-disable-next-line no-underscore-dangle
      Client2._currentSession = null;
      Client1._currentSession = null;
      if (bail) {
        done(new Error('bailing'));
      }
      const extraHeaders = {
        "X-Ph-Random": "true",
      };
      Client1.removeAllListeners("");
      Client1.on(
        "onIncomingCall",
        (callerName, extraHeaders2) => {
          if (extraHeaders2 && extraHeaders2["X-Ph-Random"]) {
            Client1.reject();
            done();
          } else {
            done(new Error('incoming call with extra headers failed'));
          }
        },
      );
      Client2.call(primary_user, extraHeaders);
    });
  });
});

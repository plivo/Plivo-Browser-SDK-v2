/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '../../lib/client';
import { Logger as plivo_log } from "../../lib/logger";

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

Client2.login(secondary_user, secondary_pass);

// eslint-disable-next-line no-undef
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe('event emitters', function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};
    let spy;
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

    function waitUntilEmitter(boolObj, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;

      const check = typeof boolObj === "boolean" ? boolObj : boolObj.status;
      setTimeout(() => {
        if (check) {
          callback();
        } else {
          waitUntilEmitter(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.on('onMediaConnected', () => {
        events.onMediaConnected.status = true;
      });
      Client1.on('onConnectionChange', (obj) => {
        events.onConnectionChange.status = true;
        if (obj.state === 'connected') {
          events.onConnectionChangeConnected.status = true;
        }
        if (obj.state === 'disconnected') {
          events.onConnectionChangeDisconnected.status = true;
        }
      });
    });

    const resetListners = () => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        Client1.removeAllListeners(key);
        Client2.removeAllListeners(key);
      });
    };

    // eslint-disable-next-line no-undef
    beforeEach((done) => {
      resetListners();
      done();
      clearTimeout(bailTimer);
    });

    // eslint-disable-next-line no-undef
    after(() => {
      spy.restore();
      resetListners();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // #1
    // eslint-disable-next-line no-undef
    it('should be able to emit onConnectionChange connected on login', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.login(primary_user, primary_pass);
      Client1.on('onConnectionChange', (obj) => {
        if (obj.state === 'connected') {
          done();
        } else {
          done(new Error('failed to emit onConnectionChange connected'));
        }
      });
      bailTimer = setTimeout(() => {
        throw new Error('failed to emit onConnectionChange connected');
      }, TIMEOUT);
    });

    // #2
    // eslint-disable-next-line no-undef
    it('should be able to emit onConnectionChange disconnected on logout', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.logout();
      Client1.on('onConnectionChange', (obj) => {
        if (obj.state === 'disconnected') {
          done();
        } else {
          done(new Error('failed to emit onConnectionChange disconnected'));
        }
      });
      bailTimer = setTimeout(() => {
        throw new Error('failed to emit onConnectionChange disconnected');
      }, TIMEOUT);
    });
    // #3
    // eslint-disable-next-line no-undef
    it('outbound call should emit onMediaConnected', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.login(primary_user, primary_pass);
      Client1.on('onLogin', () => {
        const extraHeaders = {};
        extraHeaders['X-PH-conference'] = 'true';
        Client1.on('onMediaConnected', () => {
          done();
        });
        Client1.call(secondary_user, extraHeaders);
      });
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call failed'));
      }, TIMEOUT);
    });

    // #4
    // eslint-disable-next-line no-undef
    it('send a dtmf digit', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      // eslint-disable-next-line no-undef
      spy = sinon.spy(plivo_log, "debug");
      spy.resetHistory();

      Client2.answer();
      Client1.sendDtmf("2");

      waitUntilEmitter(spy.calledWith("sending dtmf digit 2"), done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('send dtmf failed'));
      }, TIMEOUT);
    });
  });
});

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

Client1.login(primary_user, primary_pass);
Client2.login(secondary_user, secondary_pass);

// eslint-disable-next-line no-undef
describe("plivoWebSdk", function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe("network change", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};
    let spy;
    const clientEvents = [
      "onConnectionChange",
      "onConnectionChangeConnected",
      "onConnectionChangeDisconnected",
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    function waitUntilNetworkChange(boolObj, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === "undefined" || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;

      const check = typeof boolObj === "boolean" ? boolObj : boolObj.status;
      setTimeout(() => {
        if (check) {
          callback();
        } else {
          waitUntilNetworkChange(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.on("onConnectionChange", (obj) => {
        events.onConnectionChange.status = true;
        if (obj.state === "connected") {
          events.onConnectionChangeConnected.status = true;
        }
        if (obj.state === "disconnected") {
          events.onConnectionChangeDisconnected.status = true;
        }
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
      spy.restore();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // eslint-disable-next-line no-undef
    it("socket disconnection should trigger a re-connection", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      function checkReconnection() {
        waitUntilNetworkChange(events.onConnectionChangeConnected, done, 500);
      }
      function triggerDisconnection() {
        Client1.phone.transport.disconnect();
        waitUntilNetworkChange(
          events.onConnectionChangeDisconnected,
          checkReconnection,
          500,
        );
      }
      if (Client1.isLoggedIn) {
        triggerDisconnection();
      } else {
        Client1.on("onLogin", () => {
          triggerDisconnection();
        });
      }
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("reconnection failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("hangup after re-connection should send call summary", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      // initialize spies
      // eslint-disable-next-line no-undef
      spy = sinon.spy(plivo_log, "debug");
      spy.resetHistory();

      function checkCallSumary() {
        Client1.hangup();
        waitUntilNetworkChange(spy.calledWith("stats send success"), done, 500);
      }
      function checkReconnection() {
        waitUntilNetworkChange(events.onConnectionChangeConnected, checkCallSumary, 500);
      }

      // trigger logic
      Client1.call(secondary_user, {});
      setTimeout(() => {
        Client1.phone.transport.disconnect();
        waitUntilNetworkChange(
          events.onConnectionChangeDisconnected,
          checkReconnection,
          500,
        );
      }, 3000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("reconnection failed"));
      }, TIMEOUT);
    });
  });
});

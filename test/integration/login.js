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

const primary_user = process.env.PLIVO_ENDPOINT1_USERNAME;
const primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

function waitUntilLogin(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  const newDelay = typeof delay === "undefined" || Number.isNaN(parseInt(delay, 10))
    ? 100
    : delay;
  setTimeout(() => {
    if (boolObj.status) {
      callback();
    } else {
      waitUntilLogin(boolObj, callback, newDelay);
    }
  }, newDelay);
}

// eslint-disable-next-line no-undef
describe("plivoWebSdk", function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe("login", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};

    const clientEvents = ["onLogin", "onLogout", "onLoginFailed"];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.on("onLogin", () => {
        events.onLogin.status = true;
      }); // done
      Client1.on("onLogout", () => {
        events.onLogout.status = true;
      }); // done
      Client1.on("onLoginFailed", () => {
        events.onLoginFailed.status = true;
      }); // done
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
    // after((done) => {
    //   done();
    // });

    // // eslint-disable-next-line no-undef
    // afterEach((done) => {
    //   done();
    // });

    // #10
    // eslint-disable-next-line no-undef
    it("login should fail", (done) => {
      Client1.login(primary_user, "wrong_password");
      waitUntilLogin(events.onLoginFailed, done, 500);
      Client1.on("onLoginFailed", () => {
        done();
      });
      bailTimer = setTimeout(() => {
        done(new Error("login should have failed"));
      }, TIMEOUT);
    });

    // #11
    // eslint-disable-next-line no-undef
    it("login should work", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.login(primary_user, primary_pass);
      waitUntilLogin(events.onLogin, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        throw new Error("login failed");
      }, TIMEOUT);
    });
    // #12
    // eslint-disable-next-line no-undef
    it("should be able to logout", (done) => {
      Client1.logout();
      waitUntilLogin(events.onLogout, done, 500);
      bailTimer = setTimeout(() => {
        done(new Error("logout failed"));
      }, TIMEOUT);
    });
  });
});
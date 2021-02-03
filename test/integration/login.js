"use strict";

const Client = require("../../types/lib/client").Client;

var options = {
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

var primary_user = process.env.PLIVO_ENDPOINT1_USERNAME,
  primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;


function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  delay =
    typeof delay === "undefined" || isNaN(parseInt(delay, 10)) ? 100 : delay;
  setTimeout(function () {
    boolObj.status ? callback() : waitUntil(boolObj, callback, delay);
  }, delay);
}

describe("plivoWebSdk", function () {
  var GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  var TIMEOUT = 20000;
  let bailTimer;

  describe("login", function () {
    this.timeout(GLOBAL_TIMEOUT);

    var events = {};

    var client_events = ["onLogin", "onLogout", "onLoginFailed"];

    for (var i in client_events) {
      events[client_events[i]] = { status: false };
    }

    let bail = false;

    before(function () {
      Client1.on("onLogin", function () {
        events["onLogin"].status = true;
      }); // done
      Client1.on("onLogout", function () {
        events["onLogout"].status = true;
      }); // done
      Client1.on("onLoginFailed", function () {
        events["onLoginFailed"].status = true;
      }); // done
    });

    beforeEach(function (done) {
      // reset all the flags
      for (var key in events) {
        events[key].status = false;
      }
      done();
      clearTimeout(bailTimer);
    });

    afterEach(function (done) {
      done();
    });

    it("login should fail", (done) => {
      Client1.login(primary_user, "wrong_password");
      waitUntil(events["onLoginFailed"], done, 500);
      Client1.on("onLoginFailed", () => {
        done();
      });
      bailTimer = setTimeout(function () {
        done(new Error("login should have failed"));
      }, TIMEOUT);
    });

    it("login should work", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.login(primary_user, primary_pass);
      waitUntil(events["onLogin"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        throw new Error("login failed");
      }, TIMEOUT);
    });

    it("should be able to logout", function (done) {
      setTimeout(() => {
        Client1.logout();
        waitUntil(events["onLogout"], done, 500);
        bailTimer = setTimeout(function () {
          done(new Error("logout failed"));
        }, TIMEOUT);
      }, 5000);
    });
  });
});

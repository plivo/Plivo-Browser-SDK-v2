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
const Client2 = new Client(options);

var primary_user = process.env.PLIVO_PRIMARY_USERNAME,
  primary_pass = process.env.PLIVO_PRIMARY_PASSWORD;

var secondary_user = process.env.PLIVO_SECONDARY_USERNAME,
  secondary_pass = process.env.PLIVO_SECONDARY_PASSWORD;


Client2.login(secondary_user,secondary_pass);

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

  describe("event emitters", function () {
    this.timeout(GLOBAL_TIMEOUT);

    var events = {};

    var client_events = [
      "onConnectionChange",
      "onConnectionChangeConnected",
      "onConnectionChangeDisconnected",
      "onMediaConnected",
    ];

    for (var i in client_events) {
      events[client_events[i]] = { status: false };
    }

    var bail = false;

    before(function () {
      Client1.on("onMediaConnected", function () {
        events["onMediaConnected"].status = true;
      });
      Client1.on("onConnectionChange", function (obj) {
        events["onConnectionChange"].status = true;
        if (obj.state === "connected") {
          events["onConnectionChangeConnected"].status = true;
        }
        if (obj.state === "disconnected") {
          events["onConnectionChangeDisconnected"].status = true;
        }
      });
    });

    beforeEach(function (done) {
      // reset all the flags
      for (var key in events) {
        events[key].status = false;
      }
      done();
      clearTimeout(bailTimer);
    });

    after(function () {
      Client1.logout();
      Client2.logout()
    });

    afterEach(function (done) {
      done();
    });

    it("should be able to emit onConnectionChange connected on login", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.login(primary_user, primary_pass);
      Client1.on("onLogin", function(){
        waitUntil(events["onConnectionChangeConnected"], done, 500);
      })
      bailTimer = setTimeout(function () {
        throw new Error("failed to emit onConnectionChange connected");
      }, TIMEOUT);
    });

    it("should be able to emit onConnectionChange disconnected on logout", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.logout();
      waitUntil(events["onConnectionChangeDisconnected"], done, 500);
      bailTimer = setTimeout(function () {
        throw new Error("failed to emit onConnectionChange disconnected");
      }, TIMEOUT);
    });

    it("outbound call should emit onMediaConnected", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.login(primary_user, primary_pass);
      Client1.on("onLogin", function(){
        var extraHeaders = {};
        extraHeaders["X-PH-conference"] = "true";
        Client1.call(secondary_user, extraHeaders);
        waitUntil(events["onMediaConnected"], done, 500);
        bailTimer = setTimeout(function () {
          bail = true;
          done(new Error("outgoing call failed"));
        }, TIMEOUT);
      })
    });
  });
});
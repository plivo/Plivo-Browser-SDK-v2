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

var master_user = process.env.PLIVO_MASTER_USERNAME,
  master_pass = process.env.PLIVO_MASTER_PASSWORD;

var slave_user = process.env.PLIVO_SLAVE_USERNAME,
  slave_pass = process.env.PLIVO_SLAVE_PASSWORD;

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

  describe("incoming call", function () {
    this.timeout(GLOBAL_TIMEOUT);

    var events = {};

    var client_events = [
      "onIncomingCallCanceled",
      "onCallFailed",
      "onCallAnswered",
      "onCallTerminated",
      "onIncomingCall",
    ];

    for (var i in client_events) {
      events[client_events[i]] = { status: false };
    }

    var bail = false;

    before(function () {
      Client1.login(master_user, master_pass);
      Client2.login(slave_user, slave_pass);
      Client1.on("onCallRemoteRinging", function () {
        events["onCallRemoteRinging"].status = true;
      });
      Client1.on("onIncomingCallCanceled", function () {
        events["onIncomingCallCanceled"].status = true;
      });
      Client1.on("onCallFailed", function () {
        events["onCallFailed"].status = true;
      });
      Client1.on("onCallAnswered", function () {
        events["onCallAnswered"].status = true;
      });
      Client1.on("onCallTerminated", function () {
        events["onCallTerminated"].status = true;
      });
      Client1.on("onIncomingCall", function () {
        events["onIncomingCall"].status = true;
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
      Client2.logout();
    });

    afterEach(function (done) {
      done();
    });

    it("inbound call should come through", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      if (Client2.isLoggedIn && Client1.isLoggedIn){
        Client2.call(master_user, {});
      } else {
        Client2.on("onLogin",function() {
          Client2.call(master_user, {});
        })
      }
      waitUntil(events["onIncomingCall"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("incoming call failed"));
      }, TIMEOUT);
    });

    it("inbound call should be answered", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.answer();
      waitUntil(events["onCallAnswered"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call answer failed"));
      }, TIMEOUT);
    });

    it("inbound call should be hungup", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.hangup();
      waitUntil(events["onCallTerminated"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("incoming call hangup failed"));
      }, TIMEOUT);
    });

    it("inbound call should be ended without answer", function (done) {
      // terminate any ongoing calls
      Client2.hangup();
      if (bail) {
        done(new Error("bailing"));
      }
      setTimeout(() => {
        Client2.call(master_user, {});
        setTimeout(() => {
          Client1.reject();
          waitUntil(events["onCallFailed"], done, 500);
        }, 3000);
      }, 1000);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("incoming call end failed"));
      }, TIMEOUT);
    });
  });
});

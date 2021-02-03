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

var primary_user = process.env.PLIVO_ENDPOINT1_USERNAME,
  primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

var secondary_user = process.env.PLIVO_ENDPOINT2_USERNAME,
  secondary_pass = process.env.PLIVO_ENDPOINT2_PASSWORD;


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

  describe("outgoing call", function () {
    this.timeout(GLOBAL_TIMEOUT);

    var events = {};

    var client_events = [
      "onCallRemoteRinging",
      "onCallFailed",
      "onCallAnswered",
      "onCallTerminated",
      "onCalling",
    ];

    for (var i in client_events) {
      events[client_events[i]] = { status: false };
    }

    var bail = false;

    before(function () {
      Client1.login(primary_user, primary_pass);
      Client2.login(secondary_user, secondary_pass);
      Client1.on("onCallRemoteRinging", function () {
        events["onCallRemoteRinging"].status = true;
      }); // done
      Client1.on("onCallFailed", function () {
        events["onCallFailed"].status = true;
      }); // done
      Client1.on("onCallAnswered", function () {
        events["onCallAnswered"].status = true;
      }); // done
      Client1.on("onCallTerminated", function () {
        events["onCallTerminated"].status = true;
      }); // done
      Client1.on("onCalling", function () {
        events["onCalling"].status = true;
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

    after(function () {
      Client1.logout();
      Client2.logout();
    });

    afterEach(function (done) {
      done();
    });

    it("outbound call should go through", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      var extraHeaders = {};
      extraHeaders["X-PH-conference"] = "true";
      Client2.on(
        "onIncomingCall",
        function (callerName, extraHeaders, callInfo) {
          setTimeout(() => {
            Client2.answer(callInfo.callUUID);
          }, 500);
        }
      );
      if (Client1.isLoggedIn){
        Client1.call(secondary_user, extraHeaders);
      } else {
        Client1.on("onLogin", function(){
          Client1.call(secondary_user, extraHeaders);
        })
      }
      waitUntil(events["onCalling"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call failed"));
      }, TIMEOUT);
    });

    it("outbound call should ring", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      waitUntil(events["onCallRemoteRinging"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call ring failed"));
      }, TIMEOUT);
    });

    it("outbound call should be answered", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }

      waitUntil(events["onCallAnswered"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call answer failed"));
      }, TIMEOUT);
    });

    it("outbound call should be hungup", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.hangup();
      waitUntil(events["onCallTerminated"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call hangup failed"));
      }, TIMEOUT);
    });

    it("outbound call should be ended without answer", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      Client2.reject();
      Client1.call(secondary_user, {});
      bailTimer = setTimeout(function () {
        Client1.hangup();
      }, 2000);
      waitUntil(events["onCallFailed"], done, 500);
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("outgoing call end failed"));
      }, TIMEOUT);
    });
  });
});
"use strict";

const Client = require("../../types/lib/client").Client;
const plivo_log = require("../../types/lib/logger").Logger;

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


Client1.login(primary_user, primary_pass);
Client2.login(secondary_user, secondary_pass);

function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  delay =
    typeof delay === "undefined" || isNaN(parseInt(delay, 10)) ? 100 : delay;

  let check = typeof boolObj === "boolean" ? boolObj : boolObj.status;
  setTimeout(function () {
    check ? callback() : waitUntil(boolObj, callback, delay);
  }, delay);
}

describe("plivoWebSdk", function () {
  var GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  var TIMEOUT = 20000;
  let bailTimer;

  describe("network change", function () {
    this.timeout(GLOBAL_TIMEOUT);

    var events = {};

    var client_events = [
      "onConnectionChange",
      "onConnectionChangeConnected",
      "onConnectionChangeDisconnected",
    ];

    for (var i in client_events) {
      events[client_events[i]] = { status: false };
    }

    var bail = false;

    before(function () {
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

    // after(function () {
    //   Client1.logout();
    // });

    afterEach(function (done) {
      done();
    });

    it("socket disconnection should trigger a re-connection", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      function checkReconnection() {
        waitUntil(events["onConnectionChangeConnected"], done, 500);
      }
      function triggerDisconnection() {
        Client1.phone.transport.disconnect();
        waitUntil(
          events["onConnectionChangeDisconnected"],
          checkReconnection,
          500
        );
      }
      if (Client1.isLoggedIn) {
        triggerDisconnection();
      } else {
        Client1.on("onLogin", function () {
          triggerDisconnection();
        });
      }
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("reconnection failed"));
      }, TIMEOUT);
    });

    it("hangup after re-connection should send call summary", function (done) {
      if (bail) {
        done(new Error("bailing"));
      }
      // initialize spies
      const spy = sinon.spy(plivo_log, "debug");
      spy.resetHistory();
      // const spy2 = sinon.spy(Client1.statsSocket.ws, "send");
      // spy2.resetHistory();

      // declare essential functions
      // function checkArguments() {
      //   const call = spy2.getCall(-1);
      //   if (JSON.parse(call.args[0]).msg === "CALL_SUMMARY") {
      //     done();
      //   }
      // }

      function checkCallSumary() {
        Client1.hangup();
        waitUntil(spy.calledWith("stats send success"), done, 500);
      }
      function checkReconnection() {
        waitUntil(events["onConnectionChangeConnected"], checkCallSumary, 500);
      }

      // trigger logic
      Client1.call(secondary_user, {});
      setTimeout(function(){
        Client1.phone.transport.disconnect();
        waitUntil(
          events["onConnectionChangeDisconnected"],
          checkReconnection,
          500
        );
      },3000)
      bailTimer = setTimeout(function () {
        bail = true;
        done(new Error("reconnection failed"));
      }, TIMEOUT);
    });
  });
});

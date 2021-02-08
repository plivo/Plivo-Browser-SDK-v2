/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from "../../lib/client";
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

// eslint-disable-next-line no-undef
describe("plivoWebSdk", function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe("outgoing call", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};
    let spyOnSocket;
    let spyOnDebug;

    const clientEvents = [
      "onCallRemoteRinging",
      "onCallFailed",
      "onCallAnswered",
      "onCallTerminated",
      "onCalling",
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    function waitUntilOutgoingCall(boolObj, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === "undefined" || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;

      const check = typeof boolObj === "boolean" ? boolObj : boolObj.status;
      setTimeout(() => {
        if (check) {
          callback();
        } else {
          waitUntilOutgoingCall(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.login(primary_user, primary_pass);
      Client2.login(secondary_user, secondary_pass);
      Client1.on("onCallRemoteRinging", () => {
        events.onCallRemoteRinging.status = true;
      }); // done
      Client1.on("onCallFailed", () => {
        events.onCallFailed.status = true;
      }); // done
      Client1.on("onCallAnswered", () => {
        events.onCallAnswered.status = true;
      }); // done
      Client1.on("onCallTerminated", () => {
        events.onCallTerminated.status = true;
      }); // done
      Client1.on("onCalling", () => {
        events.onCalling.status = true;
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
    after(() => {
      Client1.logout();
      Client2.logout();
      spyOnDebug.restore();
      spyOnSocket.restore();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // eslint-disable-next-line no-undef
    it("outbound call should go through", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      const extraHeaders = {};
      extraHeaders["X-PH-conference"] = "true";
      if (Client1.isLoggedIn) {
        Client1.call(secondary_user, extraHeaders);
      } else {
        Client1.on("onLogin", () => {
          Client1.call(secondary_user, extraHeaders);
        });
      }
      waitUntilOutgoingCall(events.onCalling, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should ring", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      waitUntilOutgoingCall(events.onCallRemoteRinging, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call ring failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should be answered", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client2.answer();
      // eslint-disable-next-line @typescript-eslint/dot-notation
      waitUntilOutgoingCall(events["onCallAnswered"], done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call answer failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should be hungup", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.hangup();
      waitUntilOutgoingCall(events.onCallTerminated, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call hangup failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should be ended without answer", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client2.reject();
      Client1.call(secondary_user, {});
      bailTimer = setTimeout(() => {
        Client1.hangup();
      }, 2000);
      waitUntilOutgoingCall(events.onCallFailed, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call end failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should be muted", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.call(secondary_user, {});
      // eslint-disable-next-line no-undef
      spyOnSocket = sinon.spy(Client1.statsSocket, "send");
      spyOnSocket.resetHistory();

      // eslint-disable-next-line no-undef
      spyOnDebug = sinon.spy(plivo_log, "debug");
      spyOnDebug.resetHistory();

      function checkArguments() {
        const call = spyOnSocket.getCall(-1);
        if (
          call.args[0].msg === "TOGGLE_MUTE"
          && call.args[0].action === "mute"
        ) {
          done();
        } else {
          done(new Error("outgoing call mute failed"));
        }
      }

      function mute() {
        Client1.mute();
        waitUntilOutgoingCall(
          spyOnDebug.calledWith("stats send success"),
          checkArguments,
          500,
        );
      }
      waitUntilOutgoingCall(events.onCalling, mute, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call mute failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should be unmuted", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      spyOnSocket.resetHistory();
      spyOnDebug.resetHistory();

      function checkArguments() {
        const call = spyOnSocket.getCall(-1);
        if (
          call.args[0].msg === "TOGGLE_MUTE"
          && call.args[0].action === "unmute"
        ) {
          Client1.hangup();
          done();
        } else {
          done(new Error("outgoing call end failed"));
        }
      }

      Client1.unmute();
      waitUntilOutgoingCall(
        spyOnDebug.calledWith("stats send success"),
        checkArguments,
        500,
      );

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call end failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("outbound call should send feedback", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      function checkArguments() {
        const call = spyOnSocket.getCall(-1);
        if (call.args[0].msg === "FEEDBACK") {
          Client1.hangup();
          done();
        } else {
          done(new Error("outgoing call end failed"));
        }
      }

      Client1.call(secondary_user, {});
      Client2.on("onIncomingCall", (callerName, extraHeaders2, callInfo) => {
        Client2.answer(callInfo.callUUID);
        setTimeout(() => {
          Client1.hangup();
          spyOnSocket.resetHistory();
          spyOnDebug.resetHistory();
          setTimeout(() => {
            Client1.submitCallQualityFeedback(
              // eslint-disable-next-line no-underscore-dangle
              Client1._currentSession ? Client1._currentSession.callUUID : Client1.lastCallUUID,
              "5",
              [],
              "",
              false,
            ).then(() => {
              checkArguments();
            });
          }, 1000);
        }, 5000);
      });

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call end failed"));
      }, TIMEOUT);
    });
  });
});

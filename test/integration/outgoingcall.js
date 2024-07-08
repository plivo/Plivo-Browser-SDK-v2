/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import sinon from 'sinon';
import { Client } from "../../lib/client";
// import { Logger as plivo_log } from "../../lib/logger";

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
      spyOnSocket.restore();
    });

    // eslint-disable-next-line no-undef
    // afterEach((done) => {
    //   done();
    // });

    // #14
    // eslint-disable-next-line no-undef
    it("outbound call should go through and ring", (done) => {
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
      const checkRing = () => {
        waitUntilOutgoingCall(events.onCallRemoteRinging, done, 500);
      };
      waitUntilOutgoingCall(events.onCalling, checkRing, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call failed"));
      }, TIMEOUT);
    });

    // // #16
    // // eslint-disable-next-line no-undef
    // it("outbound call should ring", (done) => {
    //   if (bail) {
    //     done(new Error("bailing"));
    //   }
    //   bailTimer = setTimeout(() => {
    //     bail = true;
    //     done(new Error("outgoing call ring failed"));
    //   }, TIMEOUT);
    // });

    // #15
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

    // #16
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

    // #17
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

    // #18
    // eslint-disable-next-line no-undef
    it("outbound call should be muted", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      function mute() {
        Client1.mute();
        waitUntilOutgoingCall(
          spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
          done,
          500,
        );
      }

      Client1.call(secondary_user, {});
      Client2.on("onIncomingCall", (callerId, extraHeaders2, callInfo, callerName) => {
        spyOnSocket = sinon.spy(Client1.statsSocket, "send");
        Client2.answer(callInfo.callUUID);
        mute();
      });
      // waitUntilOutgoingCall(events.onCalling, mute, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call mute failed"));
      }, TIMEOUT);
    });

    // #19
    // eslint-disable-next-line no-undef
    it("outbound call should be unmuted", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      spyOnSocket.resetHistory();

      Client1.unmute();
      waitUntilOutgoingCall(
        spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
        done,
        500,
      );

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("outgoing call end failed"));
      }, TIMEOUT);
    });

    // #20
    // eslint-disable-next-line no-undef
    it("outbound call should send feedback", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      spyOnSocket.resetHistory();
      spyOnSocket = sinon.spy(Client2.statsSocket, "send");
      // spyOnSocket = sinon.spy(Client2.statsSocket, "send");
      Client2.submitCallQualityFeedback(
        Client2._lastCallSession.callUUID,
        "5",
        [],
        "",
        false,
      ).then(() => {
        waitUntilOutgoingCall(
          spyOnSocket.calledWith(sinon.match.has("msg", "FEEDBACK")),
          done,
          500,
        );
      }).catch(() => {
        done(new Error('outbound call should send feedback failed'));
      });
    });

    // eslint-disable-next-line no-undef
    it("outbound call to space separated string should ring", (done) => {
      if (bail) {
        done(new Error("Bailing"));
        return;
      }

      Client1.hangup();
      waitUntilOutgoingCall(events.onCallTerminated, () => {
        let s = secondary_user.replace(/\s/g, "");
        s = s.split('').join(' ');
        if (Client1.isLoggedIn) {
          Client1.call(s, {});
        } else {
          Client1.on("onLogin", () => {
            Client1.call(s, {});
          });
        }
        waitUntilOutgoingCall(events.onCalling, done, 1000);
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("Outgoing call failed"));
      }, TIMEOUT);
    });

    // it("outbound call to number should ring", (done) => {
    //   if (bail) {
    //     done(new Error("Bailing"));
    //     return;
    //   }

    //   Client1.hangup();
    //   waitUntilOutgoingCall(events.onCallTerminated, () => {
    //     if (Client1.isLoggedIn) {
    //       Client1.call('+12088340983', {});
    //     } else {
    //       Client1.on("onLogin", () => {
    //         Client1.call('+12088340983', {});
    //       });
    //     }
    //     waitUntilOutgoingCall(events.onCalling, done, 1000);
    //   }, 1000);
    //   bailTimer = setTimeout(() => {
    //     bail = true;
    //     done(new Error("Outgoing call failed"));
    //   }, TIMEOUT);
    // });

    // eslint-disable-next-line no-undef
    it("multiple outbound calls to the same user should ring", (done) => {
      console.log('multiple outbound calls to the same user should ring');
      if (bail) {
        done(new Error("Bailing"));
        return;
      }

      Client1.hangup();
      Client1.call(secondary_user, {
        'X-PH-plivoHeaders': '1',
      });
      Client1.call(secondary_user, {
        'X-PH-plivoHeaders': '2',
      });
      Client1.call(secondary_user, {
        'X-PH-plivoHeaders': '3',
      });
      Client1.call(secondary_user, {
        'X-PH-plivoHeaders': '4',
      });
      Client1.call(secondary_user, {
        'X-PH-plivoHeaders': '5',
      });
      waitUntilOutgoingCall(events.onCalling, () => {
        if (Client1._currentSession.extraHeaders && Client1._currentSession.extraHeaders['X-PH-plivoHeaders'] === '1' && Client1._currentSession.dest === secondary_user) {
          done();
        }
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("Outgoing call failed"));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it("multiple outbound calls to the different user should ring", (done) => {
      console.log('multiple outbound calls to the different user should ring');
      if (bail) {
        done(new Error("Bailing"));
        return;
      }

      Client1.hangup();
      waitUntilOutgoingCall(events.onCallTerminated, () => {
        console.log('starting the call')
        Client1.call('user1', {
          'X-PH-plivoHeaders': '1',
        });
        Client1.call('user2', {
          'X-PH-plivoHeaders': '2',
        });
        Client1.call('user3', {
          'X-PH-plivoHeaders': '3',
        });
        Client1.call('user4', {
          'X-PH-plivoHeaders': '4',
        });
        Client1.call('user5', {
          'X-PH-plivoHeaders': '5',
        });
        waitUntilOutgoingCall(events.onCalling, () => {
          console.log('received the call ', JSON.stringify(Client1._currentSession.extraHeaders));

          if (Client1._currentSession.extraHeaders && Client1._currentSession.extraHeaders['X-PH-plivoHeaders'] === '1' && Client1._currentSession.dest === 'user1') {
            done();
          }
        }, 200);
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("Outgoing call failed"));
      }, TIMEOUT);
    });
  });
});

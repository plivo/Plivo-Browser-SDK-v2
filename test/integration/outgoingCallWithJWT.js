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

let plivo_jwt = '';
let plivo_jwt_without_outbound_access = ''

const auth_id = process.env.PLIVO_JWT_AUTHID;
const basic_auth = process.env.PLIVO_JWT_BASIC_AUTH;

async function getJWTToken(outgoing, incoming) {
  var tokenGenServerURI = new URL(`https://api.plivo.com/v1/Account/${auth_id}/JWT/Token`);

  const payload = {
    "iss": auth_id,
    "per": {
      "voice": {
        "incoming_allow": incoming,
        "outgoing_allow": outgoing,
      }
    },
    "sub": "Test9034"
  }
  let requestBody = {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': basic_auth
    }),
    body: JSON.stringify(payload),
  };

  let res = await fetch(tokenGenServerURI, requestBody).catch(function (err) {
    console.error("Error in fetching the token ", err);
    return null
  });

  try {
    let myJson = await res.json()
    return (myJson['token'])
  } catch (error) {
    console.error("Error : " + error);
    return null
  }
}

// eslint-disable-next-line no-undef
describe("plivoWebSdk JWT", function () {
  const GLOBAL_TIMEOUT = 20000;
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
    before(async () => {
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
      });
      let token = await getJWTToken(true, true)
      console.log("token is ", token)
      plivo_jwt = token
      Client1.loginWithAccessToken(plivo_jwt);
      Client2.login(secondary_user, secondary_pass);

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
      extraHeaders['X-Plivo-Jwt'] = plivo_jwt;
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
      console.log('answering the calls');
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
      Client1.call(secondary_user, {});
      bailTimer = setTimeout(() => {
        Client1.hangup();
      }, 3000);
      waitUntilOutgoingCall(events.onCallFailed, done, 1000);
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
  });

  // eslint-disable-next-line no-undef
  describe("outgoing call shoudn't work if permission not granted", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};
    let spyOnSocket;

    const clientEvents = [
      "onCallRemoteRinging",
      "onCallFailed",
      "onCallAnswered",
      "onCallTerminated",
      "onCalling",
      "onPermissionDenied",
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
    before(async () => {
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
      Client1.on("onPermissionDenied", () => {
        events.onPermissionDenied.status = true;
      }); // done

      const token = await getJWTToken(false, true);
      console.log("token is ", token);
      plivo_jwt_without_outbound_access = token;
      Client1.loginWithAccessToken(plivo_jwt_without_outbound_access);
      Client2.login(secondary_user, secondary_pass);
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
      // spyOnSocket.restore();
    });

    // #14
    // eslint-disable-next-line no-undef
    it("outbound call should failed", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      const extraHeaders = {};
      extraHeaders["X-PH-conference"] = "true";
      extraHeaders['X-Plivo-Jwt'] = plivo_jwt_without_outbound_access;

      if (Client1.isLoggedIn) {
        Client1.call(secondary_user, extraHeaders);
      } else {
        Client1.on("onLogin", () => {
          Client1.call(secondary_user, extraHeaders);
        });
      }
      waitUntilOutgoingCall(events.onPermissionDenied, done, 500);

      bailTimer = setTimeout(() => {
        bail = false;
        done(new Error("outgoing call failed"));
      }, TIMEOUT);
    });
  });
});

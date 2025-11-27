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
const Client2 = new Client(options);

const primary_user = process.env.PLIVO_ENDPOINT1_USERNAME;
const primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

let plivo_jwt = '';
let plivo_jwt_without_inbound_access = '';   //  jwt with no inbound access  

const auth_id = process.env.PLIVO_JWT_AUTHID;
const basic_auth = process.env.PLIVO_JWT_BASIC_AUTH;

async function getJWTToken(outgoing, incoming) {
  const tokenGenServerURI = new URL(`https://api.plivo.com/v1/Account/${auth_id}/JWT/Token`);

  const payload = {
    iss: auth_id,
    per: {
      voice: {
        incoming_allow: incoming,
        outgoing_allow: outgoing,
      },
    },
    sub: "Test9034",
  };

  const requestBody = {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
      Authorization: basic_auth,
    }),
    body: JSON.stringify(payload),
  };

  const res = await fetch(tokenGenServerURI, requestBody).catch((err) => {
    console.error("Error in fetching the token ", err);
    return null;
  });

  try {
    const myJson = await res.json();
    return myJson.token;
  } catch (error) {
    console.error("Error : " + error);
    return null;
  }
}

// eslint-disable-next-line no-undef
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe('incoming call', function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};

    const clientEvents = [
      'onIncomingCallCanceled',
      'onCallFailed',
      'onCallAnswered',
      'onCallTerminated',
      'onIncomingCall',
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    function waitUntilIncoming(boolObj, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;
      setTimeout(() => {
        if (boolObj.status) {
          callback();
        } else {
          waitUntilIncoming(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before((done) => {
      Client1.on('onIncomingCallCanceled', () => {
        events.onIncomingCallCanceled.status = true;
      });
      Client1.on('onCallFailed', () => {
        events.onCallFailed.status = true;
      });
      Client1.on('onCallAnswered', () => {
        events.onCallAnswered.status = true;
      });
      Client1.on('onCallTerminated', () => {
        events.onCallTerminated.status = true;
      });
      Client1.on('onIncomingCall', () => {
        events.onIncomingCall.status = true;
      });
      getJWTToken(true, true).then((token) => {
        console.log("token is ", token);
        plivo_jwt = token;
        Client1.login(primary_user, primary_pass);
        Client2.loginWithAccessToken(plivo_jwt);
        Client2.on("onLogin", () => {
          if (Client2.isIncomingGrant) {
            done();
          }
        });
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
      Client1.logout();
      Client2.logout();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // #5
    // eslint-disable-next-line no-undef
    it('inbound call should come through JWT with extra headers', (done) => {
      console.log("inbound call should come through JWT with extra headers");
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.call(primary_user, {
        "X-Ph-Random": "true",
        "X-Plivo-Jwt": plivo_jwt,
      });
      Client1.on(
        "onIncomingCall",
        (callerName, extraHeaders2) => {
          if (extraHeaders2 && extraHeaders2["X-Ph-Random"]) {
            done();
          } else {
            done(new Error('incoming call with extra headers failed'));
          }
        },
      );
      // waitUntilIncoming(events.onIncomingCall, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // #6
    // eslint-disable-next-line no-undef
    it('inbound call should be answered', (done) => {
      console.log("inbound call should be answered");
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.answer();
      waitUntilIncoming(events.onCallAnswered, done, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('outgoing call answer failed'));
      }, TIMEOUT);
    });

    // #7
    // eslint-disable-next-line no-undef
    it('inbound call should be hungup', (done) => {
      console.log("inbound call should be hungup");
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.hangup();
      waitUntilIncoming(events.onCallTerminated, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call hangup failed'));
      }, TIMEOUT);
    });

    // #8
    // eslint-disable-next-line no-undef
    it('inbound call should be ended without answer', (done) => {
      console.log("inbound call should be ended without answer");
      Client2.hangup();
      if (bail) {
        done(new Error('bailing'));
      }
      // eslint-disable-next-line no-underscore-dangle
      Client2._currentSession = null;
      Client2.call(primary_user, {});
      function reject() {
        Client1.reject();
        waitUntilIncoming(events.onCallFailed, done, 500);
      }
      waitUntilIncoming(events.onIncomingCall, reject, 2000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call end failed'));
      }, TIMEOUT);
    });

    it('incoming call without Inbound access', (done) => {
      console.log("incoming call without Inbound access");
      Client2.hangup();
      const secondClientEvents = {
        onCallFailed: { status: false },
        onLogout: { status: false },
        onLogin: { status: false },
      };

      Client2.on("onLogout", () => {
        secondClientEvents.onLogout.status = true;
      });
      Client2.on("onLogin", () => {
        console.log("Client2 is logged in");
        secondClientEvents.onLogin.status = true;
      });
      Client2.on("onCallFailed", () => {
        secondClientEvents.onCallFailed.status = true;
      });
      if (bail) {
        done(new Error('bailing'));
      }

      Client2.logout();

      const loginCallback = () => {
        Client1.call(Client2.userName, {});
        waitUntilIncoming(events.onCallFailed, done, 500);
      };

      const logoutCallback = () => {
        getJWTToken(true, false).then((token) => {
          console.log("token without inbound access is ", token);
          plivo_jwt_without_inbound_access = token;
          Client2.loginWithAccessToken(plivo_jwt_without_inbound_access);
          waitUntilIncoming(secondClientEvents.onLogin, loginCallback, 1000);
        });
      };

      waitUntilIncoming(secondClientEvents.onLogout, logoutCallback, 2000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call end failed'));
      }, TIMEOUT);
    });
  });
});

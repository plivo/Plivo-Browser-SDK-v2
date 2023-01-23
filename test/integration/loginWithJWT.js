/* eslint-disable @typescript-eslint/naming-convention */
import Plivo from '../../lib';
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
let plivo_jwt = '';

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
    reject(null);
  });

  try {
    let myJson = await res.json()
    return (myJson['token'])
  } catch (error) {
    console.error("Error : " + error);
    return null
  }
}

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
  describe("login with jwt", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};

    const clientEvents = ["onLogin", "onLogout", "onLoginFailed"];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    // eslint-disable-next-line no-undef
    before(async () => {
      Client1.on("onLogin", () => {
        events.onLogin.status = true;
      }); // done
      Client1.on("onLogout", () => {
        events.onLogout.status = true;
      }); // done
      Client1.on("onLoginFailed", () => {
        events.onLoginFailed.status = true;
      }); // done
      let token = await getJWTToken(true, true)
      console.log("token is ", token)
      plivo_jwt = token
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

    // #9
    // eslint-disable-next-line no-undef
    it("login should fail", (done) => {
      Client1.loginWithAccessToken('wrong_jwt');
      waitUntilLogin(events.onLoginFailed, done, 500);
      Client1.on("onLoginFailed", () => {
        done('sample testing');
      });
      bailTimer = setTimeout(() => {
        done(new Error("login should have failed"));
      }, TIMEOUT);
    });

    // #10
    // eslint-disable-next-line no-undef
    it("login should work", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }
      Client1.loginWithAccessToken(plivo_jwt);
      waitUntilLogin(events.onLogin, done, 500);
      bailTimer = setTimeout(() => {
        bail = true;
        throw new Error("login failed");
      }, TIMEOUT);
    });

    // #11
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

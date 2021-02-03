import { Client1 } from './clients';

const masterUser = process.env.PLIVO_MASTER_USERNAME;
const masterPass = process.env.PLIVO_MASTER_PASSWORD;

function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10))
    ? 100
    : delay;
  setTimeout(() => {
    if (boolObj.status) {
      callback();
    } else {
      waitUntil(boolObj, callback, newDelay);
    }
  }, newDelay);
}

// eslint-disable-next-line no-undef
describe('Login', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  const events = {};

  const clientEvents = ['onLogin', 'onLogout', 'onLoginFailed'];

  clientEvents.forEach((i) => {
    events[i] = { status: false };
  });

  let bail = false;

  // eslint-disable-next-line no-undef
  before(() => {
    Client1.on('onLogin', () => {
      events.onLogin.status = true;
    }); // done
    Client1.on('onLogout', () => {
      events.onLogout.status = true;
    }); // done
    Client1.on('onLoginFailed', () => {
      events.onLoginFailed.status = true;
    }); // done
  });

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    const keys = Object.keys(events);
    // reset all the flags
    keys.forEach((key) => {
      events[key].status = false;
    });
    clearTimeout(bailTimer);
  });

  // eslint-disable-next-line no-undef
  afterEach((done) => {
    done();
  });

  // eslint-disable-next-line no-undef
  it('login should fail', (done) => {
    Client1.login(masterUser, 'wrong_password');
    waitUntil(events.onLoginFailed, done, 500);
    Client1.on('onLoginFailed', () => {
      done();
    });
    bailTimer = setTimeout(() => {
      done(new Error('login should have failed'));
    }, TIMEOUT);
  });

  // eslint-disable-next-line no-undef
  it('login should work', (done) => {
    if (bail) {
      done(new Error('bailing'));
    }
    Client1.login(masterUser, masterPass);
    waitUntil(events.onLogin, done, 500);
    bailTimer = setTimeout(() => {
      bail = true;
      throw new Error('login failed');
    }, TIMEOUT);
  });

  // eslint-disable-next-line no-undef
  it('should be able to logout', (done) => {
    setTimeout(() => {
      Client1.logout();
      waitUntil(events.onLogout, done, 500);
      bailTimer = setTimeout(() => {
        done(new Error('logout failed'));
      }, TIMEOUT);
    }, 5000);
  });
});

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
  stopAutoRegisterOnConnect: true,
};

const Client1 = new Client(options);
const Client2 = new Client(options);
const Client3 = new Client(options);

const primary_user = process.env.PLIVO_ENDPOINT1_USERNAME;
const primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

// eslint-disable-next-line no-undef
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe('multi-tab', function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};

    const clientEvents = [
      'onLogin',
      'onWebsocketConnected',
      'onWebsocketDisconnected',
      'onConnectionChange',
      'onConnectionDisconnected',
      'onLogout',
      'onLoginFailed',
    ];

    const noOfClients = 3;
    for (let i = 1; i <= noOfClients; i += 1) {
      clientEvents.forEach((eventName) => {
        events[`client${i}-${eventName}`] = { status: false };
      });
    }

    let bail = false;

    function waitUntilExecuted(boolObj, value, callback, delay) {
      // if delay is undefined or is not an integer
      const newDelay = typeof delay === "undefined" || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;
      setTimeout(() => {
        let isTruthy = 0;
        boolObj.forEach((event) => {
          if (event.status === value) {
            isTruthy += 1;
          }
        });
        if (isTruthy === boolObj.length) {
          callback();
        } else {
          waitUntilExecuted(boolObj, value, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      clientEvents.forEach((event) => {
        Client1.on(event, () => {
          events[`client1-${event}`].status = true;
        });
        Client2.on(event, () => {
          events[`client2-${event}`].status = true;
        });
        Client3.on(event, () => {
          events[`client3-${event}`].status = true;
        });
      });
    });

    function reset() {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        events[key].status = false;
      });
      clearTimeout(bailTimer);
    }

    // eslint-disable-next-line no-undef
    after(() => {
      Client1.logout();
      Client2.logout();
      Client3.logout();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // #5
    // eslint-disable-next-line no-undef
    it('All the clients should be connected to websocket', (done) => {
      console.log('All the clients should be connected to websocket');
      reset();
      Client1.login(primary_user, primary_pass);
      Client2.login(primary_user, primary_pass);
      Client3.login(primary_user, primary_pass);
      waitUntilExecuted([events['client1-onWebsocketConnected'], events['client2-onWebsocketConnected'], events['client3-onWebsocketConnected']], true, done, 1000);
    });

    // eslint-disable-next-line no-undef
    it('only one client instance should be registered and rest all should be connected', (done) => {
      console.log('one client instance should be registered and rest all should be connected');
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.register();
      waitUntilExecuted([events['client1-onLogin'], events['client2-onWebsocketConnected'], events['client3-onWebsocketConnected']], true, done, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('All the client instance should be registered', (done) => {
      console.log('All the client instance should be registered');
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.register();
      Client3.register();
      waitUntilExecuted([events['client1-onLogin'], events['client2-onLogin'], events['client3-onLogin']], true, done, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('unregistering one of the client instance', (done) => {
      console.log('unregistering one of the client instance');
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.unregister();
      Client1.on('onConnectionChange', (data) => {
        if (data.state === 'disconnected' && data.reason === 'unregistered') {
          events[`client1-onConnectionDisconnected`].status = true;
        }
      });
      waitUntilExecuted([events['client1-onConnectionDisconnected'], events['client2-onLogin'], events['client3-onLogin']], true, done, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('disconnect all the clients', (done) => {
      console.log('disconnect all the clients');
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.disconnect();
      Client2.disconnect();
      Client3.disconnect();
      if (!Client1.isConnected() && !Client2.isConnected() && !Client3.isConnected()) {
        done();
      }
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('should not register before connection', (done) => {
      console.log('should not register before connection');
      if (bail) {
        done(new Error('bailing'));
      }
      reset();
      Client1.login(primary_user, primary_pass);
      if (!Client1.register()) {
        done();
      }
    });

    // eslint-disable-next-line no-undef
    it('should not register if not connected OR already registered', (done) => {
      console.log('should not register if not connected OR already registered');
      if (bail) {
        done(new Error('bailing'));
      }
      waitUntilExecuted([events['client1-onWebsocketConnected']], true, () => {
        Client1.register();
      }, 1000);
      waitUntilExecuted([events['client1-onLogin']], true, () => {
        let value = false;
        if (!Client1.register()) {
          value = true;
        }
        if (Client1.register(['XplivoInMemory: true']) && value) {
          done();
        }
      }, 1000);
    });

    // eslint-disable-next-line no-undef
    it('should not disconnect if not connected', (done) => {
      console.log('should not disconnect if not connected');
      if (bail) {
        done(new Error('bailing'));
      }
      if (!Client2.disconnect()) {
        done();
      }
    });

    // eslint-disable-next-line no-undef
    it('should not unregister if not registered', (done) => {
      console.log('should not register if not registered');
      if (bail) {
        done(new Error('bailing'));
      }
      if (!Client2.unregister()) {
        done();
      }
    });

    // eslint-disable-next-line no-undef
    it('should logout if not connected and not registered', (done) => {
      console.log('should logout if not connected and not registered');
      if (bail) {
        done(new Error('bailing'));
      }
      if (!Client3.logout()) {
        done();
      }
    });

    // eslint-disable-next-line no-undef
    it('should not logout if not connected', (done) => {
      console.log('should not logout if not connected');
      if (bail) {
        done(new Error('bailing'));
      }
      if (!Client2.logout()) {
        done();
      }
    });

    // eslint-disable-next-line no-undef
    it('should logout if connected but not registered', (done) => {
      console.log('should logout if connected but not registered');
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.login(primary_user, primary_pass);
      waitUntilExecuted([events['client2-onWebsocketConnected']], true, () => {
        if (!Client2.isRegistered()) {
          Client2.logout();
          waitUntilExecuted([events['client2-onLogout']], true, done, 1000);
        }
      }, 1000);
    });

    // eslint-disable-next-line no-undef
    it('should logout if registered', (done) => {
      console.log('should logout if registered');
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.logout();
      waitUntilExecuted([events['client1-onLogout']], true, done, 1000);
    });
  });
});

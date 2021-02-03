import { Client1, Client2 } from './clients';
import { Logger as plivo_log } from '../../lib/logger';

const masterUser = process.env.PLIVO_MASTER_USERNAME;
const masterPass = process.env.PLIVO_MASTER_PASSWORD;

const slaveUser = process.env.PLIVO_SLAVE_USERNAME;
const slavePass = process.env.PLIVO_SLAVE_PASSWORD;

function waitUntil(boolObj, callback, delay) {
  // if delay is undefined or is not an integer
  const newDelay = typeof delay === 'undefined' || Number.isNaN(parseInt(delay, 10)) ? 100 : delay;

  const check = typeof boolObj === 'boolean' ? boolObj : boolObj.status;
  setTimeout(() => {
    if (check) {
      callback();
    } else {
      waitUntil(boolObj, callback, newDelay);
    }
  }, newDelay);
}

// eslint-disable-next-line no-undef
describe('Network Change', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 20000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  before(() => {
    // Client1.on('onLogin', () => done());
    Client1.login(masterUser, masterPass);
  });

  // eslint-disable-next-line no-undef
  describe('Client2 login', () => {
    // eslint-disable-next-line no-undef
    before(() => {
      // Client2.on('onLogin', () => done());
      Client2.login(slaveUser, slavePass);
    });
  });

  // eslint-disable-next-line no-undef
  describe('network change', () => {
    const events = {};

    const clientEvents = [
      'onConnectionChange',
      'onConnectionChangeConnected',
      'onConnectionChangeDisconnected',
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false };
    });

    let bail = false;

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.on('onConnectionChange', (obj) => {
        events.onConnectionChange.status = true;
        if (obj.state === 'connected') {
          events.onConnectionChangeConnected.status = true;
        }
        if (obj.state === 'disconnected') {
          events.onConnectionChangeDisconnected.status = true;
        }
      });
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

    // after(function () {
    //   Client1.logout();
    // });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // eslint-disable-next-line no-undef
    it('socket disconnection should trigger a re-connection', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      function checkReconnection() {
        waitUntil(events.onConnectionChangeConnected, done, 500);
      }
      function triggerDisconnection() {
        Client1.phone.transport.disconnect();
        waitUntil(
          events.onConnectionChangeDisconnected,
          checkReconnection,
          500,
        );
      }
      triggerDisconnection();
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('reconnection failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('hangup after re-connection should send call summary', (done) => {
      if (bail) {
        done(new Error('bailing'));
      }
      // initialize spies
      // eslint-disable-next-line no-undef
      const spy = sinon.spy(plivo_log, 'debug');
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
        waitUntil(spy.calledWith('stats send success'), done, 500);
      }
      function checkReconnection() {
        waitUntil(events.onConnectionChangeConnected, checkCallSumary, 500);
      }

      // trigger logic
      Client1.call(slaveUser, {});
      setTimeout(() => {
        Client1.phone.transport.disconnect();
        waitUntil(
          events.onConnectionChangeDisconnected,
          checkReconnection,
          500,
        );
      }, 3000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('reconnection failed'));
      }, TIMEOUT);
    });
  });
});

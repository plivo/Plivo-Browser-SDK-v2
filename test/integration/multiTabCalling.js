/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import sinon from 'sinon';
import { Client } from '../../lib/client';
import { on } from 'events';
import { replaceStream } from '../../lib/media/audioDevice';

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
const Client4 = new Client(options);

const primary_user = process.env.PLIVO_ENDPOINT1_USERNAME;
const primary_pass = process.env.PLIVO_ENDPOINT1_PASSWORD;

const secondary_user = process.env.PLIVO_ENDPOINT2_USERNAME;
const secondary_pass = process.env.PLIVO_ENDPOINT2_PASSWORD;

// eslint-disable-next-line no-undef
describe('plivoWebSdk', function () {
  const GLOBAL_TIMEOUT = 240000;
  this.timeout(GLOBAL_TIMEOUT);
  const TIMEOUT = 10000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe('multi-tab-calling', function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};
    let spyOnSocket;


    const clientEvents = [
      'onLogin',
      'onIncomingCall',
      'onCallAnswered',
      'onCallTerminated',
      'onWebsocketConnected',
      'onCallFailed',
      'onLogout',
      'onIncomingCallCanceled',
      'onIncomingCallIgnored',
    ];

    const noOfClients = 4;
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

      let executionTimer = setTimeout(() => {
        let isTruthy = 0;
        boolObj.forEach((event) => {
          if (event.status === value) {
            isTruthy += 1;
          }
        });
        if (isTruthy === boolObj.length) {
          clearTimeout(executionTimer);
          executionTimer = null;
          callback();
        } else {
          waitUntilExecuted(boolObj, value, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.login(primary_user, primary_pass);
      Client4.login(secondary_user, secondary_pass);
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
        Client4.on(event, () => {
          events[`client4-${event}`].status = true;
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
    beforeEach((done) => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        if (key.includes('onIncomingCall')) {
          events[key].status = false;
        }
      });
      done();
      clearTimeout(bailTimer);
    });

    // eslint-disable-next-line no-undef
    after(() => {
      Client1.logout();
      Client2.logout();
      Client3.logout();
      Client4.logout();
      spyOnSocket.restore();
    });

    // eslint-disable-next-line no-undef
    afterEach((done) => {
      done();
    });

    // #5
    // eslint-disable-next-line no-undef
    it('call between two registered clients should work properly', (done) => {
      console.log('call between two registered should work properly');
      if (bail) {
        done(new Error('bailing'));
      }
      reset();

      waitUntilExecuted([events['client1-onWebsocketConnected'], events['client4-onWebsocketConnected']], true, () => {
        Client1.register();
        Client4.register();
        waitUntilExecuted([events['client1-onLogin'], events['client4-onLogin']], true, () => {
          Client4.call(primary_user, {
            'X-Ph-Random': 'true',
          });
        }, 500);
      }, 500);

      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        waitUntilExecuted([events['client1-onIncomingCallCanceled']], true, done, 500);
        setTimeout(() => {
          Client4.hangup();
        }, 1000);
      }, 500);

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should only come on registered client', (done) => {
      console.log('incoming call should only come on registered client');
      if (bail) {
        done(new Error('bailing'));
      }
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        waitUntilExecuted([events['client2-onIncomingCall'], events['client3-onIncomingCall']], false, done, 1000);
      }, 500);

      Client2.login(primary_user, primary_pass);
      Client3.login(primary_user, primary_pass);
      waitUntilExecuted([events['client2-onWebsocketConnected'], events['client3-onWebsocketConnected']], true, () => {
        Client4.call(primary_user, {
          'X-Ph-Random': 'true',
        });
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be rejected from the registered tab', (done) => {
      console.log('incoming call should be rejected from the registered tab');
      if (bail) {
        done(new Error('bailing'));
      }
      Client1.reject();
      waitUntilExecuted([events['client1-onCallFailed']], true, done, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be ignored from the registered tab', (done) => {
      console.log('incoming call should be ignored from the registered tab');
      if (bail) {
        done(new Error('bailing'));
      }
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        Client1.ignore();
        waitUntilExecuted([events['client1-onIncomingCallIgnored']], true, done, 1000);
      }, 2000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be muted and unmuted from the registered tab', (done) => {
      console.log('incoming call should be ignored from the registered tab');
      if (bail) {
        done(new Error('bailing'));
      }

      function unmute() {
        spyOnSocket.resetHistory();
        Client1.unmute();
        events['client1-onUnmute'] = {
          status: spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
        };
        waitUntilExecuted([events['client1-onUnmute']], true, done, 1000);
      }

      function mute() {
        Client1.mute();
        events['client1-onMute'] = {
          status: spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
        };
        waitUntilExecuted([events['client1-onMute']], true, unmute, 1000);
      }

      Client4.hangup();
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        spyOnSocket = sinon.spy(Client1.statsSocket, "send");
        Client1.answer();
        waitUntilExecuted([events['client1-onCallAnswered']], true, mute, 1000);
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be redirected to other unregistered clients', (done) => {
      console.log('incoming call should be redirected to other unregistered clients');
      if (bail) {
        done(new Error('bailing'));
      }

      Client1.hangup();
      waitUntilExecuted([events['client4-onCallTerminated']], true, () => {
        Client4.call(primary_user, {
          'X-Ph-Random': 'true',
        });
      }, 1000);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        if (!Client2.reject() && !Client2.ignore()) {
          Client1.redirect(Client2.getContactUri());
        }
      }, 1000);
      waitUntilExecuted([events['client2-onIncomingCall']], true, () => {
        // session should be present in both client1 and client2
        if (Client1.getCurrentSession() === null && Client2.getCurrentSession() !== null) {
          done();
        }
      }, 1000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be answered from the unregistered tab', (done) => {
      console.log('incoming call should be answered from the unregistered tab');
      if (bail) {
        done(new Error('bailing'));
      }
      Client2.answer();
      waitUntilExecuted([events['client2-onCallAnswered']], true, () => {
        // session should be present in both client1 and client2
        if (Client1.getCurrentSession() === null && Client2.getCurrentSession() !== null) {
          spyOnSocket = sinon.spy(Client2.statsSocket, "send");
          done();
        }
      }, 200);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be muted/unmuted from the unregistered tab', (done) => {
      console.log('incoming call should be muted/unmuted from the unregistered tab');
      if (bail) {
        done(new Error('bailing'));
      }

      spyOnSocket.resetHistory();
      function unmute() {
        spyOnSocket.resetHistory();
        Client2.unmute();
        events['client2-onUnmute'] = {
          status: spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
        };
        waitUntilExecuted([events['client2-onUnmute']], true, done, 5);
      }

      Client2.mute();
      events['client2-onMute'] = {
        status: spyOnSocket.calledWith(sinon.match.has("msg", "TOGGLE_MUTE")),
      };
      waitUntilExecuted([events['client2-onMute']], true, unmute, 5);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be hangup from the unregistered tab and registered tab', (done) => {
      console.log('incoming call should be hangup from the unregistered tab and registered tab');
      if (bail) {
        done(new Error('bailing'));
      }

      Client2.hangup();
      waitUntilExecuted([events['client2-onCallTerminated']], true, () => {
        // session should be present in both client1 and client2
        if (Client1.getCurrentSession() === null && Client2.getCurrentSession() === null) {
          Client4.hangup();
          waitUntilExecuted([events['client4-onCallTerminated']], true, done, 3000);
        }
      }, 2000);
      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error('incoming call failed'));
      }, TIMEOUT);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should sent call-insights event from registered tab when answered from it', (done) => {
      console.log('incoming call should sent call-insights event from registered tab when answered from it');
      if (bail) {
        done(new Error('bailing'));
      }

      const listenCallInsightsEvent = (eventName, callback) => {
        spyOnSocket.resetHistory();
        let interval = setInterval(() => {
          const value = spyOnSocket.calledWith(sinon.match.has("msg", eventName));
          if (value) {
            // events[`client1-${eventName}`].status = true;
            clearInterval(interval);
            interval = null;
            callback();
          }
        }, 10);
      };

      events['client1-onCallAnswered'].status = false;
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        spyOnSocket = sinon.spy(Client1.statsSocket, "send");
        listenCallInsightsEvent('CALL_RINGING', () => {
          Client1.answer();
          listenCallInsightsEvent('CALL_ANSWERED', () => {
            listenCallInsightsEvent('CALL_STATS', () => {
              Client1.hangup();
              listenCallInsightsEvent('CALL_SUMMARY', () => {
                done();
              });
            });
          });
        });
      }, 500);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should sent call-insights event from registered and unregistered tab when answered from unregistered', (done) => {
      console.log('incoming call should sent call-insights event from registered and unregistered tab when answered from unregistered');
      if (bail) {
        done(new Error('bailing'));
      }

      const listenCallInsightsEvent = (spySocket, eventName, callback) => {
        spySocket.resetHistory();
        let interval = setInterval(() => {
          const value = spySocket.calledWith(sinon.match.has("msg", eventName));
          if (value) {
            clearInterval(interval);
            interval = null;
            callback();
          }
        }, 10);
      };

      spyOnSocket.resetHistory();
      Client4.hangup();
      events['client2-onCallAnswered'].status = false;
      events['client1-onCallAnswered'].status = false;
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        spyOnSocket = sinon.spy(Client1.statsSocket, "send");
        listenCallInsightsEvent(spyOnSocket, 'CALL_RINGING', () => {
          Client1.redirect(Client2.getContactUri());
          waitUntilExecuted([events['client2-onIncomingCall']], true, () => {
            const spyOnSocket2 = sinon.spy(Client2.statsSocket, "send");
            replaceStream(Client4, {
              audio: true, video: false,
            }).then(() => {
              Client2.answer();
              listenCallInsightsEvent(spyOnSocket2, 'CALL_ANSWERED', () => {
                listenCallInsightsEvent(spyOnSocket2, 'CALL_STATS', () => {
                  Client2.hangup();
                  listenCallInsightsEvent(spyOnSocket2, 'CALL_SUMMARY', () => {
                    spyOnSocket2.resetHistory();
                    Client2.hangup();
                    Client1.hangup();
                    done();
                  });
                });
              });
            });
          }, 500);
        });
      }, 500);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be ended when logout is called on unregistered client in ringing state', (done) => {
      console.log('incoming call should be ended when logout is called on unregistered client in ringing state');
      if (bail) {
        done(new Error('bailing'));
      }

      Client4.hangup();
      events['client2-onCallFailed'].status = false;
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        Client1.redirect(Client2.getContactUri());
        waitUntilExecuted([events['client2-onIncomingCall']], true, () => {
          Client2.logout();
          waitUntilExecuted([events['client2-onCallFailed'], events['client2-onLogout']], true, done, 1000);
        }, 1000);
      }, 500);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be ended when logout is called on unregistered client in answered state', (done) => {
      console.log('incoming call should be ended when logout is called on unregistered client in answered state');
      if (bail) {
        done(new Error('bailing'));
      }

      Client4.hangup();
      Client1.hangup();
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        Client1.redirect(Client3.getContactUri());
        waitUntilExecuted([events['client3-onIncomingCall']], true, () => {
          Client3.answer();
          waitUntilExecuted([events['client3-onCallAnswered']], true, () => {
            Client3.logout();
            waitUntilExecuted([events['client3-onCallTerminated'], events['client3-onLogout']], true, done, 1000);
          }, 1000);
        }, 1000);
      }, 500);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be ended when logout is called on registered client in ringing state', (done) => {
      console.log('incoming call should be ended when logout is called on registered client in ringing state');
      if (bail) {
        done(new Error('bailing'));
      }

      Client4.hangup();
      Client1.hangup();
      events['client1-onCallTerminated'].status = false;
      events['client1-onCallFailed'].status = false;
      Client4.call(primary_user);
      waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
        Client1.logout();
        waitUntilExecuted([events['client1-onCallFailed'], events['client1-onLogout']], true, done, 1000);
      }, 500);
    });

    // eslint-disable-next-line no-undef
    it('incoming call should be ended when logout is called on registered client in answered state', (done) => {
      console.log('incoming call should be ended when logout is called on registered client in answered state');
      if (bail) {
        done(new Error('bailing'));
      }

      events['client1-onCallTerminated'].status = false;
      events['client1-onCallAnswered'].status = false;
      events['client1-onWebsocketConnected'].status = false;
      events['client1-onLogin'].status = false;
      Client1.login(primary_user, primary_pass);
      waitUntilExecuted([events['client1-onWebsocketConnected']], true, () => {
        Client1.register();
        waitUntilExecuted([events['client1-onLogin']], true, () => {
          Client4.call(primary_user);
          waitUntilExecuted([events['client1-onIncomingCall']], true, () => {
            Client1.answer();
            waitUntilExecuted([events['client1-onCallAnswered']], true, () => {
              Client1.logout();
              waitUntilExecuted([events['client1-onCallTerminated'], events['client1-onLogout']], true, done, 1000);
            }, 1000);
          }, 500);
        }, 1000);
      }, 1000);
    });
  });
});

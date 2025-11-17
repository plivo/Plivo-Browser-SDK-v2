/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import sinon from 'sinon';
import { Client } from "../../lib/client";

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
  const TIMEOUT = 60000;
  let bailTimer;

  // eslint-disable-next-line no-undef
  describe("zombie session cleanup on 4xx responses", function () {
    this.timeout(GLOBAL_TIMEOUT);

    const events = {};

    const clientEvents = [
      "onCallRemoteRinging",
      "onCallFailed",
      "onCallAnswered",
      "onCallTerminated",
      "onCalling",
      "onConnectionChange",
    ];

    clientEvents.forEach((i) => {
      events[i] = { status: false, data: null };
    });

    let bail = false;

    function waitUntil(boolObj, callback, delay) {
      const newDelay = typeof delay === "undefined" || Number.isNaN(parseInt(delay, 10))
        ? 100
        : delay;

      const check = typeof boolObj === "boolean" ? boolObj : boolObj.status;
      setTimeout(() => {
        if (check) {
          callback();
        } else {
          waitUntil(boolObj, callback, newDelay);
        }
      }, newDelay);
    }

    // eslint-disable-next-line no-undef
    before(() => {
      Client1.login(primary_user, primary_pass);
      Client2.login(secondary_user, secondary_pass);
      
      Client1.on("onCallRemoteRinging", () => {
        events.onCallRemoteRinging.status = true;
      });
      Client1.on("onCallFailed", (cause, callInfo) => {
        events.onCallFailed.status = true;
        events.onCallFailed.data = { cause, callInfo };
      });
      Client1.on("onCallAnswered", () => {
        events.onCallAnswered.status = true;
      });
      Client1.on("onCallTerminated", () => {
        events.onCallTerminated.status = true;
      });
      Client1.on("onCalling", () => {
        events.onCalling.status = true;
      });
      Client1.on("onConnectionChange", (info) => {
        events.onConnectionChange.status = true;
        events.onConnectionChange.data = info;
      });
    });

    // eslint-disable-next-line no-undef
    beforeEach((done) => {
      const keys = Object.keys(events);
      // reset all the flags
      keys.forEach((key) => {
        events[key].status = false;
        events[key].data = null;
      });
      done();
      clearTimeout(bailTimer);
    });

    // eslint-disable-next-line no-undef
    after(() => {
      Client1.logout();
      Client2.logout();
    });

    // Test: Session should be properly terminated after receiving 481 response
    // This simulates the scenario where:
    // 1. Call #1 is made and connected
    // 2. Network disconnects for >60s
    // 3. Server terminates call and responds with 481 on re-INVITE
    // 4. Session should be properly cleaned up
    // 5. Call #2 should work normally without zombie session interference
    it("should properly terminate session after network reconnect with 481 response", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      let call1Session = null;
      let call1UUID = null;

      // Step 1: Make Call #1
      function makeCall1() {
        if (Client1.isLoggedIn) {
          Client1.call(secondary_user, {});
        } else {
          Client1.on("onLogin", () => {
            Client1.call(secondary_user, {});
          });
        }
      }

      // Step 2: Answer Call #1
      function answerCall1() {
        waitUntil(events.onCallRemoteRinging, () => {
          call1Session = Client1._currentSession;
          call1UUID = Client1.callUUID;
          console.log(`Call #1 ringing: ${call1UUID}`);
          Client2.answer();
          waitUntil(events.onCallAnswered, simulateNetworkDisconnect, 500);
        }, 500);
      }

      // Step 3: Simulate network disconnect and reconnect
      function simulateNetworkDisconnect() {
        console.log(`Call #1 answered, simulating network disconnect`);
        setTimeout(() => {
          // Disconnect transport to simulate network loss
          Client1.phone.transport.disconnect();
          
          // Wait for disconnect event
          events.onConnectionChange.status = false;
          waitUntil(() => events.onConnectionChange.status && 
                          events.onConnectionChange.data?.state === 'disconnected', 
            waitForReconnect, 500);
        }, 2000);
      }

      // Step 4: Wait for reconnection
      function waitForReconnect() {
        console.log('Network disconnected, waiting for reconnection');
        events.onConnectionChange.status = false;
        
        waitUntil(() => events.onConnectionChange.status && 
                        events.onConnectionChange.data?.state === 'connected', 
          verifySessionCleanup, 500);
      }

      // Step 5: Verify session cleanup after 481 (if received)
      function verifySessionCleanup() {
        console.log('Network reconnected, verifying session cleanup');
        
        // Wait a bit for any re-INVITEs to happen and potential 481 response
        setTimeout(() => {
          // Check if the original session was marked as ended
          if (call1Session && call1Session.session) {
            const sessionEnded = call1Session.session.isEnded();
            console.log(`Call #1 session ended: ${sessionEnded}`);
            
            // If the session received a 4xx response, it should be marked as ended
            if (events.onCallFailed.status) {
              if (!sessionEnded) {
                done(new Error('Session not properly terminated after 4xx response'));
                return;
              }
              console.log('Session properly terminated after failure');
            }
          }
          
          // Hangup if still active
          if (Client1._currentSession) {
            Client1.hangup();
            waitUntil(events.onCallTerminated, makeCall2, 500);
          } else {
            makeCall2();
          }
        }, 5000);
      }

      // Step 6: Make Call #2 to ensure no zombie session interference
      function makeCall2() {
        console.log('Making Call #2 to verify no zombie session');
        events.onCalling.status = false;
        events.onCallRemoteRinging.status = false;
        
        Client1.call(secondary_user, {});
        
        waitUntil(events.onCalling, () => {
          const call2UUID = Client1.callUUID;
          console.log(`Call #2 initiated: ${call2UUID}`);
          
          // Verify it's a different call
          if (call2UUID === call1UUID) {
            done(new Error('Call #2 has same UUID as Call #1 - zombie session detected'));
            return;
          }
          
          waitUntil(events.onCallRemoteRinging, () => {
            console.log('Call #2 ringing - no zombie session interference detected');
            Client1.hangup();
            done();
          }, 500);
        }, 500);
      }

      // Start the test
      makeCall1();
      waitUntil(events.onCalling, answerCall1, 500);

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("Zombie session test timeout"));
      }, TIMEOUT);
    });

    // Test: Multiple rapid network changes shouldn't create zombie sessions
    it("should handle multiple network changes without zombie sessions", (done) => {
      if (bail) {
        done(new Error("bailing"));
      }

      function makeCall() {
        if (Client1.isLoggedIn) {
          Client1.call(secondary_user, {});
        } else {
          Client1.on("onLogin", () => {
            Client1.call(secondary_user, {});
          });
        }
      }

      function answerCall() {
        waitUntil(events.onCallRemoteRinging, () => {
          Client2.answer();
          waitUntil(events.onCallAnswered, simulateMultipleDisconnects, 500);
        }, 500);
      }

      function simulateMultipleDisconnects() {
        console.log('Simulating multiple network changes');
        let disconnectCount = 0;
        const maxDisconnects = 3;

        function disconnect() {
          if (disconnectCount >= maxDisconnects) {
            verifySessionIntegrity();
            return;
          }

          disconnectCount++;
          console.log(`Network disconnect #${disconnectCount}`);
          
          Client1.phone.transport.disconnect();
          
          setTimeout(() => {
            console.log(`Network reconnecting #${disconnectCount}`);
            disconnect();
          }, 2000);
        }

        disconnect();
      }

      function verifySessionIntegrity() {
        setTimeout(() => {
          // After multiple network changes, verify session is still intact
          if (!Client1._currentSession) {
            done(new Error('Session lost after network changes'));
            return;
          }

          const session = Client1._currentSession;
          console.log(`Session state after network changes: ${session.state}`);
          
          // Clean up
          Client1.hangup();
          waitUntil(events.onCallTerminated, done, 500);
        }, 3000);
      }

      makeCall();
      waitUntil(events.onCalling, answerCall, 500);

      bailTimer = setTimeout(() => {
        bail = true;
        done(new Error("Multiple network changes test timeout"));
      }, TIMEOUT);
    });
  });
});


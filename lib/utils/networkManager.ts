/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import * as SipLib from 'plivo-jssip';
import { Client } from '../client';
import { Logger } from '../logger';
import { createStatsSocket } from '../stats/setup';

interface PingPong {
  client: Client
  networkChangeInterval: number
  messageCheckTimeout: number
}

const Plivo = { log: Logger };

export const restartStatSocket = (client: Client) => {
  if (client.callstatskey && navigator.onLine && client._currentSession) {
    if (client.statsSocket) {
      client.statsSocket.disconnect();
    }
    // start socket
    createStatsSocket.call(client);
  }
};

export const reconnectSocket = (client: Client) => {
  if (navigator.onLine) {
    Plivo.log.debug('Network changed re-registering');
    if (!client._currentSession) {
      (client.phone as any)._transport.disconnect(true);
      (client.phone as any)._transport.connect();
    } else {
      const negotiationStarted = client._currentSession.session.renegotiate({
        rtcOfferConstraints: { iceRestart: true },
      });
      Plivo.log.debug(`Renegotiate Ice :: ${negotiationStarted}`);
    }
    restartStatSocket(client);
  }
};

export const startPingPong = ({
  client,
  networkChangeInterval,
  messageCheckTimeout,
}: PingPong) => {
  const check = client._currentSession ? true : client.browserDetails.browser === 'chrome' || client.browserDetails.browser === 'edge';
  if (check) {
    if (client.networkChangeInterval == null) {
      // eslint-disable-next-line no-param-reassign
      client.networkChangeInterval = setInterval(() => {
        // send message only when there is active network connect
        if (
          navigator.onLine
            && client.phone
            && !(client.phone as any)._transport.isConnecting()
            && !(client.phone as any).isRegistering()
        ) {
          let isFailedMessageTriggered = false;
          let message: null | SipLib.Message = null;
          // timeout to check whether we receive failed event in 5 seconds
          const eventCheckTimeout = setTimeout(() => {
            if (!isFailedMessageTriggered) {
              reconnectSocket(client);
              message = null;
            }
            clearTimeout(eventCheckTimeout);
          }, messageCheckTimeout);
          message = new SipLib.Message(client.phone);
          message.on('failed', () => {
            isFailedMessageTriggered = true;
            if (eventCheckTimeout) clearTimeout(eventCheckTimeout);
          });
          message.send('admin', 'pong', 'OPTIONS');
        }
      }, networkChangeInterval);
    }
  }
};

export const resetPingPong = ({
  client,
  networkChangeInterval,
  messageCheckTimeout,
}: PingPong) => {
  clearInterval(client.networkChangeInterval as any);
  // eslint-disable-next-line no-param-reassign
  client.networkChangeInterval = null;
  startPingPong({
    client,
    messageCheckTimeout,
    networkChangeInterval,
  });
};

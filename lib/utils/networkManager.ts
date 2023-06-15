/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import * as SipLib from 'plivo-jssip';
import { Client } from '../client';
import { LOGCAT } from '../constants';
import { Logger } from '../logger';
import { sendEvents } from '../stats/nonRTPStats';
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
      client.statsSocket = null;
    }
    // start socket
    createStatsSocket.call(client);
  }
};

export const sendNetworkChangeEvent = async (client: Client, ipAddress: string) => {
  const newNetworkType = (navigator as any).connection
    ? (navigator as any).connection.effectiveType
    : 'unknown';
  const obj = {
    msg: "NETWORK_CHANGE",
    previousNetworkInfo: {
      networkType: client.currentNetworkInfo.networkType,
      ip: client.currentNetworkInfo.ip,
    },
    newNetworkInfo: {
      networkType: newNetworkType,
      ip: typeof ipAddress === "string" ? ipAddress : "",
    },
    reconnectionTimestamp: client.networkReconnectionTimestamp,
    disconnectionTimestamp: client.networkDisconnectedTimestamp,
  };
  Plivo.log.info(`${LOGCAT.CALL} | The network changed from ${JSON.stringify(obj.previousNetworkInfo)} to ${JSON.stringify(obj.newNetworkInfo)}`);
  sendEvents.call(client, obj, client._currentSession!);
  // update current network info
  client.currentNetworkInfo = {
    networkType: newNetworkType,
    ip: typeof ipAddress === "string" ? ipAddress : "",
  };
  client.networkDisconnectedTimestamp = null;
  client.networkReconnectionTimestamp = null;
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
          client.networkDisconnectedTimestamp = new Date().getTime();
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
  client.networkChangeInterval = null;
  startPingPong({
    client,
    messageCheckTimeout,
    networkChangeInterval,
  });
};

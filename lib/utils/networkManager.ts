/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import * as SipLib from 'plivo-jssip';
import { Client } from '../client';
import { LOGCAT } from '../constants';
import { Logger } from '../logger';
import { sendEvents } from '../stats/nonRTPStats';
import { createStatsSocket } from '../stats/setup';
import { setConectionInfo } from '../managers/util';

interface PingPong {
  client: Client
  networkChangeInterval: number
  messageCheckTimeout: number
}

export const ConnectionState = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

const Plivo = { log: Logger };
let isConnected = true;

export const restartStatSocket = (client: Client) => {
  Plivo.log.info(`${LOGCAT.CALL} | Restarting websocket if callstatsKey present: ${client.callstatskey} and internet available: ${navigator.onLine}`);
  if (client.callstatskey && navigator.onLine && client._currentSession) {
    if (client.statsSocket) {
      client.statsSocket.disconnect();
      client.statsSocket = null;
    }
    // start socket
    createStatsSocket.call(client);
  }
};

export const getNetworkData = (client: Client, ipAddress: string | Error) => {
  const newNetworkType = (navigator as any).connection
    ? (navigator as any).connection.effectiveType
    : 'unknown';
  const previousNetworkInfo = {
    networkType: client.currentNetworkInfo.networkType,
    ip: client.currentNetworkInfo.ip,
  };
  const newNetworkInfo = {
    networkType: newNetworkType,
    ip: typeof ipAddress === "string" ? ipAddress : "",
  };
  return {
    newNetworkInfo,
    previousNetworkInfo,
  };
};

export const sendNetworkChangeEvent = async (client: Client, ipAddress: string) => {
  const networkInfo = getNetworkData(client, ipAddress);
  const obj = {
    msg: "NETWORK_CHANGE",
    previousNetworkInfo: networkInfo.previousNetworkInfo,
    newNetworkInfo: networkInfo.newNetworkInfo,
    reconnectionTimestamp: client.networkReconnectionTimestamp,
    disconnectionTimestamp: client.networkDisconnectedTimestamp,
  };
  Plivo.log.info(`${LOGCAT.CALL} | The network changed from ${JSON.stringify(obj.previousNetworkInfo)} to ${JSON.stringify(obj.newNetworkInfo)}`);
  sendEvents.call(client, obj, client._currentSession!);
  // update current network info
  client.currentNetworkInfo = {
    networkType: networkInfo.newNetworkInfo.networkType,
    ip: typeof ipAddress === "string" ? ipAddress : "",
  };
  client.networkDisconnectedTimestamp = null;
  client.networkReconnectionTimestamp = null;
};

export const reconnectSocket = (client: Client) => {
  if (navigator.onLine) {
    Plivo.log.debug(`${LOGCAT.CALL} | re-connecting websocket`);
    if (!client._currentSession) {
      (client.phone as any)._transport.disconnect(true);
      (client.phone as any)._transport.connect();
    } else {
      const negotiationStarted = client._currentSession.session.renegotiate({
        rtcOfferConstraints: { iceRestart: true },
      });
      Plivo.log.debug(`${LOGCAT.CALL} | Renegotiating Ice :: ${negotiationStarted}`);
    }
    restartStatSocket(client);
  }
};

export const startPingPong = ({
  client,
  networkChangeInterval,
  messageCheckTimeout,
}: PingPong) => {
  if (client.networkChangeInterval == null) {
    client.networkChangeInterval = setInterval(() => {
      // send message only when there is active network connect
      if (!isConnected) {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} |  Checking for network availablity`);
      }
      if ((client.phone && (!client.phone.isConnected() || !client.phone.isRegistered()))) {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Websocket state is connecting: ${(client.phone as any)._transport.isConnecting()}, registering: ${(client.phone as any).isRegistering()}, connected: ${client.phone.isConnected()} or registered: ${client.phone.isRegistered()}. Is Internet available ${navigator.onLine}`);
      } else if (!client.phone) {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Websocket instance is not available. Is Internet available ${navigator.onLine}`);
      }
      if (
        navigator.onLine
        && client.phone
        && !(client.phone as any)._transport.isConnecting()
        && !(client.phone as any).isRegistering()
      ) {
        let isFailedMessageTriggered = false;
        let isReconnectionStarted = false;
        let message: null | SipLib.Message = null;
        client.networkDisconnectedTimestamp = new Date().getTime();
        if (!isConnected) {
          isConnected = true;
          isReconnectionStarted = true;
          if (client._currentSession) {
            const negotiationStarted = client._currentSession.session.renegotiate({
              rtcOfferConstraints: { iceRestart: true },
            });
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Restarting Connection and Renegotiate Ice :: ${negotiationStarted}`);
          } else {
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Restarting Connection`);
            (client.phone as any)._transport.connect();
          }
        }
        // timeout to check whether we receive failed event in 5 seconds
        const eventCheckTimeout = setTimeout(() => {
          Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Ping request timed out in ${messageCheckTimeout}. Restarting the connection if options response not received: ${!isFailedMessageTriggered}`);
          if (!isFailedMessageTriggered) {
            isReconnectionStarted = true;
            setConectionInfo(client, ConnectionState.DISCONNECTED, "Ping Timed Out");
            reconnectSocket(client);
            message = null;
          }
          clearTimeout(eventCheckTimeout);
        }, messageCheckTimeout);

        message = new SipLib.Message(client.phone);
        message.on('failed', (err) => {
          isFailedMessageTriggered = true;
          if (eventCheckTimeout) clearTimeout(eventCheckTimeout);
          // reconnect if ping OPTIONS packet fails OR UA is not connected/registered
          if (client.options.reconnectOnHeartbeatFail
            && !isReconnectionStarted
            && (err.cause !== 'Not Found'
            || !client.phone?.isConnected()
            || !client.phone?.isRegistered())) {
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Ping request failed with err: ${err.cause}, Client is connected: ${client.phone?.isConnected()} and client is registered: ${client.phone?.isRegistered()}. Restarting the connection`);
            setConectionInfo(client, ConnectionState.DISCONNECTED, `Ping failed with err ${err.cause}`);
            reconnectSocket(client);
            message = null;
          }
          isReconnectionStarted = false;
          // TODO just for debugging purposes. remove it later.
          if (client.options.reconnectOnHeartbeatFail) client.emit('onOptionsMessage', err.cause);
        });
        message.send('admin', 'pong', 'OPTIONS');
      }
      if (!navigator.onLine && client.phone
        && !(client.phone as any)._transport.isConnecting()
        && !(client.phone as any).isRegistering()
        && isConnected) {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Websocket disconnected since internet is not available`);
        setConectionInfo(client, ConnectionState.DISCONNECTED, `No Internet`);
        (client.phone as any)._transport.disconnect(true);
        isConnected = false;
      }
    }, networkChangeInterval);
  }
};

export const resetPingPong = ({
  client,
  networkChangeInterval,
  messageCheckTimeout,
}: PingPong) => {
  clearInterval(client.networkChangeInterval as any);
  client.networkChangeInterval = null;
  Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Re-Starting the ping-pong with interval: ${networkChangeInterval} and timeout: ${messageCheckTimeout}`);
  startPingPong({
    client,
    messageCheckTimeout,
    networkChangeInterval,
  });
};

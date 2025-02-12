/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import * as SipLib from 'plivo-jssip';
import { Client } from '../client';
import { LOGCAT, WS_RECONNECT_RETRY_COUNT, WS_RECONNECT_RETRY_INTERVAL } from '../constants';
import { Logger } from '../logger';
import { sendEvents } from '../stats/nonRTPStats';
import { createStatsSocket } from '../stats/setup';

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

export const socketReconnectionRetry = (client) => {
  let socketReconnectCount = 1;
  clearInterval(client.connectionRetryInterval as any);
  client.connectionRetryInterval = null;
  if (!client.isConnected()) {
    Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Starting the connection interval`);
    client.connectionRetryInterval = setInterval(() => {
      Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Checking WS connection status with count ${socketReconnectCount}`);
      if ((client.phone as any)._transport.socket._ws
        && (client.phone as any)._transport.socket._ws.readyState === 0) {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | WS is not ready state`);
        if (socketReconnectCount >= WS_RECONNECT_RETRY_COUNT) {
          Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Retry count exhausted. Changing domain`);
          // disconnect the socket with ignoreReconnection param as false
          // in order to move to the  fallback domain
          (client.phone as any)._transport.disconnect();
          socketReconnectCount = 1;
        } else {
          Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Connection cannot be established. Increasing the reconnect count`);
          (client.phone as any)._transport.disconnect(true);
          (client.phone as any)._transport.connect();
          socketReconnectCount += 1;
        }
      } else {
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | WS is in ready state or WS instance is available: ${!!((client.phone as any)._transport.socket._ws)}. Clearing the connection check interval`);
        clearInterval(client.connectionRetryInterval as any);
        client.connectionRetryInterval = null;
      }
    }, WS_RECONNECT_RETRY_INTERVAL);
  } else {
    Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Already connected: ${client.isConnected()}. Cannot start another connection attempt interval`);
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

export const sendInfoReInvite = (client: Client, ipAddress: string) => {
  if (client._currentSession) {
    const networkInfo = getNetworkData(client, ipAddress);
    if (networkInfo.newNetworkInfo.ip === networkInfo.previousNetworkInfo.ip) {
      Plivo.log.info(`${LOGCAT.CALL} | ip did not changed. Sending info`);
      client._currentSession.session.sendInfo('command/reconnect');
    } else {
      Plivo.log.info(`${LOGCAT.CALL} | Ip changed. Sending re-invite`);
      (client._currentSession.session as any).renegotiate({
        rtcOfferConstraints: { iceRestart: true },
        sendReinviteOnly: true,
      });
    }
  } else {
    Plivo.log.info(`${LOGCAT.CALL} | No Active Session to send info or re-invite`);
  }
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
  if (client._currentSession && client._currentSession.serverFeatureFlags.indexOf('ft_info') !== -1) {
    sendInfoReInvite(client, ipAddress);
  }
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
    Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | re-connecting websocket`);
    const activeSession = client.lastIncomingCall ?? client._currentSession;
    if (activeSession && activeSession.state === activeSession.STATE.RINGING) {
      Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Terminating ${activeSession.direction} call with calluuid ${activeSession.callUUID} due to network change in ringing state`);
      activeSession.isCallTerminatedDuringRinging = true;
      activeSession.session.terminate();
    } else if (client._currentSession && client._currentSession.serverFeatureFlags.indexOf('ft_info') === -1) {
      const negotiationStarted = client._currentSession
        ? client._currentSession?.session.renegotiate({
          rtcOfferConstraints: { iceRestart: true },
        })
        : false;
      Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Renegotiate Ice :: ${negotiationStarted}`);
    } else {
      Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Closing previous websocket connection. Starting a new one`);
      if (client.phone) {
        (client.phone as any)._transport.disconnect(true);
        (client.phone as any)._transport.connect();
        socketReconnectionRetry(client);
      }
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
          if (client._currentSession && client._currentSession.serverFeatureFlags.indexOf('ft_info') === -1) {
            const negotiationStarted = client._currentSession.session.renegotiate({
              rtcOfferConstraints: { iceRestart: true },
            });
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Restarting Connection and Renegotiate Ice :: ${negotiationStarted}`);
          } else {
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Restarting Connection`);
            (client.phone as any)._transport.connect();
            socketReconnectionRetry(client);
          }
        }
        // timeout to check whether we receive failed event in 5 seconds
        const eventCheckTimeout = setTimeout(() => {
          Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Ping request timed out in ${messageCheckTimeout}. Restarting the connection if options response not received: ${!isFailedMessageTriggered}`);
          if (!isFailedMessageTriggered) {
            isReconnectionStarted = true;
            client.connectionInfo = {
              state: ConnectionState.DISCONNECTED,
              reason: "Ping Timed Out",
            };
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
          if (!isReconnectionStarted
            && (err.cause !== 'Not Found'
            || !client.phone?.isConnected()
            || !client.phone?.isRegistered())) {
            Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Ping request failed with err: ${err.cause}, Client is connected: ${client.phone?.isConnected()} and client is registered: ${client.phone?.isRegistered()}. Restarting the connection`);
            client.connectionInfo = {
              state: ConnectionState.DISCONNECTED,
              reason: `Ping failed with err ${err.cause}`,
            };
            reconnectSocket(client);
            message = null;
          }
          isReconnectionStarted = false;
          client.emit('onOptionsMessage', err.cause);
        });
        message.send('admin', 'pong', 'OPTIONS');
      }
      if (!navigator.onLine && client.phone
        && !(client.phone as any)._transport.isConnecting()
        && !(client.phone as any).isRegistering()
        && isConnected) {
        const activeSession = client.lastIncomingCall ?? client._currentSession;
        if (activeSession && activeSession.state === activeSession.STATE.RINGING) {
          activeSession.isCallTerminatedDuringRinging = true;
          if (activeSession.direction === 'incoming') {
            activeSession.session.terminate();
          }
          Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Terminating ${activeSession.direction} call with calluuid ${activeSession.callUUID} due to network change in ringing state`);
        }
        Plivo.log.debug(`${LOGCAT.NETWORK_CHANGE} | Websocket disconnected since internet is not available`);
        client.connectionInfo = {
          state: ConnectionState.DISCONNECTED,
          reason: `No Internet`,
        };
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

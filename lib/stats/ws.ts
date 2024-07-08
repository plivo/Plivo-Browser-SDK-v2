/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { Client } from '../client';
import { Logger } from '../logger';
import * as C from '../constants';

let retrySecondsCount = C.SOCKET_SEND_STATS_RETRY_SECONDS_COUNT;
let retryAttempts = C.SOCKET_SEND_STATS_RETRY_ATTEMPTS;

const Plivo = { log: Logger };

/**
 * Triggered when websocket is opened.
 */
function onOpen(): void {
  const that: StatsSocket = this;
  that.isConnecting = false;
  Plivo.log.debug(`stats socket ${(this as StatsSocket).url} connected`);
}

/**
 * Triggered when websocket is closed.
 * @param {CloseEvent} e - close event information
 */
function onClose(e: CloseEvent): void {
  Plivo.log.debug('stats socket close()', e);
  const that: StatsSocket = this;
  Plivo.log.debug(`stats socket ${that.url} closed`);
  if (e.wasClean === false) {
    Plivo.log.debug(
      'stats socket abrupt disconnection,  reconnecting in ',
      `${C.STATSSOCKET_RECONNECT_SEC / 1000} sec`,
    );
    if (!that.isConnected()) {
      setTimeout(() => {
        that.connect();
      }, C.STATSSOCKET_RECONNECT_SEC);
    }
  }
}

/**
   * Triggered when websocket receives a new message.
   * @param {MessageEvent} e - message event information
   */
function onMessage(e: MessageEvent): void {
  Plivo.log.info('received stats socket message: ', e.data);
}

/**
   * Triggered when websocket faced any issue in connecting or sending.
   * @param {Event} e - Error event information
   */
function onError(e: Event): void {
  const that: StatsSocket = this;
  that.isConnecting = false;
  Plivo.log.debug(`stats socket ${this.url} error: ${e}`);
}

/**
 * Initialize stats socket.
 */
// eslint-disable-next-line import/prefer-default-export
export class StatsSocket {
  /**
   * URL to establish websocket connection
   * @private
   */
  url: string;

  /**
   * Holds the instance of websocket
   * @private
   */
  ws: null | WebSocket;

  /**
   * Holds a bollean which determines whether the socket is trying for a connection
   * @private
   */
  isConnecting: boolean;

  /**
   * Stores the messages in buffer if websocket is unable to send message
   * @private
   */
  messageBuffer: string[];

  /**
   * @constructor
   * @private
   */
  constructor() {
    this.url = C.STATSSOCKET_URL;
    this.ws = null;
    this.messageBuffer = [];
    this.isConnecting = false;
    this.connect();
  }

  /**
   * Send continous keepalive heartbeat to plivo stats websocket server.
   * @param {Client} cs - client reference
   */
  heartbeat(cs: Client): boolean {
    if (this.isConnected()) {
      const msg = JSON.stringify({
        heartbeat: 'healthy',
        username: cs.userName,
      });
      if (this.ws) {
        this.ws.send(msg);
      }
      Plivo.log.debug('sent heartbeat to stats socket :', msg);
      return true;
    }
    Plivo.log.error('unable to send heartbeat, statsSocket is not open');
    this.reconnect();
    return false;
  }

  /**
   * Create a web socket for stats and add event listeners.
   */
  connect = (): void => {
    if (!this.ws) {
      Plivo.log.debug(`${C.LOGCAT.CALL}| opening stats socket`);
      try {
        this.isConnecting = true;
        this.ws = new WebSocket(this.url);
        this.ws.onopen = onOpen.bind(this);
        this.ws.onclose = onClose.bind(this);
        this.ws.onmessage = onMessage.bind(this);
        this.ws.onerror = onError.bind(this);
      } catch (e) {
        Plivo.log.error('stats socket open error : ', e);
        onError.call(this, e);
      }
    }
  };

  /**
   * Close the web socket.
   */
  disconnect = (): void => {
    Plivo.log.debug('stats socket disconnect()');
    if (this.ws) {
      // unbind websocket event callbacks
      this.ws.onopen = () => {};
      this.ws.onclose = () => {};
      this.ws.onmessage = () => {};
      this.ws.onerror = () => {};

      this.ws.close();
      this.ws = null;
    } else {
      Plivo.log.debug(`${C.LOGCAT.LOGOUT}| webSocket instance not found`);
    }
  };

  /**
   * Check if web socket is open or not.
   */
  isConnected = (): boolean => {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      return true;
    }
    return false;
  };

  /**
   * Send messages to the socket.
   * @param {Object} message - call stats(Answered/RTP/Summary/Feedback/Failure Events)
   */
  send = (message: {[key:string]: any}, client: Client): boolean => {
    if (retryAttempts === C.SOCKET_SEND_STATS_RETRY_ATTEMPTS) {
      this.messageBuffer.push(JSON.stringify(message));
    }
    if (this.isConnected() && navigator.onLine) {
      Plivo.log.debug('stats : ', message);
      while (this.messageBuffer.length) {
        if (this.ws) {
          const item = this.messageBuffer.shift();
          this.ws.send(item as string);
          Plivo.log.debug('stats send success');
          if ((client.callSession == null) && (message.msg === 'CALL_SUMMARY' || message.msg === 'FEEDBACK')) {
            // destroying stats socket since call has ended
            this.disconnect();
            client.statsSocket = null;
            client.networkChangeInCurrentSession = false;
            client.deviceToggledInCurrentSession = false;
          }
        }
      }
      if (retryAttempts !== C.SOCKET_SEND_STATS_RETRY_ATTEMPTS) {
        retryAttempts = C.SOCKET_SEND_STATS_RETRY_ATTEMPTS;
        retrySecondsCount = C.SOCKET_SEND_STATS_RETRY_SECONDS_COUNT;
      }
      return true;
    }
    if (message.msg === 'CALL_STATS_DUMP') {
      Plivo.log.debug('retrying to send call stats dump event');
    }
    if (message.msg === 'CALL_SUMMARY') {
      Plivo.log.debug('retrying to send call summary event');
      if (retryAttempts === C.SOCKET_SEND_STATS_RETRY_ATTEMPTS) {
        retryAttempts = C.SOCKET_SEND_STATS_RETRY_ATTEMPTS;
        retrySecondsCount = C.SOCKET_SEND_STATS_RETRY_SECONDS_COUNT;
        Plivo.log.error(`${C.LOGCAT.CALL} | Error in sending call summary event due to retry exhaustion`);
        // return false;
      }
    }
    setTimeout(() => {
      retrySecondsCount += 1;
      retryAttempts -= 1;
      this.send(message, client);
    }, retrySecondsCount * 900);

    Plivo.log.warn(`${C.LOGCAT.CALL} | statsSocket is not open, retrying to connect`);
    this.reconnect();
    return false;
  };

  /**
   * Reconnect to the socket
   */
  reconnect = ():void => {
    if (navigator.onLine && !this.isConnecting) {
      this.ws = null;
      this.connect();
    }
  };
}

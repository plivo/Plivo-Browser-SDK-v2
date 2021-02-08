/* eslint-disable import/no-cycle */
/* eslint func-names: ["error", "as-needed"] */
import { StatsSocket } from './ws';
import { Logger } from '../logger';
import { Client } from '../client';
import getBrowserDetails from '../utils/browserDetection';

const Plivo = { log: Logger };

/**
 * Creates a web socket for sending Plivo stats
 */
export const createStatsSocket = function (): void {
  const client: Client = this;
  if (!client.statsSocket && client.callstatskey) {
    client.statsSocket = new StatsSocket();
    client.statsSocket.connect();
  }
};

export const destroyStatsSocket = function (): void {
  const client: Client = this;
  if (client.statsSocket) {
    client.statsSocket.disconnect();
    client.statsSocket = null;
  }
};

/**
 * Logs stats while sending to callstats.io
 * @param {Any} stats - callstats.io stats
 */
let csStatsCallback: any = (stats: any): void => {
  const { streams } = stats;
  // eslint-disable-next-line @typescript-eslint/dot-notation
  if (window['_PlivoDevLogging']) {
    Plivo.log.info(streams);
  }
};

/**
 * Triggered when callstats.io is initialized.
 * @param {Error} err - initialization error
 * @param {String} msg - success or failure message
 */
const csInitCallback = (err: Error, msg: string): void => {
  Plivo.log.debug(`Stats Initializing Status: err= ${err} msg= ${msg}`);
};

/**
 * Initialize callstats.io.
 */
export const initCallStatsIO = function (): void {
  const client: Client = this;
  if (client.options.enableTracking && !client.callStats) {
    if (client.options.appSecret != null || client.options.appId != null) {
      client.statsioused = true;
    } else {
      client.statsioused = false;
    }
    // Temp fix for chrome 58 to get callback based getstats
    (window as any).csioChromeLegacyGetStats = true;
    const configParams = {
      disableBeforeUnloadHandler: false, // disables callstats.js's window.onbeforeunload parameter.
      applicationVersion: 'PLIVO_LIB_VERSION', // Application version specified by the developer.
      disablePrecalltest: true,
    };
    // callstats initialize
    if (getBrowserDetails().browser !== 'chrome') csStatsCallback = null; // still some issues in FF so don't go for getstats call back
    // if appSecret is passed in option use it. Useful if customer has their own callstats account
    // Or try to get token for appId
    if (client.options.appId) {
      client.callStats = typeof (window as any).callstats === 'undefined'
        // eslint-disable-next-line global-require
        ? require('./callstatsio.js')
        // eslint-disable-next-line new-cap
        : new (window as any).callstats();
      const callStatsToken = client.options.appSecret;
      client.callStats.initialize(
        client.options.appId,
        callStatsToken,
        client.userName,
        csInitCallback,
        csStatsCallback,
        configParams,
      );
    }
    Plivo.log.debug('enableTracking initialized');
  }
};

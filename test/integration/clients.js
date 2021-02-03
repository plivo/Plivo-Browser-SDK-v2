import { Client } from '../../lib/client';

const options = {
  debug: 'ALL',
  permOnClick: true,
  codecs: ['OPUS', 'PCMU'],
  enableIPV6: false,
  audioConstraints: { optional: [{ googAutoGainControl: false }] },
  dscp: true,
  enableTracking: true,
  dialType: 'conference',
};

class CustomClient {
  constructor(client_options) {
    this.client = new Client(client_options);
  }
}

export const Client1 = new CustomClient(options).client;
export const Client2 = new CustomClient(options).client;

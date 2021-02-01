/* eslint-disable*/
'use strict';
import { Client, ConfiguationOptions } from './client';
import { Logger } from './logger';

class Plivo {
  client: Client;
  constructor(options: ConfiguationOptions) {
    // Check for existing instance of Plivo object
    if (typeof window['_PlivoInstance' as any] === 'object') {
      Logger.info('window.Plivo object and its instance already exist');
      this.client = (window as any)._PlivoInstance
    }else {
      this.client = new Client(options);
    }
  }

}
Object.defineProperty(Plivo, 'client', { enumerable: true });

export default Plivo;

module.exports = Plivo;

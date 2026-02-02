/**
 * InterTabChannel - Handles BroadcastChannel communication between tabs
 * with localStorage fallback for older browsers
 */

import { Logger } from '../../logger';
import { TabMessage, TabMessageType, DEFAULT_MULTI_TAB_CONFIG } from './types';

const Plivo = { log: Logger };

type MessageHandler = (message: TabMessage) => void;

/**
 * InterTabChannel class for cross-tab communication
 */
export class InterTabChannel {
  private channel: BroadcastChannel | null = null;
  private channelName: string;
  private tabId: string;
  private messageHandlers: Map<TabMessageType, MessageHandler[]> = new Map();
  private globalHandlers: MessageHandler[] = [];
  private useLocalStorage: boolean = false;
  private localStorageKey: string;
  private storageEventHandler: ((event: StorageEvent) => void) | null = null;

  constructor(channelName: string = DEFAULT_MULTI_TAB_CONFIG.channelName) {
    this.channelName = channelName;
    this.tabId = this.generateTabId();
    this.localStorageKey = `${channelName}-message`;

    this.initChannel();
  }

  /**
   * Generate a unique tab ID
   */
  private generateTabId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `tab-${timestamp}-${random}`;
  }

  /**
   * Initialize the communication channel
   */
  private initChannel(): void {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event: MessageEvent) => {
          this.handleMessage(event.data);
        };
        this.channel.onmessageerror = (event: MessageEvent) => {
          Plivo.log.error('MULTI_TAB | BroadcastChannel message error:', event);
        };
        Plivo.log.debug(`MULTI_TAB | BroadcastChannel initialized with name: ${this.channelName}`);
      } catch (error) {
        Plivo.log.warn('MULTI_TAB | Failed to create BroadcastChannel, falling back to localStorage');
        this.useLocalStorage = true;
        this.initLocalStorageFallback();
      }
    } else {
      Plivo.log.warn('MULTI_TAB | BroadcastChannel not supported, using localStorage fallback');
      this.useLocalStorage = true;
      this.initLocalStorageFallback();
    }
  }

  /**
   * Initialize localStorage fallback for older browsers
   */
  private initLocalStorageFallback(): void {
    this.storageEventHandler = (event: StorageEvent) => {
      if (event.key === this.localStorageKey && event.newValue) {
        try {
          const message = JSON.parse(event.newValue) as TabMessage;
          // Don't process our own messages
          if (message.tabId !== this.tabId) {
            this.handleMessage(message);
          }
        } catch (error) {
          Plivo.log.error('MULTI_TAB | Failed to parse localStorage message:', error);
        }
      }
    };
    window.addEventListener('storage', this.storageEventHandler);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: TabMessage): void {
    // Don't process our own messages
    if (message.tabId === this.tabId) {
      return;
    }

    Plivo.log.debug(`MULTI_TAB | Received message: ${message.type} from ${message.tabId}`);

    // Call global handlers
    this.globalHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        Plivo.log.error('MULTI_TAB | Error in global message handler:', error);
      }
    });

    // Call type-specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          Plivo.log.error(`MULTI_TAB | Error in handler for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Post a message to all other tabs
   */
  public postMessage(type: TabMessageType, payload?: any): void {
    const message: TabMessage = {
      type,
      tabId: this.tabId,
      timestamp: Date.now(),
      payload,
    };

    Plivo.log.debug(`MULTI_TAB | Posting message: ${type}`);

    if (this.useLocalStorage) {
      try {
        // For localStorage, we need to change the value to trigger storage event
        localStorage.setItem(this.localStorageKey, JSON.stringify(message));
        // Clear it immediately to allow same message to be sent again
        setTimeout(() => {
          localStorage.removeItem(this.localStorageKey);
        }, 100);
      } catch (error) {
        Plivo.log.error('MULTI_TAB | Failed to post message via localStorage:', error);
      }
    } else if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        Plivo.log.error('MULTI_TAB | Failed to post message via BroadcastChannel:', error);
      }
    }
  }

  /**
   * Subscribe to a specific message type
   */
  public on(type: TabMessageType, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Subscribe to all messages
   */
  public onAny(handler: MessageHandler): void {
    this.globalHandlers.push(handler);
  }

  /**
   * Unsubscribe from a specific message type
   */
  public off(type: TabMessageType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Unsubscribe from all messages
   */
  public offAny(handler: MessageHandler): void {
    const index = this.globalHandlers.indexOf(handler);
    if (index !== -1) {
      this.globalHandlers.splice(index, 1);
    }
  }

  /**
   * Remove all handlers for a specific message type
   */
  public removeAllListeners(type?: TabMessageType): void {
    if (type) {
      this.messageHandlers.delete(type);
    } else {
      this.messageHandlers.clear();
      this.globalHandlers = [];
    }
  }

  /**
   * Get the current tab's ID
   */
  public getTabId(): string {
    return this.tabId;
  }

  /**
   * Get the tab priority (based on creation time - lower timestamp = higher priority)
   */
  public getTabPriority(): number {
    // Extract timestamp from tabId (format: tab-{timestamp}-{random})
    const parts = this.tabId.split('-');
    if (parts.length >= 2) {
      return parseInt(parts[1], 10);
    }
    return Date.now();
  }

  /**
   * Check if BroadcastChannel is being used
   */
  public isUsingBroadcastChannel(): boolean {
    return !this.useLocalStorage;
  }

  /**
   * Close the channel and cleanup
   */
  public close(): void {
    Plivo.log.debug('MULTI_TAB | Closing InterTabChannel');

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (this.storageEventHandler) {
      window.removeEventListener('storage', this.storageEventHandler);
      this.storageEventHandler = null;
    }

    this.messageHandlers.clear();
    this.globalHandlers = [];
  }
}

export default InterTabChannel;

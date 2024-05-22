/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-cycle
import { Client } from "../client";

// eslint-disable-next-line import/prefer-default-export
export class LoggerUtil {
  private static instance: LoggerUtil;

  private sipCallID: string = "";

  private userName: string = "";

  private client: Client;

  constructor(client: Client) {
    this.client = client;
    LoggerUtil.instance = this;
  }

  static getInstance(): LoggerUtil | null {
    return this.instance || null;
  }

  getSipCallID(): string {
    if (this.sipCallID) {
      return this.sipCallID;
    }
    if (this.client._currentSession) {
      this.sipCallID = this.client._currentSession.sipCallID ?? "";
      return this.sipCallID;
    }
    return "";
  }

  setSipCallID(value: string): void {
    this.sipCallID = value;
  }

  getUserName(): string {
    return this.userName;
  }

  setUserName(value: string): void {
    this.userName = value;
  }
}

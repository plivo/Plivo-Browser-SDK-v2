export default class Storage {
  protected static instance: Storage | null = null;

  protected TAG: string = "PlivoLogStorage";

  public static getInstance(): Storage {
    if (!this.instance) {
      this.instance = new Storage();
    }
    return this.instance;
  }

  public setData(data: string, arg1: string, arg2: string) {
    const oldLog = this.getData();
    const newLog = `${data}  ${arg1}  ${arg2}`;
    const log = (oldLog) ? `${JSON.parse(oldLog)}\n${newLog}` : newLog;
    const finalLog = JSON.stringify(log);
    window.localStorage.setItem(this.TAG, finalLog);
  }

  getData = (): any => {
    const value = window.localStorage.getItem(this.TAG) ?? '';
    return value;
  };

  clear = (): any => window.localStorage.removeItem(this.TAG);
}

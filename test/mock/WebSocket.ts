class WebSocket {
  public url: string;

  public readyState: number;

  public OPEN: number;

  public CLOSE: number;

  public message: string;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1;
    this.OPEN = 1;
    this.CLOSE = 0;
    this.message = '';
  }

  public onopen() { }

  public onclose(event: object) { }

  public onmessage() { }

  public onerror() { }

  public close() {
    this.readyState = 0;
    const event = {
      wasClean: false,
    };
    this.onclose(event);
  }

  public send = (obj) => {
    this.message = JSON.parse(obj);
  };
}

export default WebSocket;

import RTCStatsReport from './RTCStatsReport';
import chromePayload from '../payloads/rtcStatsResponse-chrome.json';
import ffSafariPayload from '../payloads/rtcStatsResponse-ff-safari.json';

class RTCStatsResponse {
  private data: any[];

  constructor(data: any[]) {
    this.data = data;
  }

  public result = () => this.data;

  public values = () => this.data;
}

export const getChromeStatsResponse = () => new RTCStatsResponse(chromePayload);

export const getFirefoxSafariStatsResponse = () => new RTCStatsResponse(ffSafariPayload);

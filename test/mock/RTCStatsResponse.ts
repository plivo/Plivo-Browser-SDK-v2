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

export const getChromeStatsResponse = () => {
  const res = [];
  chromePayload.forEach((stat) => {
    res.push(new RTCStatsReport(stat) as never);
  });
  return new RTCStatsResponse(res);
};

export const getFirefoxSafariStatsResponse = () => new RTCStatsResponse(ffSafariPayload);

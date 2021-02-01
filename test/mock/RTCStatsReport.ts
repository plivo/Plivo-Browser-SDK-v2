interface StatsData{
  id: string,
  timestamp: string,
  type: string,
  stats: object
}

class RTCStatsReport {
  public type: string;

  private data: StatsData;

  constructor(data: StatsData) {
    this.data = data;
    this.type = data.type;
  }

  public names = () => Object.keys(this.data.stats);

  public stat = (key: string) => this.data.stats[key] || '';
}

export default RTCStatsReport;

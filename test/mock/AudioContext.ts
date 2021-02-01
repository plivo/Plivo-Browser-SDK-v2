let analyserData: number[] = [];

class AudioContext {
  constructor() {
    console.log('creating audio context');
  }

  public createAnalyser = () => {
    console.log('analyser created');
    return {
      frequencyBinCount: 5,
      getFloatFrequencyData(data: number[]) {
        for (let i = 0; i < analyserData.length; i++) {
          data[i] = analyserData[i];
        }
      },
      getByteFrequencyData(data: number[]) {
        for (let i = 0; i < analyserData.length; i++) {
          data[i] = analyserData[i];
        }
      },
      disconnect() {
        console.log('analyser disconnected');
      },
    };
  };

  public createMediaStreamSource = () => {
    console.log('media stream source created');
    return {
      connect() {},
      disconnect() {
        console.log('media stream source disconnected');
      },
    };
  };

  public close = () => {
    console.log('audio context closed');
  };

  public createGain = () => ({
    connect() {},
  });

  public suspend = () => {
    console.log('audio context suspended');
  };
}

const setAnalyserData = (data: number[]) => {
  analyserData = [...data];
};

export {
  AudioContext,
  setAnalyserData,
};

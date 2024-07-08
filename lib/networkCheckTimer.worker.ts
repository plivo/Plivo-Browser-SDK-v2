// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
let networkCheckTimer: any;

function startTimer(interval: number) {
  if (networkCheckTimer) {
    clearInterval(networkCheckTimer);
    networkCheckTimer = null;
  }
  networkCheckTimer = setInterval(() => {
    ctx.postMessage({
      event: 'timerExecuted',
    });
  }, interval);

  ctx.postMessage({
    event: 'timerStarted',
  });
}

function stoptimer() {
  if (networkCheckTimer) {
    clearInterval(networkCheckTimer);
    networkCheckTimer = null;
    ctx.postMessage({ event: 'timerStopped' });
  }
}

ctx.addEventListener("message", (msg) => {
  if (msg && msg.data && msg.data.event === 'startTimer') {
    startTimer(msg.data.networkCheckInterval);
  } else if (msg && msg.data && msg.data.event === 'stopTimer') {
    stoptimer();
  } else {
    ctx.postMessage({
      event: 'initSuccess',
    });
  }
});

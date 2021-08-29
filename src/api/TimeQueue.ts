import { delay } from '../common/utils';

export default class TimeQueue {
  private queueList: { runTime: number, fn: Function, params: any[], id: number }[]
  private static DEFAULT_CHECK_TIME = 1000;
  private checkTime: number;
  private id: number = 0;
  constructor(options?: { checkTime: number }) {
    let { checkTime = TimeQueue.DEFAULT_CHECK_TIME } = options || {};
    this.queueList = [];
    if (checkTime < 0) {
      checkTime = TimeQueue.DEFAULT_CHECK_TIME;
    }
    this.checkTime = checkTime;
    this.start();
  }
  push(data: any, options: { delay?: number, params?: any[] } = {}) {
    let { delay = 0, params = [] } = options;
    if (delay < 0) {
      delay = 0;
    }
    const runTime = Date.now() + delay;
    const id = this.id++;
    if (data instanceof Function) {
      this.queueList.push({ runTime, fn: data, params, id });
    } else {
      this.queueList.push({ runTime, fn: () => Promise.resolve(data), params, id });
    }
    this.queueList.sort((a, b) => a.runTime > b.runTime ? 1 : -1);
    return id;
  }
  remove(id: number) {
    const index = this.queueList.findIndex(v => v.id === id);
    this.queueList.splice(index, 1);
  }
  private async start() {
    await delay(this.checkTime);
    const nowTime = Date.now();
    for (let i = 0, len = this.queueList.length; i < len; i++) {
      const { runTime, fn, params } = this.queueList[i];
      if (runTime <= nowTime) {
        this.queueList.splice(i, 1);
        fn(...params);
      } else {
        break;
      }
    }
    this.start();
  }
}
import { Response } from 'express';
import { getKey, getCurrentData } from '../common/common';
import emitter from '../common/eventEmitter';
import ConfigDataForClient from '../schema/configForClient';
import { portResult } from '../common/utils';
import TimeQueue from './TimeQueue';

interface Cache {
  id: string,
  res: Response,
  key: string,
  callback?: (...args: any[]) => void,
}

export default class WaitToResponse {
  private static queue: TimeQueue = new TimeQueue();
  protected constructor() { }
  static push(cache: Cache | null, delay: number = 1000) {
    const { key } = cache || {};
    let listenKey: string | null = key ? getKey(key) : null;
    let id: number | null;
    const callback = () => {
      if (id) {
        WaitToResponse.queue.remove(id);
        id = null;
      }
      if (listenKey) {
        emitter.removeListener(listenKey, callback);
        listenKey = null;
      }
      if (cache) {
        WaitToResponse.eventCallback(cache);
        cache = null;
      }
    };
    id = WaitToResponse.queue.push(
      WaitToResponse.eventCallback, { delay, params: [{ callback, ...cache }] }
    );
    if (listenKey) {
      emitter.on(listenKey, callback);
    }
  }
  private static async eventCallback(cache: Cache | null) {
    if (!cache) {
      return;
    }
    const { id, res, key, callback } = cache;
    const listenKey = getKey(key);
    if (callback) {
      emitter.removeListener(listenKey, callback);
    }
    const { json } = await getCurrentData({ params: { key } });
    ConfigDataForClient.findOneAndUpdate({ id, createdAt: Date.now() }).then(() => {
      res.json(portResult.success('', { id, json }));
    }).catch(error => {
      console.log(error);
    });
  }
}

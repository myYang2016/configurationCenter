import express from 'express';
import { checkDataType, portResult } from '../common/utils';
import ConfigDataForClient from '../schema/configForClient';
import ConfigDataForServer from '../schema/configForServer';
import emitter from '../common/eventEmitter';
import { getKey, getCurrentData } from '../common/common';
import WaitToResponse from './WaitToResponse';

const router = express.Router();
const uuid = require('uuid');

router.post('/listenData', async (req, res) => {
  const data = req.body;
  const checkResult = checkDataType(data, [
    ['id', 'string', false],
    ['key', 'string'],
  ]);
  if (checkResult.status === 'fail') {
    res.json(checkResult);
    return;
  }
  let { key, id } = data as { id?: string, key: string };
  const insertNewData = (json: string) => {
    id = uuid.v1();
    ConfigDataForClient.create({ id, key }).then(() => {
      res.json(portResult.success('', { id, json }));
    }).catch(error => {
      res.json(portResult.error('', { error }));
    });
  };
  ConfigDataForServer.find({}).then(console.log);
  const currentData = await getCurrentData({ params: { key } });
  if (id) {
    const historyData: any = await getCurrentData({ type: 'client', params: { id } });
    if (historyData) {
      await ConfigDataForClient.findOneAndUpdate({ id, createdAt: Date.now() });
      if (currentData.createdAt > historyData.createdAt) {
        res.json(portResult.success('', { id, json: currentData.json }));
      } else {
        WaitToResponse.push({ id, res, key }, 60000);
      }
    } else {
      insertNewData(currentData.json);
    }
  } else {
    insertNewData(currentData.json);
  }
});

router.post('/updateData', async (req, res) => {
  const data = req.body;
  const checkResult = checkDataType(data, [
    ['key', 'string'],
    ['json', 'string'],
  ]);
  if (checkResult.status === 'fail') {
    res.json(checkResult);
    return;
  }
  const { key, json } = data as { key: string, json: string };
  const setData = { key, json, createdAt: Date.now() };
  const currentData: any = await ConfigDataForServer.find({ key });
  if (currentData && currentData.length && currentData[0].json === json) {
    res.json(portResult.success('', currentData));
    return;
  }
  try {
    let result = await ConfigDataForServer.findOneAndUpdate(setData);
    ConfigDataForServer.find({}).then(console.log);
    if (!result) {
      result = await ConfigDataForServer.create(setData);
    }
    emitter.emit(getKey(key), json);
    res.json(portResult.success('', result));
  } catch (error) {
    res.json(portResult.error('', { error }));
  }
});

router.post('/deleteData', (req, res) => {
  const data = req.body;
  const checkResult = checkDataType(data, [
    ['key', 'string'],
  ]);
  if (checkResult.status === 'fail') {
    res.json(checkResult);
    return;
  }
  const { key } = data as { key: string };
  ConfigDataForServer.remove({ key }).then((result) => {
    res.json(portResult.success('', result));
  }).catch(error => {
    res.json(portResult.error('', { error }));
  });
});

export default router;

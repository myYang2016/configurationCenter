import express from 'express';
import { checkDataType, portResult } from '../common/utils';
import ConfigDataForClient from '../schema/configForClient';
import ConfigDataForServer from '../schema/configForServer';
import emitter from '../common/eventEmitter';

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
  const currentData: any = await ConfigDataForServer.find({ key });
  const currentJson = (currentData && currentData.length && currentData[0].json) || '';
  if (id) {
    const historyData: any = await ConfigDataForClient.find({ id });
    if (historyData && historyData.length) {
      const historyJson = historyData[0].json;
      if (currentJson !== historyJson) {
        await ConfigDataForClient.findOneAndUpdate({ 
          id, json: currentJson, createdAt: Date.now() 
        });
        res.json(portResult.success('', { id, json: currentJson }));
      } else {
        const listenKey = `config_polling_${key}`;
        let timeout: any;
        const eventCallback = (json: string) => {
          clearTimeout(timeout);
          emitter.removeListener(listenKey, eventCallback);
          ConfigDataForClient.findOneAndUpdate({ id, json, createdAt: Date.now() });
          res.json(portResult.success('', { id, json }));
        };
        timeout = setTimeout(() => {
          eventCallback(currentJson);
        }, 60000);
        emitter.on(listenKey, eventCallback);
        await ConfigDataForClient.findOneAndUpdate({ 
          id, json: historyJson, createdAt: Date.now() 
        });
      }
    } else {
      insertNewData(currentJson);
    }
  } else {
    insertNewData(currentJson);
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
    if (!result) {
      result = await ConfigDataForServer.create(setData);
    }
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

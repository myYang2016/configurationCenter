import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import config from './config';
import { logger } from './common/logger';
const mutipart = require('connect-multiparty');

import polling from './api/polling';

//连接数据库
const { mongodbConfig, serverPort } = config;
mongoose.connect(mongodbConfig.url, mongodbConfig.options);
mongoose.connection.on('error', console.log.bind(console, 'connection error:'));

const app = express();

app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(mutipart({ uploadDir: '/tmp' }));

app.use('/api', polling);
app.use('/', express.static(path.resolve(__dirname, 'page')));

const server = app.listen(serverPort, () => {
  console.log(`server start on http://localhost:${serverPort}`);
});

server.timeout = 0;
server.keepAliveTimeout = 5000;


process.on('uncaughtException', function (err: Error, origin: string) {
  logger.info({
    type: 'uncaughtException',
    err,
    message: err.message,
    name: err.name,
    origin,
    errorMessage: err?.stack
  });
});

process.on('unhandledRejection', reason => {
  logger.error({ type: 'unhandledRejection', reason });
});
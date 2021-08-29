import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
const mutipart = require('connect-multiparty');

import polling from './api/polling';

//连接数据库
const dbPort = process.env.NODE_ENV === 'development' ? 27017 : 21018;
mongoose.connect(
  `mongodb://localhost:${dbPort}/blog`,
  { useNewUrlParser: true }
);
mongoose.connection.on('error', console.log.bind(console, 'connection error:'));

const app = express();

app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(mutipart({ uploadDir: '/tmp' }));

app.use('/api', polling);
app.use('/', express.static(path.resolve(__dirname, 'page')));

const port = 9000;
const server = app.listen(port, () => {
  console.log(`server start on http://localhost:${port}`);
});

server.timeout = 0;
server.keepAliveTimeout = 5000;

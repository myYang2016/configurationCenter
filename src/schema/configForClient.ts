import mongoose from 'mongoose';
import { commonSetting } from './common';

const Schema = mongoose.Schema;

const db = mongoose.model('configForClient', new Schema(Object.assign({
  id: { type: String, default: '' },
}, commonSetting)));

db.collection.createIndex({ id: 1 });
db.collection.createIndex({ key: 1 });
db.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 120 });

export default db;
import mongoose from 'mongoose';
import { commonSetting } from './common';

const Schema = mongoose.Schema;

const db = mongoose.model('configForServer', new Schema({ 
  json: { type: String, default: '' }, ...commonSetting 
}));

db.collection.createIndex({ key: 1 });
db.collection.createIndex({ createdAt: 1 });

export default db;
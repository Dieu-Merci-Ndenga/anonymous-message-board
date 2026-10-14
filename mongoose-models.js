'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
  text: String,
  delete_password: String,
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
});

const ThreadSchema = new Schema({
  text: String,
  delete_password: String,
  reported: { type: Boolean, default: false },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  replies: { type: [ReplySchema], default: [] },
});

const BoardSchema = new Schema({
  name: { type: String, required: true, unique: true },
  threads: { type: [ThreadSchema], default: [] },
});

module.exports = {
  Reply: mongoose.model('Reply', ReplySchema),
  Thread: mongoose.model('Thread', ThreadSchema),
  Board: mongoose.model('Board', BoardSchema),
};
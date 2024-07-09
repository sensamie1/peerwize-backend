const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
    ref: "User",
  },
  }, { timestamps: true }
);

const BlacklistModel = mongoose.model('blacklist', BlacklistSchema);

module.exports = BlacklistModel;

'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const dbName = 'AMB-DB';
const db = mongoose.connection;

if (process.env.DB) {
  mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  db.once('open', () => {
    console.log(`Connected to Database ${dbName}`);
  });
}

db.on('error', (err) => {
  console.error(err);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log(`Closing connection to ${dbName}`);
    process.exit(0);
  });
});

module.exports = db;
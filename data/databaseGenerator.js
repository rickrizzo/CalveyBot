'use strict';

var path = require('path');
var sqlite3 = require('sqlite3').verbose();

var outputFile = process.argv[2] || path.resolve(__dirname, 'calveybot.db');
var db = new sqlite3.Database(outputFile);

// Preps Database
db.serialize();

// Creates DB Structure
db.run('CREATE TABLE IF NOT EXISTS info (name TEXT PRIMARY KEY, val TEXT DEFAULT NULL)');
db.run('CREATE TABLE IF NOT EXISTS wisdoms (id INTEGER PRIMARY KEY, wisdom TEXT, used INTEGER DEFAULT 0)');
db.run('CREATE INDEX IF NOT EXISTS wisdoms_used_idx ON wisdoms (used)');

// Inset Wisdoms
db.run('INSERT INTO wisdoms (wisdom) VALUES (?)', "WHAT WOULD JESUS DO?", function (err) {
  if (err) {
    console.log("INSERT ERROR!");
    return null;
  }
  return null;
});

db.close();
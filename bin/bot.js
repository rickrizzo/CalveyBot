'use strict';

var CalveyBot = require('../lib/calveybot.js');

var token = process.env.BOT_API_KEY || require('../token');
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME || 'test';

var calveybot = new CalveyBot({
  token: token,
  dbPath: dbPath,
  name: name
});

calveybot.run();
'use strict';

// Imports
var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

// Bot Constructor
var CalveyBot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'calveybot';
  this.dbPath = settings.dbPath || path.resolve(__dirname, '..', 'data', 'calveybot.db');

  this.user = null;
  this.db = null;
};
util.inherits(CalveyBot, Bot);

// Initialize Bot
CalveyBot.prototype.run = function () {
  CalveyBot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);

  console.log("Calveybot running...");
};

// Start Bot
CalveyBot.prototype._onStart = function () {
  this._loadBotUser();
  this._connectDb();
  this._firstRunCheck();
};

// Identify Users
CalveyBot.prototype._loadBotUser = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name = self.name;
  })[0];
};

// Connect to Database
CalveyBot.prototype._connectDb = function () {
  if (!fs.existsSync(this.dbPath)) {
    console.error('Database path ' + '"' + this.dbPath + '" does not exist or it\'s not readable.');
    process.exit(1);
  }
  this.db = new SQLite.Database(this.dbPath);
};

// Check First Run
CalveyBot.prototype._firstRunCheck = function () {
  var self = this;
  self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
    // Errors
    if (err) {
      return console.error('DATABASE ERROR: ', err);
    }

    var currentTime = (new Date()).toJSON();

    // First Run
    if (!record) {
      console.log("FIRST RUN");
      self._welcomeMessage();
      return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
    }

    // Update Last Run
    self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);

  });
};

// Respond to message
CalveyBot.prototype._onMessage = function (message) {
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) &&
    !this._isFromCalveyBot(message) &&
    this._isMentioningRobCalvey(message)
  ) {
    console.log("SENDING MESSAGE");
    this._replyWithWisdom(message);
  }
};

// Identify Message Type
CalveyBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};
CalveyBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' && message.channel[0] == 'C';
};
CalveyBot.prototype._isFromCalveyBot = function (message) {
  return message.user === this.user.id;
};
CalveyBot.prototype._isMentioningRobCalvey = function (message) {
  return message.text.toLowerCase().indexOf('rob calvey') > -1 ||
  message.text.toLowerCase().indexOf(this.name) > -1;
};

// Get Channel ID
CalveyBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

// Welcome Message
CalveyBot.prototype._welcomeMessage = function () {
  console.log("JOINED");
  this.postMessageToChannel(this.channels[0].name, 'Howdy DFA-ers! Say `Rob Calvey` or ' + this.name + ' to summon my wisdom',
    {as_user: true});
};

// Wisdom
CalveyBot.prototype._replyWithWisdom = function (originalMessage) {
  var self = this;
  self.db.get('SELECT id, wisdom FROM wisdoms ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
    if (err) {
      return console.error('DATABASE ERROR: ', err);
    }

    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(channel.name, 'How-didly-do DFA-ers!', {as_user: true});
    self.db.run('UPDATE wisdoms SET used = used + 1 WHERE ID = ?', record.id);
  });
};

// Export
module.exports = CalveyBot;
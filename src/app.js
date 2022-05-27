const { Client, Intents } = require("discord.js");
const {
  token,
  mongoUriTimeouts,
  mongoUriVC,
  prefix,
  assistantsLicense
} = require("../data/config.json");
const { port, clientId, clientSecret, superSecret } = require("../data/serverConfig.json");
const { Handler } = require("discord-slash-command-handler");
const express = require("express");
const path = require("path");
const logger = require("./customModules/logger");
const mongoose = require("mongoose");
const passport = require('passport');
const passportDiscord = require('passport-discord');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')
const cookieParser = require('cookie-parser')

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
  // ws: { properties: { $browser: "Discord iOS" } }
});

const app = express();
const vcURI = mongoUriVC;

client.once("ready", () => {
  logger.bot(`${client.user.tag} Successfully Connected to Discord`);

  const handler = new Handler(client, {
    commandFolder: "/commands",
    commandType: "file" || "folder",
    eventFolder: "/events",
    mongoURI: mongoUriTimeouts,
    slashGuilds: [
      "964238274581393418",
      "977187479109107732",
      "955445111527964722",
    ],
    allSlash: true,
    owners: ["942554411199266826", "701561771529470074"],
    handleSlash: true,
    handleNormal: true,
    prefix,
    timeout: true,
    permissionReply:
      "Error - You do not have the correct permission level. Contact the server owner or admin if this is a mistake.",
    timeoutMessage: "Error - You are on a cooldown.",
    errorReply: "Error - An unknown error occurred.",
    notOwnerReply: "Error - You do not have owner privileges.",
  });

  mongoose.connect(vcURI, {
    useNewURLParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
    keepAlive: true,
  })
    .then(() => {
      logger.mongo("VC Database Connected");
    }).catch((err) => {
    console.log(err)
  });
});

// client.user.setActivity('the voice channels', { type: "WATCHING" })
// client.vcdb = connection;

client.login(token);

app.use(cookieParser())
app.use(express.static('public'));
app.use('/api/discord', require('./server/oauth/discord.js'))
app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});

// app.get('/', (req, res) => {
//   res.status(200).sendFile(__dirname + '/server/oauth/index.html')
// })

app.get('/dashboard/app.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/server/dashboard/app.js'));
});

app.get('/', (req, res) => {
  res.status(200).sendFile(__dirname + '/server/dashboard/index.html')
})

app.listen(port, () => {
  logger.oauth(`Running On Port ${port}`)
})

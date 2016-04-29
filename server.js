'use strict';

const https = require('https');
const fs = require('fs');

const bodyParser = require('body-parser');
const express = require('express');
const Pusher = require('pusher');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: '181753',
  key: '71d7257356f3239c0f33',
  secret: '2b6dc0aee844fca977a2',
  cluster: 'eu',
  encrypted: true
});

app.post('/message', (req, res) => {
  pusher.trigger(req.body.channel, 'message', req.body.message, req.body.socketId);
  res.sendStatus(200);
});

const credentials = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

const server = https.createServer(credentials, app);
server.listen(3000)

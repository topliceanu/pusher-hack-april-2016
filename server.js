'use strict';

const https = require('https');
const fs = require('fs');

const express = require('express');

const app = express();
app.use(express.static('public'));

const credentials = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

const server = https.createServer(credentials, app);
server.listen(3000)

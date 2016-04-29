const http = require('http');

const express = require('express');

const app = express()
app.use(express.static('public'));

const server = http.createServer(app);
server.listen(process.env.PORT);

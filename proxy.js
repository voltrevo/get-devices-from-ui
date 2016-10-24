'use strict';

const fs = require('fs');

const httpProxy = require('http-proxy');

httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 8080,
  },
  ssl: {
    key: fs.readFileSync(`${process.env.HOME}/.localhost-ssl/host.key`, 'utf8'),
    cert: fs.readFileSync(`${process.env.HOME}/.localhost-ssl/host.crt`, 'utf8'),
  },
}).listen(8889);

const WebSocket = require('ws');
const express = require('express');
const router = express.Router();

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    // Initial message on connection
    // ws.send('Connection established');
  });

  function sendData(event, data) {
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ event: event, data: data }));
    });
  }

  return { wss, sendData };
};

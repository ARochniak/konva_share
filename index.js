const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 5000 });

const connections = [];

const coords = {
  x: 100,
  y: 100
}

wss.on('connection', (ws) => {
  connections.push(ws);

  ws.on('message', (message) => {
    const object = JSON.parse(message);
    if (object.type === 'mouse') {
      connections.forEach((con) => {
        if (con === ws) return;
        con.send(JSON.stringify({type: 'mouse', coords: object.coords }))
      })
    }
    if (object.type === 'shape') {
      const { x, y } = object.coords;
      coords.x = x;
      coords.y = y;
      connections.forEach((con) => {
        if (con === ws) return;
        con.send(JSON.stringify({type: 'shape', coords: object.coords}))
      })
    }

  });
  const initialMessage = { type: 'initiate', coords };
  ws.send(JSON.stringify(initialMessage));
});

const server = http.createServer((req, res) => {
  let fileName = req.url === '/' ? 'index.html' : req.url;
  fs.readFile(path.join(__dirname, fileName), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
})

server.listen(8080);
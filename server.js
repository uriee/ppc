const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sio = require('socket.io');
const favicon = require('serve-favicon');
const compression = require('compression');

const app = express(),
  options = { 
    key: fs.readFileSync(__dirname + '/rtc-video-room-key.pem'),
    cert: fs.readFileSync(__dirname + '/rtc-video-room-cert.pem')
  },
  port = process.env.PORT || 3000,
  server = process.env.NODE_ENV === 'production' ?
    http.createServer(app).listen(port) :
    https.createServer(options, app).listen(port),
  io = sio(server);
// compress all requests
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.sendFile(__dirname + '/dist/index.html'));
app.use(favicon('./dist/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');
io.sockets.on('connection', socket => {
  console.log("connection")
  let room = '';
  let broadcaster_id = '';
  let viewr_id = ''
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => {
    console.log("messgae",message)
    socket.broadcast.to(room).emit('message', message)
  });
  socket.on('find', () => {
    console.log("find")
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    const sr = io.sockets.adapter.rooms[room];
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
      broadcaster_id = socket.id;
    } else if (sr.length === 1) {
      socket.emit('join');
      viewr_id = socket.id;
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('addr_v', data => {
    console.log("addr_v",data)
    //data.sid = socket.sid;
    let ret = {addr_v : data , sid: socket.id}
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('addr_v', ret);
  });

  socket.on('addr_b', data => {
    
    let {addr_b , sid} = data
    console.log("addr_b",addr_b,sid,data)
    data.bsid = socket.id;

    // sending to all clients in the room (channel) except sender
    io.to(sid).emit('addr_b',data)
    ///socket.broadcast.to(room).emit('addr_b', data);
  });
    
  
  socket.on('auth', data => {
    console.log("auth",data)
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('approve', data);
  });

  socket.on('accept', id => {
    console.log("accept",id)
    io.sockets.connected[id].join(room);
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge');
  });

  socket.on('reject', () => {
    console.log("reject")
    socket.emit('full')
  });
  
  socket.on('leave', () => {
    console.log("leave")
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup');
    if (socket.id == broadcaster_id) {
      viewr_id && io.sockets.connected[viewr_id].leave(room);
      console.log("VIEWR_ID_1",viewr_id);
    }else {
      socket.leave(room);
    }
    
  });

  socket.on('end', () => {
    console.log("end")
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup');
    viewr_id &&  io.sockets.connected[viewr_id].leave(room);
    console.log("VIEWR_ID_2",viewr_id);
    socket.leave(room);
  });

});




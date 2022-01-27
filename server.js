const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { Server }= require('socket.io');
const favicon = require('serve-favicon');
const compression = require('compression');

const { createAdapter } = require("@socket.io/redis-adapter")
const { createClient } = require("redis")

const app = express(),
  options = { 
    key: fs.readFileSync(__dirname + '/rtc-video-room-key.pem'),
    cert: fs.readFileSync(__dirname + '/rtc-video-room-cert.pem')
  },
port = process.env.PORT || 3000,
server = process.env.NODE_ENV === 'production' ?
  http.createServer(app).listen(port) :
  https.createServer(options, app).listen(port)
  
const io = new Server(server, { /* options */ });
//const pubClient = createClient({ url: "redis://localhost:6379" });
//const subClient = pubClient.duplicate();
//io.adapter(createAdapter(pubClient, subClient));


// compress all requests
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.sendFile(__dirname + '/dist/index.html'));
app.use(favicon('./dist/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');
io.on('connection', socket => {
  console.log("connection")
  let room = '';
  let broadcaster_id = '';
  let viewr_id = ''
  let fee = 0;
  let payment = 0;
  let interval = 0;

  socket.on('disconnect', function () {
    try {
      socket.broadcast.to(room).emit('disconnect');
    }catch(e){
      console.log("HEYYYYY WAIT WHER ARE YOU GOING?")
    }
  });

  // sending to all clients in the room (channel) except sender
  socket.on('message', message => {
    console.log("messgae",message)
    socket.broadcast.to(room).emit('message', message)
  });
  socket.on('find', async (stateObj) => {
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    const rooms = io.of("/").adapter.rooms;
    const sr = rooms.get(room,viewr_id)
    console.log("find",room,sr,sr && sr.size)

    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create',{id: socket.id});
      broadcaster_id = socket.id;
      fee = stateObj.fee;
      interval = stateObj.interval;
    } else if (sr.size === 1 && viewr_id == '') {
      socket.emit('join',{fee,interval,sid: broadcaster_id});
      console.log("pppp",fee,interval,broadcaster_id)
      viewr_id = socket.id;
      payment = stateObj.payment
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('addr_v', async data => {
    console.log("addr_v",data,)
   

    const Rooms = io.of("/").adapter.rooms;
    const Room = Array.from(Rooms.get(data.roomID)) || 0
    const broadcaster_socket = Room[0] || 0

    console.log("broadcaster socket:",data.chatID , broadcaster_socket)
    if ( data.chatID > '' && !(data.chatID == broadcaster_socket)) {
      console.log("yop")
      socket.emit('hangup',"Wrong Chat ID")
    }else{
        //data.sid = socket.sid;
      let ret = {addr_v : data , sid: socket.id}
      // sending to all clients in the room (channel) except sender
      socket.to(room).emit('addr_v', ret);
    }
  });

  socket.on('addr_b', data => {
    let {addr_b , sid } = data;
    fee = data.fee;
    interval = data.interval;
    console.log("addr_b",addr_b,sid,fee,data)
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

  socket.on('claim', (sid) => {
    console.log("claim",sid)
    // sending to all clients in the room (channel) except sender
    io.to(sid).emit('claim')
    //socket.broadcast.to(room).emit('claim');
  });

  socket.on('transfer', (data) => {
    console.log("transer",data)
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('transfer', data);
  });

  socket.on('accept', sid => {
    console.log("accept",sid)
    //io.sockets.connected[id].join(room);
    io.in(sid).socketsJoin(room)
    const ret = {fee , interval};
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge',ret);
  });

  socket.on('reject', (sid,message) => {
    console.log("reject" , sid, message)
    io.to(sid).emit('hangup',message)
    //socket.emit('full')
    viewr_id = ''
  });
  
  socket.on('leave', () => {
    console.log("leave")
    // sending to all clients in the room (channel) except sender
    //io.in(room).emit('hangup',"Broadcaster left has terminatyer the broadcast");
    if (socket.id == broadcaster_id) {
      const Rooms = io.of("/").adapter.rooms;
      const Room = Array.from(Rooms.get(room)) || 0
      const viewr_socket = Room.filter(x=> x != socket.id)[0] || 0
      console.log("ZZZ",viewr_socket,room);
      viewr_socket > '' && io.in(viewr_socket).socketsLeave(room);
      console.log("VIEWR_ID_1",viewr_socket,room);
      viewr_id = ''
    }else {
      socket.leave(room);
    }
    
  });
});




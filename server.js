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
port = 3002,
server = process.env.NODE_ENV === 'production' ?
  http.createServer(app).listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  }) :
  https.createServer(options, app).listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
  })

const io = new Server(server, {'transports': ['websocket']  });

console.log('Connecting to Redis...');
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

// Handle Redis connection errors
pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log('Redis connected successfully!');
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO adapter configured with Redis');
  })
  .catch((err) => {
    console.error('Failed to connect to Redis:', err);
    console.log('Server will continue without Redis adapter');
  });


// compress all requests
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.sendFile(__dirname + '/dist/index.html'));
app.use(favicon('./dist/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');

// Store room data globally
const rooms = new Map();

io.on('connection', socket => {
  console.log("connection")
  let room = '';
  let broadcaster_id = '';
  let fee = 0;
  let payment = 0;
  let interval = 0;

  socket.on('disconnect', async function () {
    try {
      const rs =  await io.in(room).allSockets();
      if (rs.has(socket.id)) {
        socket.to(room).emit('hangup');
      }
      // Clean up room data if room is empty
      if (room && rs.size === 0) {
        rooms.delete(room);
      }
    }catch(e){
      console.log("HEYYYYY WAIT WHER ARE YOU GOING?")
    }
  });

  // sending to all clients in the room (channel) except sender
  socket.on('message', async message => {
    console.log("messgae",message)
    const sr = await io.in(room).allSockets();
    console.log("HAAA:",sr)
    socket.to(room).emit('message', message)
  });

  socket.on('find', async (stateObj) => {

    room = stateObj.roomID
    const sr = await io.in(room).allSockets();
    sr.delete(null)

    console.log("find",room,sr,sr && sr.size)

    if (sr && sr.size == 0) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create',{id: socket.id});
      broadcaster_id = socket.id;
      fee = stateObj.fee;
      interval = stateObj.interval;
      // Store room data
      rooms.set(room, {
        broadcaster_id: socket.id,
        fee: stateObj.fee,
        interval: stateObj.interval
      });
    } else if (sr.size === 1) {
      // Get room data
      const roomData = rooms.get(room) || { fee: 0, interval: 0, broadcaster_id: '' };
      socket.emit('join', { fee: roomData.fee, interval: roomData.interval, sid: roomData.broadcaster_id });
      payment = stateObj.payment
    } else { // max two clients
      socket.emit('full', room);
      //socket.emit('hangup',"Chat Space is accupied");
    }
  });

  //viewer event
  socket.on('addr_v', async data => {
    console.log("addr_v",data,) 
    const rs =  await io.in(room).allSockets();
    const broadcaster_socket = (Array.from(rs)).filter(x => x != socket.id)[0] || 0
    console.log("broadcaster socket:",data.chatID , broadcaster_socket)
    if ( data.chatID > '' && !(data.chatID == broadcaster_socket)) {
      socket.emit('hangup',"Wrong Chat ID")
    }else{
        //data.sid = socket.sid;
      let ret = {addr_v : data , sid: socket.id}
      // sending to all clients in the room (channel) except sender
      socket.to(room).emit('addr_v', ret);
    }
  });

  //broadcaster event
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

  socket.on('pending', sid => {
    console.log("pending",sid)
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('pending', sid);
  });

  socket.on('claim', (sid) => {
    console.log("claim",sid)
    // sending to all clients in the room (channel) except sender
    io.to(sid).emit('claim')
    //socket.broadcast.to(room).emit('claim');
  });

  socket.on('transfer', (data) => {
    data.sid = socket.id
    console.log("transer1",data)
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('transfer', data);
  });

  socket.on('lock', async (data) => {
    const sid = data.sid
    console.log("lock",data)
    if(sid) {
      const targetSocket = io.sockets.sockets.get(sid);
      if (targetSocket) {
        targetSocket.join(room);
        console.log("lock sockets:", await io.in(room).allSockets())
      } else {
        socket.broadcast.to(room).emit('hangup', "cannot lock room - socket not found");
      }
    }else {
      socket.broadcast.to(room).emit('hangup', "cannot lock room");
    }

    // sending to all clients in the room (channel) except sender
    //socket.broadcast.to(room).emit('transfer', data);
  });

  socket.on('accept', async (sid) => {
    console.log("accept",sid)
    const ret = {fee , interval}; 
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge',ret);
  });

  socket.on('reject', async (sid,message) => {
    console.log("reject" , sid, message)
    const targetSocket = io.sockets.sockets.get(sid);
    if (targetSocket) {
      targetSocket.leave(room);
    }
    console.log(await io.in(room).allSockets())
    io.to(sid).emit('hangup',message)
    //socket.emit('full')
  });
  
  socket.on('leave', async () => {
    console.log("leave")
    if (socket.id == broadcaster_id) {
      const rs =  await io.in(room).allSockets();
      const viewr_socket = (Array.from(rs)).filter(x => x != socket.id)[0] || 0
      console.log("ZZZ",viewr_socket);
      if(viewr_socket > '') {
        io.to(viewr_socket).emit('hangup',"Earner hangup")
        const targetSocket = io.sockets.sockets.get(viewr_socket);
        if (targetSocket) {
          targetSocket.leave(room);
        }
      }
      const Rooms2 = io.of("/").adapter.rooms;
      const Room2 = Array.from(Rooms2.get(room))
      console.log("leaave1",viewr_socket,room);
      // Clean up room data when broadcaster leaves
      rooms.delete(room);
    }else {
      const rs =  await io.in(room).allSockets();
      if (rs.has(socket.id)){
        socket.to(room).emit('hangup',"Provider Has left the Space");
        socket.leave(room);
      }
    }
  });
});




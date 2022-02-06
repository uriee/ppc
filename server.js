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
  http.createServer(app).listen(port) :
  https.createServer(options, app).listen(port)

const io = new Server(server, {'transports': ['websocket']  });

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();
//io.adapter(createAdapter(pubClient, subClient));

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  //io.listen(3000);
});


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

  socket.on('disconnect', async function () {
    try {
      const rs =  await io.in(room).allSockets();
      if (rs.has(socket.id)) { 
        socket.to(room).emit('hangup');
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
    } else if (sr.size === 1 && viewr_id == '') {
      socket.emit('join',{fee,interval,sid: broadcaster_id});
      viewr_id = socket.id;
      payment = stateObj.payment
    } else { // max two clients
      socket.emit('full', room);
      socket.emit('hangup',"Chat Space is accupied");
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
    if (viewr_id == '') {
      io.to(sid).emit('addr_b',data)
      viewr_id = sid
    }else{
      io.to(sid).emit('hangup',"The Earner is currently busy :(")
    }

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
    data.sid = socket.id
    console.log("transer1",data)
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('transfer', data);
  });

  socket.on('lock', async (data) => {
    const sid = data.sid
    console.log("lock",data)
    if(sid) {
      await io.of('/').adapter.remoteJoin(data.sid,room);
      console.log("lock sockets:", await io.in(room).allSockets())
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
    await io.of('/').adapter.remoteLeave(sid,room);
    console.log(await io.in(room).allSockets())
    io.to(sid).emit('hangup',message)
    //socket.emit('full')
    viewr_id = ''
  });
  
  socket.on('leave', async () => {
    console.log("leave")
    if (socket.id == broadcaster_id) {
      const rs =  await io.in(room).allSockets();
      const viewr_socket = (Array.from(rs)).filter(x => x != socket.id)[0] || 0
      console.log("ZZZ",viewr_socket);
      if(viewr_socket > '') {
        io.to(viewr_socket).emit('hangup',"Earner hangup")
        await io.of('/').adapter.remoteLeave(viewr_socket,room);
      } 
      const Rooms2 = io.of("/").adapter.rooms;
      const Room2 = Array.from(Rooms2.get(room))    
      console.log("VIEWR_ID_1",viewr_socket,room);
      viewr_id = ''
    }else {
      const rs =  await io.in(room).allSockets();
      if (rs.has(socket.id)){
        socket.to(room).emit('hangup',"Provider Has left the Space");
        socket.leave(room);
      }
    } 
  });
});




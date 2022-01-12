const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sio = require('socket.io');
const favicon = require('serve-favicon');
const compression = require('compression');

var redis = require("redis");

const { isCommunityResourcable } = require('@ethersproject/providers');
const { resolve } = require('path');

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
  let fee = 0;
  let payment = 0;
  let interval = 0;

  const redisDisco = async () => {
    try{
      const client = redis.createClient();
      await client.connect();
      const admin = await client.get(room)
      console.log("ADMIN:",admin,socket.id,room)
      if (admin) {
        if(admin == socket.id) {
          await client.del(room)
          await client.del(`${room}:waitinglist`)
          await client.del(socket.id)
        } else{
          const wl = await client.get(`${room}:waitinglist`)
          const get = JSON.parse(wl)
          const filtered = get && get.filter(x=> x.socket != socket.id)
          const json = JSON.stringify(filtered)
          await client.set(`${room}:waitinglist`, json)
        }
        await client.quit(); 
        Promise.resolve(0);
      }
    }catch(e){
      console.log("error 1:",e)
    }
  }

  socket.on('disconnect', async function () {
    try {
      socket.broadcast.to(room).emit('disco');
      await redisDisco()               
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
    console.log("find",stateObj,fee,interval,payment)
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    const sr = room && io.sockets.adapter.rooms[room];
    if (sr === undefined) {   
      // no room with such name is found so create it
      socket.join(room);

      const client = redis.createClient();
      await client.connect();            await client.set(socket.id, room)
      client.on('error', (err) => console.log('Redis Client Error', err));  
      const c1 = await client.set(room, socket.id)
      const c2 = await client.set(socket.id,room)
      const c3 = await client.set(`${room}:waitinglist`, '[]')  
      console.log("CCC",c1,c2,c3)
      await client.quit(); 

      socket.emit('create',{id: socket.id});
      broadcaster_id = socket.id;
      fee = stateObj.fee;
      interval = stateObj.interval;
    } else if (sr.length === 1 && viewr_id == '') {
      socket.emit('join',{fee,interval,sid: broadcaster_id});
      viewr_id = socket.id;
      payment = stateObj.payment
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('addr_v', async data => {
    console.log("addr_v",data,)
   
    let Rooms = io.sockets.adapter.rooms
    let Room = Rooms ? Rooms[data.roomID] : 0
    const broadcaster_socket = Room.sockets && Object.keys(Room.sockets)
    //console.log("broadcaster socket:",data.chatID , broadcaster_socket)
    if ( data.chatID > '' && !(data.chatID == broadcaster_socket)) {
      console.log("yop")
      socket.emit('hangup',"Wrong Chat ID")
    }
       //data.sid = socket.sid;
    let ret = {addr_v : data , sid: socket.id}
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('addr_v', ret);

    const client = redis.createClient();
    await client.connect();   
    client.on('error', (err) => console.log('Redis Client Error', err));     
    const w = await client.get(`${room}:waitinglist`)
    if(w){
      const wl = JSON.parse(w)
      wl.push({
        socket: socket.id,
        pay: data.payment,
        message: data.addr_v
      })
      //wl sort
      await client.set(`${room}:waitinglist`, JSON.stringify(wl))  
    }
    await client.quit();
  });

  socket.on('addr_b', data => {
    
    let {addr_b , sid } = data;redisDisco
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

  socket.on('accept', id => {
    console.log("accept",id)
    io.sockets.connected[id].join(room);
    const ret = {fee , interval};
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge',ret);
  });

  socket.on('reject', (sid,message) => {
    console.log("reject" , sid)
    io.to(sid).emit('hangup',message)
    //socket.emit('full')
    viewr_id = ''
  });
  
  socket.on('leave', async () => {
    console.log("leave")
    // sending to all clients in the room (channel) except sender
    
    if (socket.id == broadcaster_id) {
      (viewr_id > '') && io.sockets.connected[viewr_id].leave(room);
      console.log("VIEWR_ID_1",viewr_id);
      viewr_id = ''
    }else {
      socket.broadcast.to(room).emit('hangup',"Broadcaster left has terminatyer the broadcast");
      socket.leave(room);
    }
    redisDisco()
  });
});




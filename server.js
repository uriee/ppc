const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sio = require('socket.io');
const favicon = require('serve-favicon');
const compression = require('compression');

const redis = require('redis');
const { promisify } = require('util');
/*
const client = redis.createClient({
    host: 'localhost',
    port: ,
    password: '<password>'
});
*/
const redis_client = redis.createClient();

redis_client.on('error', err => {
    console.log('Error ' + err);
});
const setAsync = promisify(redis_client.set).bind(redis_client);
const getAsync = promisify(redis_client.get).bind(redis_client);

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

  socket.on('disconnect', async function () {

    try {
      socket.broadcast.to(room).emit('disconnect');
      // redis - if exists socket->room delete room & socket & waiting list else remove from  waiting list
      const exists = await getAsync(room)
      if(exists) {
        redis_client.del(room)
        redis_client.del(`${room}:waitinglist`)
        redis_client.del(socket.id)
      } else{
        const wl = JSON.parse(getAsync(`${room}:waitinglist`))
        const filtered = JSON.stringify(wl.filter(x=> x.socket != socket.id))
        const ret = await setAsync(`${room}:waitinglist`, filtered)
      }

      }catch(e){
      console.log("HEYYYYY WAIT WHERE ARE YOU GOING?")
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
    const sr = io.sockets.adapter.rooms[room];
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);

      // redis = add room=>socket, socket->room, room::waiting_list->[]
      const c1 = await setAsync(room, socket.id )
      const c2 = await setAsync(socket.id, room)
      const c3 = await setAsync(`${room}:waitinglist`, '[]')
      console.log("CC:",c1,c2,c3)
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
    console.log("addr_v",data)
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
    //redis - room::waiting_list->{socket,pay,message} 
    const wl = JSON.parse(getAsync(`${room}:waitinglist`))
    wl.push({
      socket: socket.id,
      pay: data,
      message: data
    })
    //wl sort

    const c3 = await setAsync(`${room}:waitinglist`, JSON.stringify(wl))
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
  
  socket.on('leave', () => {
    console.log("leave")
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup',"Broadcaster left has terminatyer the broadcast");
    if (socket.id == broadcaster_id) {
      (viewr_id > '') && io.sockets.connected[viewr_id].leave(room);
      console.log("VIEWR_ID_1",viewr_id);
      viewr_id = ''
    }else {
      socket.leave(room);
    }
    
  });
});




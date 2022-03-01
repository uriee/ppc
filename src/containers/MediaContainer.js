import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import store from '../store'
import { Redirect } from 'react-router-dom';

import getBlockchain from '../../ethereum.js';
import regeneratorRuntime, { async } from "regenerator-runtime"

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class MediaBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridge: '',
      user: ''
    }
    this.onRemoteHangup = this.onRemoteHangup.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendData = this.sendData.bind(this);
    this.setupDataHandlers = this.setupDataHandlers.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.sendDescription = this.sendDescription.bind(this);
    this.hangup = this.hangup.bind(this);
    this.shareScreen = this.shareScreen.bind(this);
    this.init = this.init.bind(this);
  }
  componentDidMount() {
    const pageloader = document.getElementById('pageloader');
    const infraloader = document.getElementById('infraloader');
    pageloader.classList.toggle('is-active');
    var pageloaderTimeout = setTimeout(function () {
        infraloader.classList.remove('is-active');
        pageloader.classList.toggle('is-active');
        clearTimeout(pageloaderTimeout);
    }, 1200);     
    this.props.media(this);
    this.props.getUserMedia
      .then(stream => this.localVideo.srcObject = this.localStream = stream);
    this.props.socket.on('message', this.onMessage);
    this.props.socket.on('hangup', this.onRemoteHangup);
    
    this.props.socket.on('disconnect', this.onRemoteHangup);
    this.props.socket.on('claim', this.onClaim);
  }
  componentWillUnmount() {
    this.props.media(null);
    if (this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit('leave');
  }
  async onRemoteHangup(message) {
    const owner = store.getState().owner;
    console.log("OWNER onRemoteHangup",owner)
    this.setState({bridge: 'host-hangup',  minutes: 0});
    if(!owner){
      toast.error(message)
      await new Promise(resolve => setTimeout(resolve, 3000));  
      window.history.back()
    }else{
      toast("Session Hangup", { autoClose: 2000, pauseOnHover: false })
    }
  }

  onClaim() {
    console.log("claim");
    toast("Broadcaster is claiming tokens", { autoClose: 2000, pauseOnHover: false })
  };  

  onMessage(message) {
    console.log("onMessage",message.type)
      if (message.type === 'offer') {
            // set remote description and answer
            this.pc.setRemoteDescription(new RTCSessionDescription(message))
                .then(() => this.pc.createAnswer())
                .then(this.setDescription)
                .then(this.sendDescription)
                .catch(this.handleError); // An error occurred, so handle the failure to connect

      } else if (message.type === 'answer') {
          // set remote description
          this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate') {
            // add ice candidate
            this.pc.addIceCandidate(message.candidate);
      }
  }

  sendData(msg) {
    this.dc.send(JSON.stringify(msg))
  }
  // Set up the data channel message handler
  setupDataHandlers() {
      this.dc.onmessage = e => {
          var msg = JSON.parse(e.data);
          console.log('received message over data channel:' + msg);
      };
      this.dc.onclose = () => {
        this.remoteStream.getVideoTracks()[0].stop();
        console.log('The Data Channel is Closed');
      };
  }

  setDescription(offer) {
    console.log("setDesc",offer)
    return this.pc.setLocalDescription(offer);
  }

  // send the offer to a server to be forwarded to the other peer
  sendDescription() {
    this.props.socket.send(this.pc.localDescription);
  }

  async hangup() {
    const owner = store.getState().owner;
    console.log("OWNER hangup",owner)
    if(owner) {
      this.setState({bridge: 'host-hangup'})
    } else {
      this.setState({bridge: 'full'})
      this.pc.close()
      toast.error(`Broadcastre HangUp`)
      await new Promise(resolve => setTimeout(resolve, 3000));  
      window.history.back()      
    }  
    this.props.socket.emit('leave');
  }

  shareScreen() {
    if (!this.pc) return
    const stm = this.localStream
    const pc = this.pc
    const videoTrack = stm.getVideoTracks()[0]
    const sendData = this.sendData
    navigator.mediaDevices.getDisplayMedia({ cursor: true}).then( stream => {
      const screenTrack = stream.getTracks()[0]
      var sender = pc.getSenders().find(function(s) {
        return s.track.kind == screenTrack.kind;
      });
      sender.replaceTrack(screenTrack);
      screenTrack.onended = function() {
        var sender = pc.getSenders().find(function(s) {
          return s.track.kind == videoTrack.kind;
        });
        sender.replaceTrack(videoTrack);
      }     
    })
  }

  handleError(e) {
    console.log("HandleError",e);
  }
  
  init() {
    // wait for local media to be ready
    const attachMediaIfReady = () => {
      this.dc = this.pc.createDataChannel('chat');
      this.setupDataHandlers();
      console.log('attachMediaIfReady')
      this.pc.createOffer()
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
        
    }
    // set up the peer connection
    // this is one of Google's public STUN servers
    // make sure your offer/answer role does not change. If user A does a SLD
    // with type=offer initially, it must do that during  the whole session
    this.pc = new RTCPeerConnection({iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]});
    // when our browser gets a candidate, send it to the peer
    this.pc.onicecandidate = e => {
        console.log(e, 'onicecandidate');
        if (e.candidate) {
            this.props.socket.send({
                type: 'candidate',
                candidate: e.candidate,
            });
        }
    };
    // when the other side added a media stream, show it on screen
    this.pc.onaddstream = e => {
        console.log('onaddstream', e) 
        this.remoteStream = e.stream;
        this.remoteVideo.srcObject = this.remoteStream = e.stream;
        this.setState({bridge: 'established'});
    };
    this.pc.onaddtrack = e => {
      console.log('onaddtrack', e) 
      this.remoteStream = e.stream;
      this.remoteVideo.srcObject = this.remoteStream = e.stream;
      this.setState({bridge: 'established'});
  };
  
    this.pc.ondatachannel = e => {
        // data channel
        console.log('onDatachannel', e) 
        this.dc = e.channel;
        this.setupDataHandlers();
        this.sendData({
          peerMediaStream: {
            video: this.localStream.getVideoTracks()[0].enabled
          }
        });
        //sendData('hello');
    };
    // attach local media to the peer connection
    this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));
    // call if we were the last to connect (to increase
    // chances that everything is set up properly at both ends)
    if (this.state.user === 'host') {
      this.props.getUserMedia.then(attachMediaIfReady);
    }  
  }
  render(){
    return (
      <div className={`media-bridge ${this.state.bridge}`}>
        <div id="pageloader" className="pageloader is-left-to-right is-theme"></div>
        <div id="infraloader" className="infraloader is-active"></div>        
        <ToastContainer autoClose={2000}/>
        <video className="remote-video" ref={(ref) => this.remoteVideo = ref} autoPlay></video>
        <video className="local-video" ref={(ref) => this.localVideo = ref} autoPlay muted></video>
      </div>
    );
  }
}
MediaBridge.propTypes = {
  socket: PropTypes.object.isRequired,
  getUserMedia: PropTypes.object.isRequired,
  media: PropTypes.func.isRequired
}
export default MediaBridge;
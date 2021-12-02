import React from 'react'
import { PropTypes } from 'prop-types';
import MediaContainer from './MediaContainer'
import Communication from '../components/Communication'
import store from '../store'
import { connect } from 'react-redux'

import getBlockchain from '../../ethereum.js';
import regeneratorRuntime from "regenerator-runtime"

class CommunicationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sid: '',
      message: '',
      audio: true,
      video: true,
      addr_v: null,
      addr_b: null,
      firstPay : 0
    };

    this.handleInvitation = this.handleInvitation.bind(this);
    this.handleHangup = this.handleHangup.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleAudio = this.toggleAudio.bind(this);
    this.send = this.send.bind(this);

    this.signerAddress = null
    this.ppiToken = null
/*
    const init = async () => {
      const { signerAddress, ppiToken } = await getBlockchain();
      this.signerAddress = signerAddress
      this.ppiToken = ppiToken
      const name = await ppiToken.name();
      console.log("Name:",name)
    };
    init();
    */
  }

  hideAuth() {
    console.log("HIDE")
    this.props.media.setState({bridge: 'connecting'});
  } 
  full() {
    console.log("FULL")
    this.props.media.setState({bridge: 'full'});
  }
  componentDidMount() {
    const socket = this.props.socket;
    this.setState({video: this.props.video, audio: this.props.audio});

    socket.on('create', () => {
      console.log("create")
      this.props.media.setState({user: 'host', bridge: 'create'})
    });

    socket.on('full', this.full);
    socket.on('bridge', role => {
      console.log("bridge")
      this.props.media.init()
    });

    socket.on('join', () => {
      // allowance
      this.props.media.setState({user: 'guest', bridge: 'join'})
    });

    socket.on('approve', ({ message, sid }) => {
      console.log("approve",message,sid)
      this.props.media.setState({bridge: 'approve'});
      this.setState({ message, sid });
    });

    socket.on('addr_v', ({ addr_v, sid, firstPay }) => {
      console.log("addr_v",addr_v,sid, firstPay)
      //save addr on viewr_add state variable
      this.setState({ addr_v, firstPay});
      // get the signerAddr and emit it with addr_b
      let addr_b = this.signerAddress;
      let ret = {addr_b, sid }
      console.log("sending addr_b : ",ret,this.state)
      addr_b && this.props.socket.emit('addr_b', ret);
    });

    socket.on('addr_b', ({ addr_b, sid }) => {
      console.log("addr_b",addr_b,sid)
      //save addr on viewr_add state variable
      this.setState({addr_b});
      this.realSend(addr_b);
    });

    socket.emit('find');
    console.log("emitted find")
    this.props.getUserMedia
      .then(stream => {
        console.log("STREAM")
          this.localStream = stream;
          this.localStream.getVideoTracks()[0].enabled = this.state.video;
          this.localStream.getAudioTracks()[0].enabled = this.state.audio;
        });

    const init = async () => {
      let { signerAddress, ppiToken } = await getBlockchain();
      this.signerAddress = signerAddress
      this.ppiToken = ppiToken
      //const name = await ppiToken.name();
      //console.log("Name:",name)
    };
    !this.ppiToken && init();        

  }
  handleInput(e) {
    this.setState({[e.target.dataset.ref]: e.target.value});
  }

  send = async(e) => {
    e.preventDefault();
    console.log("SWAP",this.ppiToken, this.signerAddress)
    if(this.signerAddress) {
      let obj = {
        addr_v: this.signerAddress,
        firstpay : this.props.firstPay
      }
      this.props.socket.emit('addr_v', obj);
      this.hideAuth();
    }
  }


  realSend = async (addr_b) => {
    console.log("SEND",addr_b, this.props.firstPay + '000000000',this.ppiToken) 
    //Set Allowance
    const ret = await this.ppiToken.approve(addr_b, this.props.firstPay + '000000000')
    console.log("SEND 2",ret)
    //const ret2 = await wait(ret)
    //console.log("SEND 3",ret2)
    this.props.socket.emit('auth', this.state);
    this.hideAuth();
  }

  handleInvitation(e) {
    e.preventDefault();
    console.log("HaNDLE INVETITION")
    if (e.target.dataset.ref == 'accept') {
      //transferFrom(sender,recp,amount)
      console.log("Accept",this.state.addr_v, this.signerAddress, this.state.firstPay + '000000000')
      //const ret = await this.ppiToken.transferFrom(this.state.addr_v, this.signerAddress, this.state.firstPay + '000000000')
    }
    this.props.socket.emit([e.target.dataset.ref], this.state.sid);
    this.hideAuth();
  }

  toggleVideo() {
    console.log("TOGGLE V")
    const video = this.localStream.getVideoTracks()[0].enabled = !this.state.video;
    this.setState({video: video});
    this.props.setVideo(video);
  }
  toggleAudio() {
    console.log("TOGGLE A")
    const audio = this.localStream.getAudioTracks()[0].enabled = !this.state.audio;
    this.setState({audio: audio});
    this.props.setAudio(audio);
  }
  handleHangup() {
    console.log("Hung up")
    this.props.media.hangup();
  }
  render(){
    return (
      <Communication
        {...this.state}
        toggleVideo={this.toggleVideo}
        toggleAudio={this.toggleAudio}
        send={this.send}
        handleHangup={this.handleHangup}
        handleInput={this.handleInput}
        handleInvitation={this.handleInvitation} />
    );
  }
}
const mapStateToProps = store => ({video: store.video, audio: store.audio, fee: store.fee, interval: store.interval, firstPay: store.firstPay, token:store.token});
const mapDispatchToProps = dispatch => (
  {
    setVideo: boo => store.dispatch({type: 'SET_VIDEO', video: boo}),
    setAudio: boo => store.dispatch({type: 'SET_AUDIO', audio: boo})
  }
);

CommunicationContainer.propTypes = {
  socket: PropTypes.object.isRequired,
  getUserMedia: PropTypes.object.isRequired,
  audio: PropTypes.bool.isRequired,
  video: PropTypes.bool.isRequired,
  setVideo: PropTypes.func.isRequired,
  setAudio: PropTypes.func.isRequired,
  media: PropTypes.instanceOf(MediaContainer)
};
export default connect(mapStateToProps, mapDispatchToProps)(CommunicationContainer);
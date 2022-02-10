import React from 'react'
import { PropTypes } from 'prop-types';
import MediaContainer from './MediaContainer'
import Communication from '../components/Communication'
import store from '../store'
import { connect } from 'react-redux'

import getBlockchain from '../../ethereum.js';
import regeneratorRuntime, { async } from "regenerator-runtime"

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class CommunicationContainer extends React.Component {
  constructor(props) {
    super(props);
   
    this.state = {
      sid: '', // the other actor socket
      id: '', // this actor socket
      message: '',
      audio: true,
      video: true,
      addr_v: null,
      addr_b: null,
      payment : 0,
      minutes: 0,
      update : 0
    };

    this.handleInvitation = this.handleInvitation.bind(this);
    this.handleHangup = this.handleHangup.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleAudio = this.toggleAudio.bind(this);
    this.send = this.send.bind(this);

    this.signerAddress = null
    this.ppcToken = null

  }

  hideAuth() {
    console.log("HIDE")
    this.props.media.setState({bridge: 'connecting'});
  } 

  full() {
    console.log("FULL", this.props.media)
    this.props.media.setState({bridge: 'full'});
    toast("Broadcaster is accupied", { autoClose: 2000, pauseOnHover: false })
  }

  componentDidMount() {
    const socket = this.props.socket;

    this.setState({video: this.props.video, audio: this.props.audio, id: socket.id});
    const state = store.getState();
    const stateObj = {
      fee: state.fee,
      interval: state.interval,
      payment: state.payment,
      roomID: store.getState().roomID
    }

    socket.on('create', (props) => {
      console.log("create",props.id)
      this.props.media.setState({user: 'host', bridge: 'create'})
      store.dispatch({ type: 'SET_OWNER', owner: true})
      this.setState({id: props.id});
    });

    socket.on('full', this.full);

    socket.on('bridge', props => {
      console.log("bridge",props)
      props.interval && this.setState({ minutes: props.interval });
      this.props.media.init()
    });

    socket.on('hangup', async (message) => {
      console.log("Hangup minuts = 0")   
      this.setState({ minutes: 0 });
    });    

    socket.on('join', (props) => {
      console.log("FEE INTERVAL:",props);
      this.props.media.setState({user: 'guest', bridge: 'join'})
      store.dispatch({ type: 'SET_OWNER', owner: false})
      this.setState({id :props.sid})
    });

    socket.on('disconnect', async (props) => {
      console.log("disconnect:",props);
      this.props.media.setState({bridge: 'full'});
      toast.error(`Diconnected`)
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.history.back()
      
    });    

    socket.on('approve', ({ message, sid }) => {
      console.log("approve",message,sid)
      this.props.media.setState({bridge: 'approve'});
      this.setState({ message, sid });
    });

    socket.on('addr_v', ({ addr_v, sid}) => {
      const state = store.getState();
      console.log("addr_v",addr_v,sid, socket.id);
      this.setState({ addr_v: addr_v.addr_v, payment: addr_v.payment });
      toast(`SomeOne is considering a session for ${addr_v.payment} PPC.`, { autoClose: 2000, pauseOnHover: false })
      if (parseInt(state.fee) > parseInt(addr_v.payment)) {
        this.props.socket.emit('reject', sid, "You need to pay more.")
        return;
      }

      store.dispatch({ type: 'SET_PAYMENT', payment:  addr_v.payment})
      let addr_b = this.signerAddress;
      let ret = {addr_b, sid ,fee: state.fee, interval: state.interval }
      console.log("sending addr_b : ",ret,this.state)
      addr_b && this.props.socket.emit('addr_b', ret);
    });

    socket.on('addr_b', ({ addr_b, sid }) => {
      console.log("addr_b",addr_b,sid)
      //save addr on viewr_add state variable
      this.setState({addr_b});
      this.approve(addr_b);
      toast("Broadcaster is online and free to chat", { autoClose: 2000, pauseOnHover: false })
    });
    
    socket.on('transfer', (props) => {
      console.log("transfer:",props);
      toast("Viewr is transfering tokens", { autoClose: 2000, pauseOnHover: false })
      socket.emit('lock',props)
    });      

    socket.emit('find', stateObj);
    console.log("emitted find")
    this.props.getUserMedia
      .then(stream => {
        console.log("STREAM")
          this.localStream = stream;
          this.localStream.getVideoTracks()[0].enabled = this.state.video;
          this.localStream.getAudioTracks()[0].enabled = this.state.audio;
        });

    const init = async () => {
      let { signerAddress, ppcToken } = await getBlockchain();
      this.signerAddress = signerAddress
      if(!ppcToken){
        toast.error(`No wallet Detected`)
        await new Promise(resolve => setTimeout(resolve, 4000));
        window.location.assign("https:/cryptomeet.me")
      }
      this.ppcToken = ppcToken
    };
    !this.ppcToken && init();        
  }

  handleInput(e) {
    this.setState({[e.target.dataset.ref]: e.target.value});
  }
  
  send = async(e) => {
    e.preventDefault();
    console.log("SWAP",this.ppcToken, this.signerAddress)
    if(this.signerAddress) {
      let obj = {
        addr_v: this.signerAddress,
        payment : this.props.payment,
        chatID: store.getState().chatID,
        roomID: store.getState().roomID,
      }
      this.props.socket.emit('addr_v', obj);
      this.hideAuth();
    }
  }


  approve = async (addr_b) => {
    console.log("SEND",addr_b, this.props.payment + '000000000',this.ppcToken) 
    //Set Allowance
    const ret = await this.ppcToken.approve(addr_b, this.props.payment + '000000000')
    this.props.socket.emit('transfer',this.state);
    toast.promise(
      ret.wait(),
      {
        pending: 'Sending token to PPC',
        success: 'Tokens sent 👌',
        error: 'Error 🤯',
        autoClose: 2000, pauseOnHover: false
      }
    )
    const confirmation = await ret.wait()
    console.log("SEND 3",confirmation)
    if (confirmation.status === 1) {
      this.props.socket.emit('auth', this.state);
      this.hideAuth();
    }
    else{
      this.setState({update: this.state.update +1})
    }
  }

  Accept = async () => {
    console.log("Accept",this.state.addr_v, this.signerAddress, this.state.payment + '000000000',store.fee,store.getState().fee)
    if (this.state.payment < store.fee) {
      this.props.socket.emit('reject', this.state.sid, "You need to pay more.");
      return;
    }
    const ret = await this.ppcToken.transferFrom(this.state.addr_v, this.signerAddress,  this.state.payment + '000000000')
    this.props.socket.emit('claim',this.state.sid);
    toast.promise(
      ret.wait(),
      {
        pending: 'Getting the preciouse tokens',
        success: 'Tokens recieved 👌',
        error: 'Error 🤯',
        autoClose: 2000, pauseOnHover: false 
      }
    )
    const accept =  await ret.wait()
    console.log("ACCEPT:",accept)
    if (accept.status == 1) {
      this.props.socket.emit('accept', this.state.sid);
      this.setState({ minutes: store.getState().interval });
    }else{
      this.props.socket.emit('reject', this.state.sid, "You've been rejected by the Broadcaster.");
      this.hideAuth();
    }
  }

  handleInvitation(e) {
    e.preventDefault();
    console.log("HaNDLE INVETITION",e.target.dataset.ref)
    if (e.target.dataset.ref == 'accept') {
      this.Accept()
    }else{
      this.props.socket.emit('reject', this.state.sid, "You've been rejected by the Broadcaster.");
    }
    this.hideAuth();  
  }

  toggleVideo() {
    console.log("TOGGLE V")
    const video = this.localStream.getVideoTracks()[0].enabled = !this.state.video;
    this.setState({video: video});
    this.props.setVideo(video);
  }
  toggleAudio() {
    console.log("TOGGLE A",this)
    const audio = this.localStream.getAudioTracks()[0].enabled = !this.state.audio;
    this.setState({audio: audio});
    this.props.setAudio(audio);
  }

  handleHangup() {
    console.log("Hang up",this.props)
    this.props.media.hangup();
    this.setState({ minutes: 0 });
  }
  render(){
    console.log("media",this.props.media)
    return (
      <Communication
        {...this.state}
        toggleVideo={this.toggleVideo}
        toggleAudio={this.toggleAudio}
        send={this.send}
        shareScreen ={this.props.media ? this.props.media.shareScreen : (x)=>x}
        sid={this.state ? this.state.id : ''}
        minutes={this.state.minutes}
        handleHangup={this.handleHangup}
        handleInput={this.handleInput}
        handleInvitation={this.handleInvitation} />
    );
  }
}
const mapStateToProps = store => ({video: store.video, audio: store.audio, fee: store.fee, interval: store.interval, payment: store.payment, token:store.token});
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
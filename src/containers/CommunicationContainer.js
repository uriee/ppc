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

spenderMMConfirm_e(){
   var e1 = document.getElementById("eStage1");
   var e2 = document.getElementById("eStage2");
    e1.classList.remove("isActive")
    e1.classList.add("isDone");
   e2.classList.add("isActive");
}

spenderMMConfirm_s()
{
   var smm = document.getElementById("spenderMMActionNeeded");
   var s2 = document.getElementById("sStage2");
   smm.classList.remove("isActive");
   smm.classList.add("isDone");
   s2.classList.add("isActive");
}

earnerMMConfirm_s() {
   var s3 = document.getElementById("sStage3");
   var s4 = document.getElementById("sStage4");
   s3.classList.remove("isActive");
   s3.classList.add("isDone");
   s4.classList.add("isActive");
}

earnerMMConfirm_e() {
   var emm = document.getElementById("earnerMMActionNeeded");
   var e4 = document.getElementById("eStage4");
   emm.classList.remove("isActive");
   emm.classList.add("isDone");
   e4.classList.add("isActive");
}
 startMeeting() {
  const { owner } = store.getState();
  if(!owner){
    var s4 = document.getElementById("sStage4");
    s4.classList.remove("isActive");
    s4.classList.add("isDone");
  }else{
    var e4 = document.getElementById("eStage4");
    e4.classList.remove("isActive");
    e4.classList.add("isDone");
  }
 } 


initCom(){
  const { owner } = store.getState();
  let chat = document.getElementsByClassName('chat')[0]
  chat && (chat.style.display = 'flex')
  if (owner) { 
    var e1 = document.getElementById("eStage1");
    var e2 = document.getElementById("eStage2");
    var e3 = document.getElementById("eStage3");
    var e4 = document.getElementById("eStage4");
    var emm = document.getElementById("earnerMMActionNeeded");
  
    e1.classList.remove("isCompact", "isDone", "isActive");
    e2.classList.remove("isCompact", "isDone", "isActive");
    e3.classList.remove("isCompact", "isDone", "isActive");
    e4.classList.remove("isCompact", "isDone", "isActive");
    emm.classList.remove("isCompact", "isDone", "isActive");
    e1.classList.add("isActive");
  }else{
    var s1 = document.getElementById("sStage1");
    var s2 = document.getElementById("sStage2");
    var s3 = document.getElementById("sStage3");
    var s4 = document.getElementById("sStage4");
    var smm = document.getElementById("spenderMMActionNeeded");
  
    s1.classList.remove("isCompact", "isDone", "isActive");
    s2.classList.remove("isCompact", "isDone", "isActive");
    s3.classList.remove("isCompact", "isDone", "isActive");
    s4.classList.remove("isCompact", "isDone", "isActive");
    smm.classList.remove("isCompact", "isDone", "isActive");
    s1.classList.add("isActive");    
  }
}

/*
  hideAuth() {
    console.log("HIDE")
    this.props.media.setState({bridge: 'connecting'});
  } 
*/
  moneyOnTheTable_s() {
      var s2 = document.getElementById("sStage2");
      var s3 = document.getElementById("sStage3");
      s2.classList.remove("isActive");
      s2.classList.add("isDone");
      s3.classList.add("isActive");
   }  

   moneyOnTheTable_e() {
      var e2 = document.getElementById("eStage2");
      var e3 = document.getElementById("eStage3");
      e2.classList.toggle("isActive");
      e2.classList.add("isDone");
      e3.classList.add("isActive");
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

    socket.on('full', async ()=> {
      console.log("FULL", this.props.media)
      this.props.media.setState({bridge: 'full'});
      toast("Broadcaster is accupied")
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.history.back()
    });

    socket.on('bridge', props => {
      console.log("bridge",props)
      props.interval && this.setState({ minutes: props.interval });
      const chat = document.getElementsByClassName('chat')[0]
      chat.style.display = 'none'
      this.props.media.init() 
    });

    socket.on('hangup', async (message) => {
      console.log("Hangup minuts = 0")   
      const chat = document.getElementsByClassName('chat')[0]
      this.initCom()
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
      this.initCom()
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.history.back()
      
    });

    socket.on('claim', () => {
      console.log("claim");
      this.earnerMMConfirm_s();
      toast("Broadcaster is claiming tokens 22", { autoClose: 2000, pauseOnHover: false })
    });    

    socket.on('approve', ({ message, sid }) => {
      console.log("approve",message,sid)
      this.props.media.setState({bridge: 'approve'});
      this.moneyOnTheTable_e()
      this.setState({ message, sid });
    });

    socket.on('addr_v', ({ addr_v, sid}) => {
      const state = store.getState();
      console.log("addr_v",addr_v,sid, socket.id);
      this.setState({ addr_v: addr_v.addr_v, payment: addr_v.payment });
      toast(`SomeOne is considering a session for ${addr_v.payment} PPC.`, { autoClose: 2000, pauseOnHover: false })
      if (parseInt(state.fee) > parseInt(addr_v.payment)) {
        this.props.socket.emit('reject', sid, "You need to pay more.")
        this.setState({ addr_v: null});
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
      this.spenderMMConfirm_e()
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
      let { signerAddress, ppcToken } = await getBlockchain(toast);
      this.signerAddress = signerAddress
      if(!ppcToken){
        toast.error(`No wallet Detected`)
        await new Promise(resolve => setTimeout(resolve, 4000));
        location.href = 'https://cryptomeet.me/'
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
      //this.hideAuth();
      var s1 = document.getElementById("sStage1");
      var smm = document.getElementById("spenderMMActionNeeded");    
      s1.classList.remove("isActive");
      s1.classList.add("isDone");
      smm.classList.add("isActive");      
    }
  }


  approve = async (addr_b) => {
    console.log("SEND",addr_b, this.props.payment + '000000000',this.ppcToken) 
    //Set Allowance
    toast.info("Waiting for your BSC wallet.")

    try {
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
      this.spenderMMConfirm_s()
      const confirmation = await ret.wait()

      console.log("SEND 3",confirmation)
      if (confirmation.status === 1) {
        this.props.socket.emit('auth', this.state);
        //this.hideAuth();
        this.moneyOnTheTable_s()
      }
      else{
        this.setState({update: this.state.update +1})
        this.initCom()
      }
    }catch(e){
      this.initCom()
    }      
  }

  Accept = async () => {
    console.log("Accept",this.state.addr_v, this.signerAddress, this.state.payment + '000000000',store.fee,store.getState().fee)
    if (this.state.payment < store.fee) {
      this.props.socket.emit('reject', this.state.sid, "You need to pay more.");
      this.setState({ addr_v: null});
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
    this.earnerMMConfirm_e()
    const accept =  await ret.wait()
    console.log("ACCEPT:",accept)
    if (accept.status == 1) {
      this.props.socket.emit('accept', this.state.sid);
      this.setState({ minutes: store.getState().interval });
    }else{
      this.props.socket.emit('reject', this.state.sid, "You've been rejected by the Broadcaster.");
      //this.hideAuth();
      this.setState({ addr_v: null});
    }
  }

  getTheMoney(e)  {
    this.Accept()    
    var e3 = document.getElementById("eStage3");
    var emm = document.getElementById("earnerMMActionNeeded");    
    e3.classList.toggle("isActive");
    e3.classList.add("isDone");
    emm.classList.add("isActive");    
   }  

  ernerDecline() {
    this.props.socket.emit('reject', this.state.sid, "You've been rejected by the Broadcaster.");
    this.setState({ addr_v: null});    
    this.initCom()  
  }

  handleInvitation(e) {
    e.preventDefault();
    console.log("HaNDLE INVETITION",e.target.dataset.ref)
    if (e.target.dataset.ref == 'accept') {
      this.Accept()
      var e3 = document.getElementById("eStage3");
      var emm = document.getElementById("earnerMMActionNeeded");    
      e3.classList.toggle("isActive");
      e3.classList.add("isDone");
      emm.classList.add("isActive");      
    }else{
      this.props.socket.emit('reject', this.state.sid, "You've been rejected by the Broadcaster.");
      this.setState({ addr_v: null});
      this.initCom()
    }
    ///this.hideAuth();  
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
    this.initCom()
    this.props.media.hangup();
    this.setState({ minutes: 0 });
  }
  render(){
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
        initCom={this.initCom}
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
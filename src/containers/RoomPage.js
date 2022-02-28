import React, { Component } from 'react';
import MediaContainer from './MediaContainer'
import CommunicationContainer from './CommunicationContainer'
import { connect } from 'react-redux'
import store from '../store'
import io from 'socket.io-client'

class RoomPage extends Component {
  constructor(props) {
    super(props);
    this.getUserMedia = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).catch(e => alert('getUserMedia() error: ' + e.name))

    //this.socket = io.connect('https//localhost:3002');
    this.socket = io( {
    // WARNING: in that case, there is no fallback to long-polling
    transports: [ "websocket" ] // or [ "websocket", "polling" ] (the order matters)
    });
  }
  componentDidMount() {
    this.props.addRoom();
  }
  render(){
    return (
      <div>
        <MediaContainer media={media => this.media = media} socket={this.socket} getUserMedia={this.getUserMedia} />
        <CommunicationContainer socket={this.socket} media={this.media} getUserMedia={this.getUserMedia} />
      </div>
    );
  }
}
const mapStateToProps = store => ({rooms: new Set([...store.rooms])});
const mapDispatchToProps = (dispatch, ownProps) => (
    {
      addRoom: () => {
        store.dispatch({ type: 'ADD_ROOM', room: ownProps.match.params.room})
        ownProps.match.params.chat_id && store.dispatch({ type: 'SET_CHATID', chatID:  ownProps.match.params.chat_id})
        ownProps.match.params.fee && store.dispatch({ type: 'SET_FEE', fee:  ownProps.match.params.fee})
      }
    }
  );
export default connect(mapStateToProps, mapDispatchToProps)(RoomPage);

/*
const roomPage = (props) => {
  console.log("roomPage",props)
    const [C2Mbridge, setC2mbridge] = useState({})

    useEffect(() => {
      props.addRoom();
    },[])

    const getUserMedia = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).catch(e => alert('getUserMedia() error: ' + e.name))    

   const socket = io( {
    // WARNING: in that case, there is no fallback to long-polling
    transports: [ "websocket" ] // or [ "websocket", "polling" ] (the order matters)
    });
    let media = 0
    return (
      <div>
        <MediaContainer media={m => media = m}  socket={socket} getUserMedia={getUserMedia} />
        <CommunicationContainer socket={socket} media={media} getUserMedia={getUserMedia} />
      </div>
    );
}

  export default roomPage
  */
import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import Home from '../components/Home';
import store from '../store'

class HomePage extends Component {
  constructor(props) {
    
    super(props);
    this.defaultRoomId = '';
    this.state = { roomId: this.defaultRoomId };
    this.handleIdChange = this.handleIdChange.bind(this); 
    this.params = props.match.params;
  }
  handleIdChange(e) {
    this.setState({ roomId: e.target.value });
  }

  render(){
    if (this.params.room) {
      this.params.chat_id && store.dispatch({ type: 'SET_CHATID', chatID:  this.params.chat_id})
      this.params.fee && store.dispatch({ type: 'SET_FEE', fee:  this.params.fee})
      this.params.fee && store.dispatch({ type: 'SET_PAYMENT', payment:  this.params.fee})
      this.params.room && store.dispatch({ type: 'SET_ROOMID', roomID:  this.params.room})
    }
    return (
      <Home
        defaultRoomId={this.defaultRoomId}
        roomId={this.state.roomId}
        handleIdChange={this.handleIdChange}
      />
    );
  }
}

HomePage.contextTypes = {
  router: PropTypes.object
};

export default HomePage;
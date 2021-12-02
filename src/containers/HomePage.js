import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import Home from '../components/Home';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.defaultRoomId = String(new Date() - new Date().setHours(0, 0, 0, 0));
    this.state = { roomId: this.defaultRoomId };
    this.handleIdChange = this.handleIdChange.bind(this);  
  }
  handleIdChange(e) {
    this.setState({ roomId: e.target.value });
  }

  render(){
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
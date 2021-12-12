import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store'

import getBlockchain from '../../ethereum.js';
import regeneratorRuntime from "regenerator-runtime";

const Home = (props) => {

/*
  useEffect(() => {
    const init = async () => {
      const { signerAddress, ppiToken } = await getBlockchain();
      //console.log(ppiToken)
      props.setppi(ppiToken,signerAddress)
      const name = await ppiToken.name();
      console.log("Name:",name)
    };
    init();
  }, []);
*/


  return( <div className="home">
            <div>
              <h1 itemProp="headline">Pay Per Interaction</h1>
              <p>Payment cycle in minutes.</p>
              <input type="number" name="interval"  onChange={props.handleIntervalChange} pattern="^\d+$" maxLength="3" required autoFocus title="Length of the payment cycle in minuts (numbers only)."/>              
              <p>Each cycle fee in PPI Token.</p>
              <input type="number" name="fee"  onChange={props.handleFeeChange} pattern="^\d+$" maxLength="10" required autoFocus title="Payment in PPI tokens per interval."/>             
              <p>First Pay Offer in PPI Token.</p>
              <input type="number" name="first"  onChange={props.handleFirstPayChange} pattern="^\d+$" maxLength="10" required autoFocus title="First Payment in PPI tokens."/>               
              <p>Please enter a room name.</p>
              <input type="text" name="room" value={ props.roomId } onChange={props.handleIdChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>

              <Link className="primary-button" to={ '/r/' + props.roomId }>Start/Join</Link>
              <Link className="primary-button" to={ '/r/' + props.defaultRoomId }>Random</Link>
              { props.rooms.length !== 0 && <div>Recently used rooms:</div> }
              { props.rooms.map(room => <Link key={room} className="recent-room" to={ '/r/' + room }>{ room }</Link>) }
            </div>
          </div>)
}


Home.propTypes = {
  handleIdChange: PropTypes.func.isRequired,
  handleIntervalChange: PropTypes.func.isRequired,
  handleFeeChange: PropTypes.func,  
  handleFirstPayChange: PropTypes.func,
  defaultRoomId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  rooms: PropTypes.array.isRequired
};

const mapStateToProps = store => {
  return {rooms: store.rooms};
}
const mapDispatchToProps = (dispatch, ownProps) => {

  return (
  {
    handleIntervalChange: (e) => store.dispatch({ type: 'SET_INTERVAL', interval:  e.target.value}),
    handleFeeChange: (e) =>  store.dispatch({ type: 'SET_FEE', fee:  e.target.value}),
    handleFirstPayChange: (e) => store.dispatch({ type: 'SET_FP', firstPay:  e.target.value}),
    setppi: (token, signer) => store.dispatch({ type: 'SET_TOKEN', token : {token: token, signer: signer}}),
  }
)};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
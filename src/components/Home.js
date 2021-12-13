import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store'

const Home = (props) => {
  const [interval, updateInterval] = useState(props.interval);
  const [fee, updateFee] = useState(props.fee);
  const [payment, updatePayment] = useState(props.payment);

  function handleIntervalChange(e)  {
    store.dispatch({ type: 'SET_INTERVAL', interval:  e.target.value})
    updateInterval(e.target.value)
  }

  function handleFeeChange(e) {
    updateFee(e.target.value)
    store.dispatch({ type: 'SET_FEE', fee:  e.target.value})
  }

  function handlePaymentChange(e) {
    updatePayment(e.target.value)
    store.dispatch({ type: 'SET_PAYMENT', payment:  e.target.value})
  }

  return (
    <div className="home">
        <div>
          <h1 itemProp="headline">Pay Per Interaction</h1>
          <p>Payment cycle in minutes.</p>
          <input type="number" name="interval" value={interval} onChange={handleIntervalChange} pattern="^\d+$" maxLength="3" required autoFocus title="Length of the payment cycle in minutes (numbers only)."/>              
          <p>Each cycle fee in PPI Token.</p>
          <input type="number" name="fee" value={fee} onChange={handleFeeChange} pattern="^\d+$" maxLength="10" required autoFocus title="Payment in PPI tokens per interval."/>             
          <p>Payment Amount in PPI Token.</p>
          <input type="number" name="first" value={payment} onChange={handlePaymentChange} pattern="^\d+$" maxLength="10" required autoFocus title="First Payment in PPI tokens."/>               
          <p>Please enter a room name.</p>
          <input type="text" name="room" value={ props.roomId } onChange={props.handleIdChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>

          <Link className="primary-button" to={ '/r/' + props.roomId }>Start/Join</Link>
          <Link className="primary-button" to={ '/r/' + props.defaultRoomId }>Random</Link>
          { props.rooms.length !== 0 && <div>Recently used rooms:</div> }
          { props.rooms.map(room => <Link key={room} className="recent-room" to={ '/r/' + room }>{ room }</Link>) }
        </div>
    </div>
    );
}

Home.propTypes = {
  handleIdChange: PropTypes.func.isRequired,
  defaultRoomId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  rooms: PropTypes.array.isRequired
};

const mapStateToProps = store => {
  return {rooms: store.rooms};
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const state = store.getState();

  return (
  {
    fee: state.fee,
    interval: state.interval,
    payment: state.payment,
  }
)};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
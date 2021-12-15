import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store'

const Switch = ({ isOn, handleToggle, onColor }) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        style={{ background: isOn && onColor }}
        className="react-switch-label"
        htmlFor={`react-switch-new`}
      >{isOn ? (<span style={{padding: '5px'}}>Broadcaster</span>) : (<span style={{position: 'absolute', right: '0px', padding: '5px'}}>Viewr</span>)}
        <span className={`react-switch-button`} />
      </label>
    </>
  );
};

const Home = (props) => {
  const [interval, updateInterval] = useState(props.interval);
  const [fee, updateFee] = useState(props.fee);
  const [payment, updatePayment] = useState(props.payment);
  const [chatID, updateChatID] = useState('');  
  const [isBroadcaster, updateIsBroadcaster] = useState(false);

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

  function handleChatIDChange(e) {
    updateChatID(e.target.value)
    store.dispatch({ type: 'SET_CHATID', chatid:  e.target.value})
  }

  function handleRoleChange(e) {
    updateIsBroadcaster(!isBroadcaster);
  }

  return (
    <div className="home">
        <div>
          <h1 itemProp="headline">Pay Per Interaction</h1>
          <label>
            <Switch isOn={isBroadcaster} onColor="#cF678F"  handleToggle={handleRoleChange}/>
          </label>
          {isBroadcaster ? (
            <div className="ibox">
              <p>Payment cycle in minutes.</p>
              <input type="number" name="interval" value={interval} onChange={handleIntervalChange} pattern="^\d+$" maxLength="3" required autoFocus title="Length of the payment cycle in minutes (numbers only)."/> 
              <p>Each cycle fee in PPI Token.</p>
              <input type="number" name="fee" value={fee} onChange={handleFeeChange} pattern="^\d+$" maxLength="10" required autoFocus title="Payment in PPI tokens per interval."/>             
            </div>
            ) : (
            <div className="ibox">
              <p>I'm Willing to Pay</p>              
              <input type="number" name="first" value={payment} onChange={handlePaymentChange} pattern="^\d+$" maxLength="10" required autoFocus title="sweet tokens"/>               
              <p>Ensure authenticity with chat id</p>              
              <input type="text" name="chatid" value={chatID} onChange={handleChatIDChange} maxLength="50" autoFocus title="Ensure authenticity with chat id"/>               
            </div>
            )}
          <p>Please enter a room name.</p>
          <input type="text" name="room" value={ props.roomId } onChange={props.handleIdChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>

          <Link className="primary-button" to={ '/r/' + props.roomId }>Start/Join</Link>
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
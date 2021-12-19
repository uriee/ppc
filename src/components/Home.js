import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Switch = ({ isOn, handleToggle, onColor }) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
        style={{marginTop: '30px'}}
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
  const [chatID, updatechatID] = useState('');  
  const [isBroadcaster, updateIsBroadcaster] = useState(props.isBroadcaster);

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

  function handlechatIDChange(e) {
    updatechatID(e.target.value)
    store.dispatch({ type: 'SET_CHATID', chatID:  e.target.value})
  }

  function handleRoleChange(e) {
    store.dispatch({ type: 'SET_ISBROADCASTER', isBroadcaster:  !isBroadcaster})
    updateIsBroadcaster(!isBroadcaster);
  }

  return (

    <div className="home">
        <div>
          <h1 itemProp="headline">Pay Per Chat</h1>
          <h1 itemProp="headline">using the PPC token</h1>
          <ToastContainer />
          <p>Please enter a room name.</p>
          <input type="text" name="room" value={ props.roomId } onChange={props.handleIdChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>

          <p>
            <Switch isOn={isBroadcaster} onColor="#cF678F"  handleToggle={handleRoleChange}/>
          </p>
          {isBroadcaster ? (
            <div className="ibox">
              <span>Duration of each Session</span>
              <input type="number" name="interval" value={interval} onChange={handleIntervalChange} pattern="^\d+$" maxLength="3" required autoFocus title="The durationof the session in minutes."/> 
              <span>Cost of session in PPI Token.</span>
              <input type="number" name="fee" value={fee} onChange={handleFeeChange} pattern="^\d+$" maxLength="10" required autoFocus title="Payment in PPI tokens per Session."/>             
            </div>
            ) : (
            <div className="ibox">
              <span>I'm Willing to Pay</span> <br/>             
              <span>(no lower then the requested fee)</span>
              <input type="number" name="first" value={payment} onChange={handlePaymentChange} pattern="^\d+$" maxLength="10" required autoFocus title="tokens"/>               
              <span>Ensure authenticity with chat id</span>              
              <input type="text" name="chatID" value={chatID} onChange={handlechatIDChange} maxLength="50" autoFocus title="Ensure authenticity with chat id"/>               
            </div>
            )}

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
    isBroadcaster: state.isBroadcaster
  }
)};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
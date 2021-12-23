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
       // style={{marginTop: '30px',marginBottom: '30px'}}
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


  useEffect(() => {
    const pageloader = document.getElementById('pageloader');
    const infraloader = document.getElementById('infraloader');
    pageloader.classList.toggle('is-active');
    var pageloaderTimeout = setTimeout(function () {
        infraloader.classList.remove('is-active');
        pageloader.classList.toggle('is-active');
        clearTimeout(pageloaderTimeout);
    }, 1200); 
  }, []);
 

  return (
    <div className="home">
          <div id="pageloader" class="pageloader is-left-to-right is-theme"></div>
          <div id="infraloader" class="infraloader is-active"></div>
        <div>
          <h1 className="title is-1 is-light is-semibold is-spaced main-title">Pay Per Chat</h1>
          <h1 className="subtitle is-5 is-light is-thin">using the PPC token</h1>
          <ToastContainer />


          <form className="contact-form">

            <div className="control-material is-secondary">      
                <input type="text" name="room" value={ props.roomId } onChange={props.handleIdChange} pattern="^\w+$" maxLength="10" required autoFocus title="Room name should only contain letters or numbers."/>
                <span className="material-highlight"></span>
                <span className="bar"></span>
                <label>Room Name.</label>
            </div>

            <p  >
              <Switch  isOn={isBroadcaster} onColor="#cF678F"  handleToggle={handleRoleChange}/>
            </p>
            
            {isBroadcaster ? (
              <div>
              <div className="control-material is-secondary">
                  <input type="number" name="interval" value={interval} onChange={handleIntervalChange} pattern="^\d+$" maxLength="3" required autoFocus title="The durationof the session in minutes."/>       
                  <span className="material-highlight"></span>
                  <span className="bar"></span>
                  <label>Duration of each Session</label>
              </div>

              <div className="control-material is-secondary"> 
                  <input type="number" name="fee" value={fee} onChange={handleFeeChange} pattern="^\d+$" maxLength="10" required autoFocus title="Payment in PPI tokens per Session."/> 
                  <span className="material-highlight"></span>
                  <span className="bar"></span>
                  <label>Cost of session in PPI Token. </label>
              </div>
              </div>
              ) : (
              <div>
              <div className="control-material is-secondary">      
                  <input type="number" name="payment" value={payment} onChange={handlePaymentChange} pattern="^\d+$" maxLength="10" required autoFocus title="tokens"/>
                  <span className="material-highlight"></span>
                  <span className="bar"></span>
                  <label>I'm Willing to Pay</label>
              </div>

              <div className="control-material is-secondary">
              <input type="text" name="chatID" value={chatID} onChange={handlechatIDChange} maxLength="50" autoFocus title="Ensure authenticity with chat id"/>
                  <span className="material-highlight"></span>
                  <span className="bar"></span>
                  <label>Ensure authenticity with chat id </label>
              </div> 
              </div>                                   
              )}  
            <div className="has-text-centered">
                <Link className="button is-button k-button k-primary raised has-gradient is-fat is-bold is-submit" to={ '/r/' + props.roomId }>
                    <span className="text">Start/Join</span>
                    <span className="front-gradient"></span>
                </Link>
            </div>
          </form>
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
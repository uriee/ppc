import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import store from '../store'
import getBlockchain from '../../ethereum.js';
import { toast } from 'react-toastify';

import logo from '../../img/C34Logo.svg';
import logo_svg from '../../img/C34LogodBold.svg';
import token_svg from '../../img/C34TokenBold.svg';
import lock_svg from '../../img/C34LockBold.svg';
import cam_svg from '../../img/C34CamBold.svg';
import clock_svg from '../../img/C34ClockBold.svg';
import x_svg from '../../img/C34x.svg';

function appNavToCreate() {
  document.getElementById('app-welcome-page').style.display = 'none';
  document.getElementById('app-join-page').style.display = 'none';
  document.getElementById('app-create-page').style.display = 'block';
} 

function appNavToJoin() {
  document.getElementById('app-welcome-page').style.display = 'none';
  document.getElementById('app-create-page').style.display = 'none';
  document.getElementById('app-join-page').style.display = 'block';
} 

function appNavToWelcome() {
  document.getElementById('app-join-page').style.display = 'none';
  document.getElementById('app-create-page').style.display = 'none';
  document.getElementById('app-welcome-page').style.display = 'block';
} 

const Home = (props) => {
  const globalState = store.getState();

  const [interval, updateInterval] = useState(globalState.interval);
  const [fee, updateFee] = useState(globalState.fee);
  const [payment, updatePayment] = useState(globalState.payment);
  const [chatID, updatechatID] = useState(globalState.chatID);  
  const [roomID, updateroomID] = useState(globalState.roomID);   


  function handleroomIDChange(e) {
    updateroomID(e.target.value)
    store.dispatch({ type: 'SET_ROOMID', roomID:  e.target.value})
  }


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

  useEffect(() => {
    const init = async () => {
      let { ppcToken } = await getBlockchain(toast).catch((x) => ({ppcToken : 0}));

      if(!ppcToken){
        toast.error(`No wallet Detected`)
        await new Promise(resolve => setTimeout(resolve, 4000));
        location.href = 'https://cryptomeet.me/'
      }else{
        toast("Wallet Connected :)")
      }

    };
    init(); 
    if (props.byLink) appNavToJoin();
  }, []);


  return (

 
    <div id="app-demo-main">
        <div id="app-demo-contant">
            <div id="app-welcome-page">

                <img id="app-welcome-logo" src={logo} alt=""/>
                <p id="app-welcome-title" className="is-app-front-text">Crypro Meet Me</p>
                <p id="app-welcome-subtitle" className="is-app-front-text">private. direct pay. video chat.</p>

                <button className="app-welcome-button is-app-front-text" onClick={appNavToCreate}>Create a Meeting</button>
                <div id="join-text-line">
                <p id="app-welcome-or-text" className="is-app-front-text">or click <span id="app-join-a-meeting" onClick={appNavToJoin}>join a meeting</span> by meeting ID or meeting Name.</p>
                </div>
            </div>

            <div id="app-create-page">
                <img className="app-cancel-button" onClick={appNavToWelcome} src={x_svg}></img>
                <p className="app-page-title is-app-front-text">Create a Meeting</p>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={logo_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">Meeting Name</p>
                        <input id="create-meeting-name-input" name="room" value={ roomID } onChange={handleroomIDChange} pattern="^\w+$" maxLength="10" required autoFocus  type="text" className="app-field-input" placeholder="Please enter a meeting name..."/>				
                    </div>
                </div>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={token_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">Minimal meeting fee</p>
                        <input id="create-meeting-charge-input" name="fee" value={fee} onChange={handleFeeChange} pattern="^\d+$" maxLength="10" required  type="number" className="app-field-input" placeholder="Please enter meeting fee in CTMs"/>				
                    </div>							
                </div>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={clock_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">Meeting duration</p>
                        <input id="create-meeting-duration-input" type="number" name="interval" value={interval} onChange={handleIntervalChange} pattern="^\d+$" maxLength="3" required className="app-field-input" placeholder="Please enter meeting duration"/>				
                    </div>
                </div>

                <div id="app-create-button-container">
        
                <div className="app-field-icon-container">
                        <img className="app-field-icon" src={lock_svg} alt=""/>
                    </div>
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={cam_svg} alt=""/>
                    </div>
                    <Link className="app-action-button is-app-front-text" to={ '/r/' + roomID }>Start</Link>                      

                </div>
    
            </div>
            <div id="app-join-page">
                {!props.byLink &&<img className="app-cancel-button" onClick={appNavToWelcome} src={x_svg}></img>}   
                <p className="app-page-title is-app-front-text">Join a Meeting</p>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={logo_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">Meeting Name</p>
                        <input id="join-meeting-name-input"  name="room" value={ roomID } onChange={handleroomIDChange} pattern="^\w+$" maxLength="10" required type="text" className="app-field-input" placeholder="Please enter a meeting name..."/>				
                    </div>
                </div>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={token_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">I am willin to pay</p>
                        <input id="join-meeting-pay-input" name="payment" value={payment} onChange={handlePaymentChange} pattern="^\d+$" maxLength="10" required type="number" className="app-field-input" placeholder="Please enter payment in CTMs"/>				
                    </div>							
                </div>

                <div className="app-field-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={lock_svg} alt=""/>
                    </div>

                    <div className="app-field-text-container">
                        <p className="app-field-title">Meeting ID</p>
                        <input id="join-meeting-id-input" name="chatID" value={chatID} onChange={handlechatIDChange} maxLength="50" type="text" className="app-field-input" placeholder="sequre with meeting ID"/>				
                    </div>
                </div>

                <div id="app-join-button-container">
                    <div className="app-field-icon-container">
                        <img className="app-field-icon" src={cam_svg} alt=""/>
                    </div>
                    <div></div>
                        <Link  to={ '/r/' + roomID } className="app-action-button is-app-front-text" >Join</Link>
                </div>
    
            </div>
        </div>
        <div id="app-footer">
            <div id="app-footer-contant">
                <div className="footer-links">

                        <a className="app-footer-link" href="#">Buy CTMs</a>
        
                        <a className="app-footer-link" href="#">Site</a>

                        <a className="app-footer-link" href="#">Help</a>
        
                </div>
            </div>
        </div>
    </div>   
     
    );
}

export default Home;
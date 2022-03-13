import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';
import ToggleFullScreen from './ToggleFullScreen';
import store from '../store'

import done_svg from '../../img/done.svg';
//import alone_svg from '../../img/alone.svg';
import progress_svg from '../../img/C32CtmLogoProgressIndicator.svg';

const Timer = ({ minutes }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    if (!timeLeft) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return (
    <div>
      <h1>{parseInt(timeLeft/60)} : {timeLeft%60}</h1>
    </div>
  );
};


const Communication = props => {
  const {fee, owner} = store.getState();
  const url = window.location.href.replace('/r/','/secure/')
  const link = `${url}/${fee}/${props.sid}`


  const sendJoinRequest = () => 0
  const getTheMoney = () => 0
  const ernerDecline = () => 0
  const copyLink = () => {alert("link copy")}

  const earner = () => (<div id="earnerChet" className="chat">

  <div className="chatTitleContainer">
    <p className="chatTitle">Welcome Earner</p>
  </div>
  
  <div id="eStage1" className="chatStage isActive">
    <div className="stageContent">
      <img className="stageProgress"/>
      <p className="stageTitle">Share meeting link</p>
      <p className="stageSubtitle">publishing the meeting link. let spenders reach you.</p>
      <p id="meetingLink" className="stageSubtitle">{link}</p>
      <button className="stageActionButton" onClick={copyLink}>Copy meeting link</button>
    </div>
  </div>
  
  <div id="eStage2" className="chatStage">
  <div className="stageContent">
    <img className="stageProgress"/> 
    <p className="stageTitle">Spender Transfering CTMs</p>
    <p className="stageDoneTitle">Money is on the table</p>
  </div> 
  </div>
  <div id="eStage3" className="chatStage">
  <div className="stageContent">
    <img className="stageProgress"/>
    <p className="stageTitle">Accept payment and Start meeting</p>
  
    <p className="stageSubtitle" >Spender say:</p>
    <p id="earnerSpendrMessage" className="stageSubtitle"></p>
  
    <p className="stageSubtitle" >Spender is willing to pay:</p>
    <p id="earnerSpenderPayment" className="stageSubtitle"></p>
  
    <p className="stageInfo">You can accept or decline the offer.</p>
  
  
    <button className="stageActionButton" onClick={getTheMoney}>Accept & Start</button>
    <button className="stageActionButton" onClick={ernerDecline}>Decline</button>
    <p className="stageDoneTitle">Payment Accepted</p>
  </div>
  </div>
  <div id="earnerMMActionNeeded" className="chatStage">
  <div className="stageContent">
    <img className="stageProgress"/>
    <p className="stageTitle">Meta Mask Confermation</p>
    <p className="stageSubtitle">plaese confirm the transaction on Meta Mask</p>
    <p className="stageDoneTitle">CTMs transaction confirmed</p>
  </div>
  </div>
  <div id="eStage4" className="chatStage">
  <div className="stageContent">
    <img className="stageProgress"/>
    <p className="stageTitle">Transfering CTMs to Earner</p>
    <p className="stageDoneTitle">Payment complited - Strating the meeting...</p>
  </div> 
  </div>
  
  </div>)
  
  const spender = () => (
    <div id="spenderChat"  className="chat">
        <div className="chatTitleContainer">
          <p className="chatTitle">Welcome Spender</p>
        </div>
  
        <div id="sStage1" classNmae="chatStage isActive">
          <div className="stageContent">
            <img className="stageProgress"/>
            <p className="stageTitle">Massage Payment</p>
            <p className="stageSubtitle" >Please send short message.<br/><br/>
            Earner will get:<br/>
            - The massage<br/>
            - Your willing to pay value: 500 CTMs</p>
            <p className="stageInfo">Earner can accept or decline your offer.</p>
            <input id="spenderMessage" type="text" className="comTextInput" placeholder="Enter short message"/>				
            <Button className="stageActionButton" onClick={sendJoinRequest}>Send Payment and Message</Button>
            <p className="stageDoneTitle">Massage Payment</p>          
          </div>
        </div>  
        <div id="spenderMMActionNeeded" className="chatStage mmActionNeeded">
          <div className="stageContent">
            <img className="stageProgress"/>
            <p className="stageTitle">Meta Mask Confermation</p>
            <p className="stageSubtitle">plaese confirm the transaction on Meta Mask</p>
            <p className="stageDoneTitle">CTMs transaction confirmed</p>
          </div>
        </div> 
        <div id="sStage2" className="chatStage">
          <div className="stageContent">
            <img className="stageProgress"/>
            <p className="stageTitle">Transfering CTMs</p>
            <p className="stageDoneTitle">Money is on the table</p>
          </div> 
        </div>
        <div id="sStage4" className="chatStage">
          <div className="stageContent">
            <img className="stageProgress"/>
            <p className="stageTitle">Transfering CTMs to Earner</p>
            <p className="stageDoneTitle">Payment complited - strating the meeting...</p>
          </div> 
        </div>      
        <div id="sStage3" className="chatStage">
          <div className="stageContent">
            <img className="stageProgress"/>
            <p className="stageTitle">Wating for Earner to accept the payment.</p>
            <p className="stageSubtitle">Earner can decline and...</p>
            <p className="stageDoneTitle">Earner confirm the payment</p>
          </div> 
        </div>           
    </div>
  )

  return (
      <div className="auth">
        {owner ? earner() : earner()}
        <div className="media-controls">
          <Link className="call-exit-button" to="/" onClick={props.handleHangup}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"  className="svg">
              <path d="M30 16.5h-18.26l8.38-8.38-2.12-2.12-12 12 12 12 2.12-2.12-8.38-8.38h18.26v-3z" fill="white"/>
            </svg>
          </Link>
          <button onClick={props.shareScreen} className={'hangup-button'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" className="svg">
              <path d="M6.746704,4 L10.2109085,4 C10.625122,4 10.9609085,4.33578644 10.9609085,4.75 C10.9609085,5.12969577 10.6787546,5.44349096 10.312679,5.49315338 L10.2109085,5.5 L6.746704,5.5 C5.55584001,5.5 4.58105908,6.42516159 4.50189481,7.59595119 L4.496704,7.75 L4.496704,17.25 C4.496704,18.440864 5.42186559,19.4156449 6.59265519,19.4948092 L6.746704,19.5 L16.247437,19.5 C17.438301,19.5 18.4130819,18.5748384 18.4922462,17.4040488 L18.497437,17.25 L18.497437,16.752219 C18.497437,16.3380054 18.8332234,16.002219 19.247437,16.002219 C19.6271328,16.002219 19.940928,16.2843728 19.9905904,16.6504484 L19.997437,16.752219 L19.997437,17.25 C19.997437,19.2542592 18.4250759,20.8912737 16.4465956,20.994802 L16.247437,21 L6.746704,21 C4.74244483,21 3.10543026,19.4276389 3.00190201,17.4491586 L2.996704,17.25 L2.996704,7.75 C2.996704,5.74574083 4.56906505,4.10872626 6.54754543,4.00519801 L6.746704,4 L10.2109085,4 L6.746704,4 Z M14.5006976,6.54430631 L14.5006976,3.75 C14.5006976,3.12602964 15.20748,2.7899466 15.6876724,3.13980165 L15.7698701,3.20874226 L21.7644714,8.95874226 C22.0442311,9.22708681 22.0696965,9.65811353 21.8408438,9.95607385 L21.7645584,10.0411742 L15.7699571,15.7930263 C15.3196822,16.2250675 14.5877784,15.9476738 14.5078455,15.3589039 L14.5006976,15.2518521 L14.5006976,12.4499835 L14.1799379,12.4437673 C11.5224061,12.4359053 9.2508447,13.5269198 7.31506917,15.745002 C6.81945864,16.3128907 5.88979801,15.876896 6.00952162,15.1327229 C6.83651469,9.99233371 9.60859008,7.08827771 14.1987622,6.57442791 L14.5006976,6.54430631 L14.5006976,3.75 L14.5006976,6.54430631 Z" fill="white" ></path>
            </svg>
          </button>      
          <button onClick={props.toggleAudio} className={'audio-button-' + props.audio}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="svg">
              <path className="on" d="M38 22h-3.4c0 1.49-.31 2.87-.87 4.1l2.46 2.46C37.33 26.61 38 24.38 38 22zm-8.03.33c0-.11.03-.22.03-.33V10c0-3.32-2.69-6-6-6s-6 2.68-6 6v.37l11.97 11.96zM8.55 6L6 8.55l12.02 12.02v1.44c0 3.31 2.67 6 5.98 6 .45 0 .88-.06 1.3-.15l3.32 3.32c-1.43.66-3 1.03-4.62 1.03-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c1.81-.27 3.53-.9 5.08-1.81L39.45 42 42 39.46 8.55 6z" fill="white"></path>
              <path className="off" d="M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z" fill="white"></path>
            </svg>
          </button>
          <button onClick={props.toggleVideo} className={'video-button-' + props.video}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="svg">
              <path className="on" d="M40 8H15.64l8 8H28v4.36l1.13 1.13L36 16v12.36l7.97 7.97L44 36V12c0-2.21-1.79-4-4-4zM4.55 2L2 4.55l4.01 4.01C4.81 9.24 4 10.52 4 12v24c0 2.21 1.79 4 4 4h29.45l4 4L44 41.46 4.55 2zM12 16h1.45L28 30.55V32H12V16z" fill="white"></path>
              <path className="off" d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm-4 24l-8-6.4V32H12V16h16v6.4l8-6.4v16z" fill="white"></path>
            </svg>
          </button>
          <button onClick={ToggleFullScreen} className="fullscreen-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="svg">
              <path className="on" d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z" fill="white"></path>
              <path className="off" d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z" fill="white"></path>
            </svg>
          </button>
          <button onClick={props.handleHangup} className="hangup-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="svg">
              <path d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z" fill="white"></path>
            </svg>
          </button>
        </div>
        {props.minutes > 0 && <div className="timer"><Timer minutes={props.minutes} ></Timer></div>}
        <div className="request-access">
          <p><span className="you-left">You hung up.&nbsp;</span>Send a request to the Broadcaster. {props.sid}</p>
          <form onSubmit={props.send}>
            <input type="text" autoFocus onChange={props.handleInput} data-ref="message"  maxLength="30" required placeholder="Hi, I'm John Doe." />
            <button className="primary-button">Send</button>
          </form>
        </div>
        <div className="grant-access">
          <p>User Approved Payment of {props.payment} PPC tokens</p>
          <div>Message: {props.message}</div>
          <button onClick={props.handleInvitation} data-ref="reject" className="primary-button">Reject</button>
          <button onClick={props.handleInvitation} data-ref="accept" className="primary-button">Accept</button>
        </div>
        <div className="room-occupied">
          <p>Please, try another room!</p>
          <Link  className="primary-button" to="/">OK</Link>
        </div>
        <div className="waiting">
          <p><span>Meeting Link:&nbsp;</span><a href={link}>{link}</a> </p>
        </div>
      </div>

  )
}

Communication.propTypes = {
  message: PropTypes.string.isRequired,
  //sid: PropTypes.string.isRequired,
  audio: PropTypes.bool.isRequired,
  video: PropTypes.bool.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleAudio: PropTypes.func.isRequired,
  shareScreen: PropTypes.func.isRequired,
  send: PropTypes.func.isRequired,
  handleHangup: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
  handleInvitation: PropTypes.func.isRequired,
};

export default Communication;


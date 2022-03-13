import React, { useState } from 'react'
import Home from '../components/Home';
import store from '../store'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = props => {
  const params = props.match.params;
  let byLink = 0;

  if (params.room) {
    params.chat_id && store.dispatch({ type: 'SET_CHATID', chatID:  params.chat_id})
    params.fee && store.dispatch({ type: 'SET_FEE', fee:  params.fee})
    params.fee && store.dispatch({ type: 'SET_PAYMENT', payment:  params.fee})
    params.room && store.dispatch({ type: 'SET_ROOMID', roomID:  params.room})
    byLink = 1;
  }

  return (
    <div>
      <ToastContainer/>
      <Home
        byLink={byLink}
      />
    </div>

  );
}

export default HomePage;
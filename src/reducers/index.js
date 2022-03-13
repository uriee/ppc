import { combineReducers } from 'redux';
// Reducers
import roomReducer from './room-reducer';
import audioReducer from './audio-reducer';
import videoReducer from './video-reducer';
import feeReducer from './fee-reducer';
import intervalReducer from './interval-reducer';
import paymentReducer from './payment-reducer';
import chatIDReducer from './chatid-reducer';
import roomIDReducer from './roomid-reducer';
import ownerReducer from './owner-reducer';
import tokenReducer from './token-reducer';

// Combine Reducers
const reducers = combineReducers({
  rooms: roomReducer,
  video: videoReducer,
  audio: audioReducer,
  fee: feeReducer,
  interval: intervalReducer,
  payment: paymentReducer,
  chatID: chatIDReducer,
  roomID: roomIDReducer,  
  owner: ownerReducer,
  token: tokenReducer,
});
export default reducers;

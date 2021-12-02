import { combineReducers } from 'redux';
// Reducers
import roomReducer from './room-reducer';
import audioReducer from './audio-reducer';
import videoReducer from './video-reducer';
import feeReducer from './fee-reducer';
import intervalReducer from './interval-reducer';
import firstPayReducer from './firstpay-reducer';
import tokenReducer from './token-reducer';
// Combine Reducers
const reducers = combineReducers({
  rooms: roomReducer,
  video: videoReducer,
  audio: audioReducer,
  fee: feeReducer,
  interval: intervalReducer,
  firstPay: firstPayReducer,
  token: tokenReducer
});
export default reducers;

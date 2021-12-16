import { createStore } from 'redux';
import reducers from './reducers';
const mapStoreToStorage = () => {
	localStorage.setItem('reduxState', JSON.stringify(store.getState()));
	console.log("store",store.getState())
}
const persistedState = localStorage.getItem('reduxState')
	? JSON.parse(localStorage.getItem('reduxState'))
	: {
		rooms: [],
		video: true,
		audio: true,
		fee: 0,
		interval: 5,
		payment : 0,
		token: {},
		owner: false,
		isBroadcaster: false
	};
const store = createStore(reducers, persistedState);
store.subscribe(mapStoreToStorage);
export default store;

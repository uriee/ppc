import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './containers/HomePage'
import Room from './containers/RoomPage'
import NotFound from './components/NotFound'
import styles from './app.css'
import styles2 from './main.css'

const root = createRoot(document.getElementById('app'));
root.render(
	<Provider store={store}>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/secure/:room/:fee/:chat_id" element={<Home />} />
				<Route path="/r/:room" element={<Room />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	</Provider>
);

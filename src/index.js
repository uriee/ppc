import React from 'react'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import store from './store';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './containers/HomePage'
import Room from './containers/RoomPage'
import NotFound from './components/NotFound'
import styles from './app.css'
import styles2 from './main.css'

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={Home} />
				<Route path="/secure/:room/:fee/:chat_id" component={Home} />
				<Route path="/r/:room" component={Room} />
				<Route path="*" component={NotFound} />
			</Switch>
		</BrowserRouter>
	</Provider>
);

import React from 'react';
//import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
//import { store, history } from './redux/store';
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <App />,
  document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();

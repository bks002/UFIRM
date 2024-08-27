import React from 'react';
import { Provider } from 'react-redux';
import { store, history } from './redux/store';
import MainLayout from './Routing/MainNav';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <MainLayout />
      </Provider>
    </div>
  );
}

export default App;

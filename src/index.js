import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import MessageContainer from './Components/MessageContainer';
import {BrowserRouter, Route} from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <div>
      <Route exact path = '/' component = {App}/>
      <Route path = '/recommendations' render = {() => <MessageContainer/>}/>
    </div>
  </BrowserRouter> ,
  document.getElementById('app'));

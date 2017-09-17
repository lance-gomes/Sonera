import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import SoneraLogo from './Components/SoneraLogo';
import PlaylistContainer from './Components/PlaylistContainer';
import {BrowserRouter, Route} from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <div>
      <Route exact path = '/' component = {App}/>
      <Route path = '/recommendations' render = {() => <PlaylistContainer api = {true}/>}/>
    </div>
  </BrowserRouter> ,
  document.getElementById('app'));

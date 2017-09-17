import React, { Component } from 'react';
import SoneraLogo from './SoneraLogo.js';
import './SoneraLogoContainer.css';

var client_id = '93890ab4495748f8855653bad0ce2e68'; // Your client id
var client_secret = '78c8ab8fa1944786bc230de483841ef3'; // Your secret
var redirect_uri = 'http://localhost:3000/recommendations'; // Your redirect uri
var querystring = require('querystring');

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var randomText = generateRandomString(16);

class SoneraLogoContainer extends Component {
  constructor(){
    super();
    this.state = {
      youtubeLogo : 'youtubeLogoHidden',
      spotifyLogo: 'spotifyLogoHidden'
    };
  }

  getApi() {
    var windowLocation = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: 'user-top-read user-read-private user-read-birthdate user-read-email playlist-modify-public playlist-modify-private',
      redirect_uri: redirect_uri,
      state: randomText
    });

    window.location.replace(windowLocation);
  }

  componentWillMount() {
    setTimeout(()=> {
      this.setState({youtubeLogo: 'youtubeLogo',
        spotifyLogo: 'spotifyLogo'});
      this.props.updateMainTextVisibility('mainTextContainer')
    },1000);
  }

  render() {
    return (
      <div>
        <SoneraLogo/>
        <div className = "platformContainer">
          <a className = {this.state.youtubeLogo}>
          </a>
          <a className = {this.state.spotifyLogo} onClick = {this.getApi.bind(this)}>
           </a>
        </div>
      </div>
    );
  }
}

export default SoneraLogoContainer;

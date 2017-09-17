import React, { Component } from 'react';
import SoneraLogoContainer from './Components/SoneraLogoContainer.js';
import GenericText from './Components/GenericText.js';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      mainTextContainer: 'mainTextContainerBefore' ,
      genericText: ['Welcome To Sonera.', 'Chose a service to explore.']
    };
  }

  updateMainTextVisibility(mainTextVisibility) {
    this.setState({mainTextContainer: mainTextVisibility});
  }

  render() {
    return (
      <div className = "wrapper">
        <div className = "mainContentContainer">
          <SoneraLogoContainer updateMainTextVisibility = {this.updateMainTextVisibility.bind(this)} />
        </div>
        <GenericText mainTextContainer = {this.state.mainTextContainer} text = {this.state.genericText}/>
      </div>
    );
  }
}

export default App;

import React, {Component} from 'react';
import SoneraLogo from './SoneraLogo.js';
import Spinner from './Spinner.js';
import './MessageContainer.css';

class MessageContainer extends Component {

  constructor() {
    super();
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
      fetch('/recommendations').then(() => {
       this.setState({loading: false});
     });
  }

  render() {
    return (
      <div className = "wrapper">
        <div className = "mainContentContainer">
          <SoneraLogo/>
        </div>
          <Spinner loadingState = {this.state.loading}/>
      </div>
    );
  }
}
export default MessageContainer;

import React, {Component} from 'react';
import SoneraLogo from './SoneraLogo.js';
import Spinner from './Spinner.js';
import './PlaylistContainer.css';


class PlaylistContainer extends Component {

  constructor() {
    super();
    this.state = {
      loading: true
    };

  }

  componentWillMount() {
    if(this.props.api) {
      var status;
      fetch('/recommendations').then((response)=>response.json()).then((responseJson) => {
       status = responseJson;
       this.setState({loading: false});
     });
    }
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
export default PlaylistContainer;

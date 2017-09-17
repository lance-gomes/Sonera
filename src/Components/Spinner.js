import React,{Component} from 'react';
import GenericText from './GenericText';
import './PlaylistContainer.css'

class Spinner extends Component {

  constructor() {
    super();
    this.state = {
      loadingText: ['Creating the perfect playlist...'],
      finishedText: ['Sonera playlist added to your spotify!'],
      mainTextContainer: 'mainTextContainer'
    };
  }

  render() {
    return (
      <div>
        <div className = "fadeInAndOut">
          <GenericText mainTextContainer = {this.state.mainTextContainer} text = {this.props.loadingState ? this.state.loadingText : this.state.finishedText}/>
        </div>
        <div className = {this.props.loadingState ? "spinnerContainer" : ""}>
          <div className = {this.props.loadingState ? "loading" : ""}></div>
         </div>
       </div>
    );
  }


}

export default Spinner;

import React,{Component} from 'react';

class GenericText extends Component {
  render() {
    return (
      <div className = "textSection">
        {this.props.text.map((text)=> <h1 className = {this.props.mainTextContainer} key = {text}> {text} </h1>)}
      </div>
    );
  }
}

export default GenericText;

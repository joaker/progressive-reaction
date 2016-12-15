import "./index.scss";
import Messenger from "../messenger";
import React from "react";

// <img src="http://images.macmillan.com/folio-assets/interiors-images/9780374318352.IN08.jpg"/>;


const Dots = () => (
  <div className="dots">
    <img src="/images/dots.jpg"/>;
  </div>
);
const NoDots = () => <div className="noDots"/>;

const Dottable = ({show}) => {
  console.log(`showing? ${show}`)
  var display = show?<Dots/>:<NoDots/>;
  return display;
};
let showDots = false;
export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showDots: false};
  }

  render() {
    return (
      <div>
        <p>Hello, I'm a react component</p>
        <button onClick={() => {
          this.setState({
            showDots: !this.state.showDots,
          });
        }}>GetImage</button>
        <Dottable show={this.state.showDots}/>

      </div>
    );
  }
};

const container = document.getElementById('container');
ReactDOM.render(<App/>, container);

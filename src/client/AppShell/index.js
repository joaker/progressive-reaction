import styles from './index.scss';
import Messenger from '../messenger';
import React from 'react';

import {Button} from 'react-mdl';

// <img src='http://images.macmillan.com/folio-assets/interiors-images/9780374318352.IN08.jpg'/>;


const Dots = () => (
  <div className={styles.dots}>
    <img src='/images/dots.jpg'/>;
  </div>
);
const NoDots = () => <div className={styles.noDots}/>;

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
        <p>Hello, I'm an App Shell.</p>
        <p>If you're seeing this, you can disconnect the server and the cached App Shell will load</p>
        <p><Button className={styles.button} onClick={() => {
          Messenger.send('The display image list was found');
          this.setState({
            showDots: !this.state.showDots,
          });
        }}>Get Image</Button></p>
        <Dottable show={this.state.showDots}/>

      </div>
    );
  }
};

const container = document.getElementById('container');
ReactDOM.render(<App/>, container);

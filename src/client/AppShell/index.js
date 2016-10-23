import "./index.scss";

export const App = () => {
  return <p>Hello, I'm a react component</p>
};

const container = document.getElementById('container');
React.renderComponent(<App/>, container);

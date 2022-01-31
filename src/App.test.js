import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { HashRouter } from 'react-router-dom';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <HashRouter basename={process.env.PUBLIC_URL}>
      <App />
    </HashRouter>
  , div);
  ReactDOM.unmountComponentAtNode(div);
});

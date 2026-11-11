import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Client, cacheExchange, fetchExchange, Provider } from 'urql';
import { HashRouter as Router } from 'react-router-dom'

const { REACT_APP_SERVER_IP, REACT_APP_SERVER_PORT } = import.meta.env

// explicit backend address if configured, otherwise same origin as the page
let graphqlUrl = '/api/graphql'
if (REACT_APP_SERVER_IP) {
  const port = REACT_APP_SERVER_PORT ? ':' + REACT_APP_SERVER_PORT : ''
  graphqlUrl = `http://${REACT_APP_SERVER_IP}${port}/api/graphql`
}

const client = new Client({
  url: graphqlUrl,
  exchanges: [cacheExchange, fetchExchange],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Provider value={client}>
        <App />
      </Provider>   
    </Router>     
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

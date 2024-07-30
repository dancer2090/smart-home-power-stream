import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Client, cacheExchange, fetchExchange, Provider } from 'urql';

const client = new Client({
  url: `http://${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT}/graphql`,
  exchanges: [cacheExchange, fetchExchange],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

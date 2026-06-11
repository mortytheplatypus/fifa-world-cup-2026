import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts.css';
import './index.css';
import App from './App';
import { initializeThemeFromStorage } from './utils/themes';

const root = ReactDOM.createRoot(document.getElementById('root'));

initializeThemeFromStorage().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

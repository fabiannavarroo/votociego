import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './styles/global.css';
import { AppProvider } from './hooks/useAppState';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><AppProvider><App /></AppProvider></HashRouter></React.StrictMode>);
if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* The online app remains available when offline caching is unsupported. */ }); });

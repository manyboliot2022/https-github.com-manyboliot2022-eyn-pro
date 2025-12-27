
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Enregistrement du Service Worker avec détection de mise à jour
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Une nouvelle version est disponible, on recharge la page
                console.log('Nouvelle version détectée, rechargement...');
                window.location.reload();
              }
            }
          };
        }
      };
    }).catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Mount error:", error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

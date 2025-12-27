import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Le conteneur #root est manquant.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erreur lors du rendu initial:", error);
    const errDisplay = document.getElementById('error-display');
    if (errDisplay) {
      errDisplay.style.display = 'block';
      errDisplay.innerHTML = `<h3>Erreur de Montage</h3><p>${error instanceof Error ? error.message : String(error)}</p>`;
    }
  }
};

// On s'assure que le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
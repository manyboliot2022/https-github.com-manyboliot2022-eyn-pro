
import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import CostCalculator from './views/CostCalculator.tsx';
import ProductManager from './views/ProductManager.tsx';
import POS from './views/POS.tsx';
import Finance from './views/Finance.tsx';
import Settings from './views/Settings.tsx';
import { AppMode } from './types.ts';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CALCULATOR);

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CALCULATOR: return <CostCalculator />;
      case AppMode.MANAGER: return <ProductManager />;
      case AppMode.POS: return <POS />;
      case AppMode.FINANCE: return <Finance />;
      case AppMode.SETTINGS: return <Settings />;
      default: return <CostCalculator />;
    }
  };

  const getTitle = () => {
    switch (activeMode) {
      case AppMode.CALCULATOR: return "Calcul Coûts";
      case AppMode.MANAGER: return "Stock & CRM";
      case AppMode.POS: return "Ventes & Devis";
      case AppMode.FINANCE: return "Compta & CA";
      case AppMode.SETTINGS: return "Paramètres";
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode} title={getTitle()}>
      {renderContent()}
    </Layout>
  );
};

export default App;

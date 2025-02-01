// src/pages/index.tsx
import React from "react";

const Main: React.FC = () => {
  // -- Récupération des filtres & data context
  return (
    <div className="container mx-auto p-6">
      {/* Envelopper les contextes nécessaires */}
            {/* Ajoutez d'autres providers si vous avez plus de graphiques d'anomalies */}
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord - Sell-Out</h1>    
    </div>
  );
};

export default Main;
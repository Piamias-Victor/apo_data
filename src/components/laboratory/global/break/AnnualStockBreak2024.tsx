import React from "react";
import DataBlock from "../DataBlock";

interface AnnualStockBreakProps {
  globalBreakProduct: number;
  globalBreakRate: number;
  globalBreakAmount: number;
  globalProductOrder: number;
}

const AnnualStockBreak2024: React.FC<AnnualStockBreakProps> = ({
  globalBreakProduct,
  globalBreakRate,
  globalBreakAmount,
  globalProductOrder,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2024)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier au 31 Décembre 2024</p>
      </div>

      {/* 📦 Contenu en une seule ligne */}
      <div className="grid grid-cols-4 gap-4">
        <DataBlock title="Produits commandés" value={globalProductOrder} />
        <DataBlock title="Produits en rupture" value={globalBreakProduct} />
        <DataBlock title="Taux de rupture" value={globalBreakRate} isPercentage />
        <DataBlock title="Montant rupture" value={globalBreakAmount} isCurrency />
      </div>
    </div>
  );
};

export default AnnualStockBreak2024;
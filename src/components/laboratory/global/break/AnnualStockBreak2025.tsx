import React from "react";
import DataBlock from "../DataBlock";

interface AnnualStockBreakProps {
  totalBreakProduct: number;
  totalBreakRate: number;
  totalBreakAmount: number;
  totalProductOrder: number;
  adjustedBreakProduct2024: number;
  adjustedBreakRate2024: number;
  adjustedBreakAmount2024: number;
  adjustedProductOrder2024: number;
}

const AnnualStockBreak2025: React.FC<AnnualStockBreakProps> = ({
  totalBreakProduct,
  totalBreakRate,
  totalBreakAmount,
  totalProductOrder,
  adjustedBreakProduct2024,
  adjustedBreakRate2024,
  adjustedBreakAmount2024,
  adjustedProductOrder2024,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
      </div>

      {/* 📦 Contenu en une seule ligne */}
      <div className="grid grid-cols-4 gap-4">
        <DataBlock title="Produits commandés" value={totalProductOrder} previousValue={adjustedProductOrder2024} />
        <DataBlock title="Produits en rupture" value={totalBreakProduct} previousValue={adjustedBreakProduct2024} />
        <DataBlock title="Taux de rupture" value={totalBreakRate} previousValue={adjustedBreakRate2024} isPercentage />
        <DataBlock title="Montant rupture" value={totalBreakAmount} previousValue={adjustedBreakAmount2024} isCurrency />
      </div>
    </div>
  );
};

export default AnnualStockBreak2025;
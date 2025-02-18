import React from "react";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface AnnualSummaryProps {
  globalSellOut: number;
  globalRevenue: number;
  globalMargin: number;
  globalSellIn: number;
  globalPurchaseAmount: number;
}

const AnnualSummary2024: React.FC<AnnualSummaryProps> = ({
  globalSellOut,
  globalRevenue,
  globalMargin,
  globalSellIn,
  globalPurchaseAmount,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2024)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier au 31 Décembre 2024</p>
      </div>

      {/* 🟢 Contenu avec deux colonnes */}
      <div className="grid grid-cols-2 gap-8">
        {/* 🔵 SELL-OUT */}
        <div className="border-r border-white pr-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaShoppingCart className="mr-2" /> Sell-Out
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <DataBlock title="Volume" value={globalSellOut} />
            <DataBlock title="CA" value={globalRevenue} isCurrency />
            <DataBlock title="Marge" value={globalMargin} isCurrency />
          </div>
        </div>

        {/* 🟠 SELL-IN */}
        <div className="pl-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaBoxOpen className="mr-2" /> Sell-In
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock title="Volume" value={globalSellIn} />
            <DataBlock title="Montant" value={globalPurchaseAmount} isCurrency />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  isCurrency?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, isCurrency = false }) => {
  return (
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(value, isCurrency)}</p>
      <p className="text-sm opacity-80">{title}</p>
    </div>
  );
};

export default AnnualSummary2024;
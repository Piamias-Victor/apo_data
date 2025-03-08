import React from "react";
import { FaShoppingCart, FaBoxOpen} from "react-icons/fa";
import DataBlock from "../DataBlock";
import PercentageControl from "@/components/ui/PercentageControl";
import SummaryCard from "@/components/ui/SummaryCard";
// Séparation de l'interface en sous-interfaces plus précises
interface ForecastValues {
  sellOut: number;
  revenue: number;
  margin: number;
  sellIn: number;
  purchaseAmount: number;
}

interface ForecastSummaryProps {
  forecastValues: ForecastValues;
  previousYearValues: ForecastValues;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
}

const ForecastSummary2025: React.FC<ForecastSummaryProps> = ({
  forecastValues,
  previousYearValues,
  forecastPercentage,
  setForecastPercentage,
}) => {
  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre & Contrôle du pourcentage */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔮 Prévisions Année 2025
        </h2>

        <PercentageControl 
          value={forecastPercentage}
          onChange={setForecastPercentage}
          min={-100}
          max={100}
        />
      </div>

      {/* Section de prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
        {/* SELL-OUT */}
        <SummaryCard 
          title="Sell-Out"
          icon={<FaShoppingCart className="mr-2" />}
        >
          <div className="grid grid-cols-3 gap-6">
            <DataBlock 
              title="Volume" 
              value={forecastValues.sellOut} 
              previousValue={previousYearValues.sellOut} 
            />
            <DataBlock 
              title="CA" 
              value={forecastValues.revenue} 
              previousValue={previousYearValues.revenue} 
              isCurrency 
            />
            <DataBlock 
              title="Marge" 
              value={forecastValues.margin} 
              previousValue={previousYearValues.margin} 
              isCurrency 
            />
          </div>
        </SummaryCard>

        {/* SELL-IN */}
        <SummaryCard 
          title="Sell-In"
          icon={<FaBoxOpen className="mr-2" />}
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock 
              title="Volume" 
              value={forecastValues.sellIn} 
              previousValue={previousYearValues.sellIn} 
            />
            <DataBlock 
              title="Montant" 
              value={forecastValues.purchaseAmount} 
              previousValue={previousYearValues.purchaseAmount} 
              isCurrency 
            />
          </div>
        </SummaryCard>
      </div>
    </div>
  );
};

export default ForecastSummary2025;
import PercentageControl from "@/components/ui/PercentageControl";
import SummaryCard from "@/components/ui/SummaryCard";
import DataBlock from "../../common/cards/DataBlock";

// Séparation de l'interface en sous-interfaces plus précises
interface BreakValues {
  productOrder: number;
  breakProduct: number;
  breakRate: number;
  breakAmount: number;
}

interface ForecastStockBreakProps {
  forecastValues: BreakValues;
  previousYearValues: BreakValues;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
}

const ForecastStockBreak2025: React.FC<ForecastStockBreakProps> = ({
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
          🔮 Prévisions Ruptures 2025
        </h2>

        <PercentageControl 
          value={forecastPercentage}
          onChange={setForecastPercentage}
          min={-100}
          max={100}
        />
      </div>

      {/* Section des prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6 relative z-10">
        {/* Produits commandés */}
        <SummaryCard title="📦 Produits Commandés" icon={null} iconColor="text-red-600">
          <DataBlock
            title="Total"
            value={forecastValues.productOrder}
            previousValue={previousYearValues.productOrder}
          />
        </SummaryCard>

        {/* Produits en rupture */}
        <SummaryCard title="❌ Produits en Rupture" icon={null} iconColor="text-red-600">
          <DataBlock
            title="Total"
            value={forecastValues.breakProduct}
            previousValue={previousYearValues.breakProduct}
          />
        </SummaryCard>

        {/* Taux de Rupture */}
        <SummaryCard title="📊 Taux de Rupture" icon={null} iconColor="text-red-600">
          <DataBlock
            title="Taux %"
            value={forecastValues.breakRate}
            previousValue={previousYearValues.breakRate}
            isPercentage
          />
        </SummaryCard>

        {/* Montant des Ruptures */}
        <SummaryCard title="💰 Montant Rupture (€)" icon={null} iconColor="text-red-600">
          <DataBlock
            title="Montant"
            value={forecastValues.breakAmount}
            previousValue={previousYearValues.breakAmount}
            isCurrency
          />
        </SummaryCard>
      </div>
    </div>
  );
};

export default ForecastStockBreak2025;
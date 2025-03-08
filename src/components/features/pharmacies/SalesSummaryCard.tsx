// TopPharmaciesCard.tsx

import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { PharmacySalesWithEvolution } from "@/hooks/api/usePharmacySalesData";
import { formatLargeNumber } from "@/libs/formatUtils";
import { FaCrown } from "react-icons/fa";


interface TopPharmaciesCardProps {
  topRevenue: PharmacySalesWithEvolution[];
  topMargin: PharmacySalesWithEvolution[];
  topGrowth: PharmacySalesWithEvolution[];
  loading: boolean;
  error: string | null;
}

// Composant spécifique pour afficher une valeur avec son évolution
const PharmacyDataBlock: React.FC<{
  title: string;
  value: number;
  evolution: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}> = ({ title, value, evolution, isCurrency = false, isPercentage = false }) => {
  // Formatage de la valeur principale
  const formattedValue = isPercentage 
    ? `${value.toFixed(2)}%` 
    : formatLargeNumber(value, isCurrency);
  
  // Formatage de l'évolution
  const formattedEvolution = `${evolution > 0 ? '+' : ''}${evolution.toFixed(2)}%`;
  const evolutionClass = evolution > 0 
    ? "bg-green-400 text-white" 
    : evolution < 0 
      ? "bg-red-400 text-white" 
      : "bg-gray-300 text-gray-700";

  return (
    <div className="text-center">
      <p className="text-xl font-bold">{formattedValue}</p>
      <p className="text-sm opacity-80">{title}</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${evolutionClass}`}>
          {formattedEvolution}
        </span>
      </div>
    </div>
  );
};

const TopPharmaciesCard: React.FC<TopPharmaciesCardProps> = ({
  topRevenue,
  topMargin,
  topGrowth,
  loading,
  error
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  if (loading) return <p className="text-center text-gray-800">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCrown className="text-pink-500" /> Pharmacies Leaders
        </h2>

        {/* Bloc des périodes */}
        <PeriodSelector 
          currentDateRange={dateRange} 
          comparisonDateRange={comparisonDateRange} 
          bgColor="bg-pink-500"
          hoverColor="hover:bg-pink-600"
        />
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-6 relative z-10">
        {/* TOP 3 CA */}
        <SummaryCard 
          title="🏆 Top 3 CA" 
          icon={null} 
          iconColor="text-pink-600"
        >
          <div className="space-y-4">
            {topRevenue.map((pharmacy) => (
              <PharmacyDataBlock 
                key={pharmacy.pharmacy_id} 
                title={pharmacy.pharmacy_name} 
                value={pharmacy.revenue} 
                evolution={pharmacy.evolution.revenue}
                isCurrency 
              />
            ))}
          </div>
        </SummaryCard>

        {/* TOP 3 Marge */}
        <SummaryCard 
          title="💰 Top 3 Marge" 
          icon={null} 
          iconColor="text-pink-600"
        >
          <div className="space-y-4">
            {topMargin.map((pharmacy) => (
              <PharmacyDataBlock 
                key={pharmacy.pharmacy_id} 
                title={pharmacy.pharmacy_name} 
                value={pharmacy.margin} 
                evolution={pharmacy.evolution.margin}
                isCurrency 
              />
            ))}
          </div>
        </SummaryCard>

        {/* Top 3 Progressions en CA */}
        <SummaryCard 
          title="🔥 Top 3 Progressions (CA)" 
          icon={null} 
          iconColor="text-pink-600"
        >
          <div className="space-y-4">
            {topGrowth.map((pharmacy) => (
              <PharmacyDataBlock 
                key={pharmacy.pharmacy_id} 
                title={pharmacy.pharmacy_name} 
                value={pharmacy.evolution.revenue} 
                evolution={pharmacy.evolution.revenue}
                isPercentage 
              />
            ))}
          </div>
        </SummaryCard>
      </div>
    </div>
  );
};

export default TopPharmaciesCard;
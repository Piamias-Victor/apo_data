// components/ui/PeriodSelector.tsx
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PeriodSelectorProps {
  currentDateRange: [Date | null, Date | null];
  comparisonDateRange: [Date | null, Date | null];
  bgColor?: string;
  hoverColor?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  currentDateRange, 
  comparisonDateRange,
  bgColor = "bg-teal-500",
  hoverColor = "hover:bg-teal-600" 
}) => {
  // Formatage des dates
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className={`flex justify-center md:justify-start gap-8 ${bgColor} ${hoverColor} px-4 py-2 rounded-lg text-white shadow-sm relative z-10`}>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase">Période</span>
        <span className="text-sm font-medium">
          {formatDate(currentDateRange[0])} → {formatDate(currentDateRange[1])}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase">Comparaison</span>
        <span className="text-sm font-medium">
          {formatDate(comparisonDateRange[0])} → {formatDate(comparisonDateRange[1])}
        </span>
      </div>
    </div>
  );
};

export default PeriodSelector;
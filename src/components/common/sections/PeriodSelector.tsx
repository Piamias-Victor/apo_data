import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

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
    <motion.div 
      className={`flex justify-center md:justify-start gap-6 ${bgColor} ${hoverColor} px-5 py-3 rounded-xl text-white shadow-lg relative z-10 overflow-hidden transition-all duration-300`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Effet de glassmorphism et gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-white/30"></div>
      
      {/* Période principale */}
      <div className="flex flex-col relative">
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">Période</span>
        <span className="text-sm font-semibold mt-1 flex items-center">
          <span className="w-2 h-2 rounded-full bg-white mr-1.5"></span>
          {formatDate(currentDateRange[0])} → {formatDate(currentDateRange[1])}
        </span>
      </div>
      
      {/* Période de comparaison */}
      <div className="flex flex-col relative">
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">Comparaison</span>
        <span className="text-sm font-semibold mt-1 flex items-center">
          <span className="w-2 h-2 rounded-full bg-white/60 mr-1.5"></span>
          {formatDate(comparisonDateRange[0])} → {formatDate(comparisonDateRange[1])}
        </span>
      </div>
    </motion.div>
  );
};

export default PeriodSelector;
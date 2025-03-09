import { subYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiCalendar, HiXMark, HiCheck, HiArrowPath } from "react-icons/hi2";
import { DateRange } from "react-date-range";
import ActionButton from "../buttons/ActionButton";
import BaseDrawer from "../sections/BaseDrawer";
import { useFilterContext } from "@/contexts/FilterContext";

// Import des styles
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateRangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DateRangeDrawer: React.FC<DateRangeDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters } = useFilterContext();

  // Période principale
  const [mainDateRange, setMainDateRange] = useState([
    {
      startDate: filters.dateRange[0] || new Date(),
      endDate: filters.dateRange[1] || new Date(),
      key: "main",
    },
  ]);

  // Période de comparaison
  const [comparisonDateRange, setComparisonDateRange] = useState([
    {
      startDate: subYears(filters.dateRange[0] || new Date(), 1),
      endDate: subYears(filters.dateRange[1] || new Date(), 1),
      key: "comparison",
    },
  ]);

  // Synchroniser l'état local avec les filtres globaux
  useEffect(() => {
    if (isOpen) {
      setMainDateRange([
        {
          startDate: filters.dateRange[0] || new Date(),
          endDate: filters.dateRange[1] || new Date(),
          key: "main",
        },
      ]);
      
      setComparisonDateRange([
        {
          startDate: filters.comparisonDateRange?.[0] || subYears(filters.dateRange[0] || new Date(), 1),
          endDate: filters.comparisonDateRange?.[1] || subYears(filters.dateRange[1] || new Date(), 1),
          key: "comparison",
        },
      ]);
    }
  }, [isOpen, filters.dateRange, filters.comparisonDateRange]);

  // Appliquer les filtres
  const applyDateFilter = () => {
    setFilters({
      ...filters,
      dateRange: [mainDateRange[0].startDate, mainDateRange[0].endDate],
      comparisonDateRange: [comparisonDateRange[0].startDate, comparisonDateRange[0].endDate],
    });
    onClose();
  };

  // Réinitialiser les filtres
  const clearDateFilter = () => {
    const today = new Date();
    
    setMainDateRange([{ 
      startDate: today, 
      endDate: today, 
      key: "main" 
    }]);
    
    setComparisonDateRange([{ 
      startDate: subYears(today, 1), 
      endDate: subYears(today, 1), 
      key: "comparison" 
    }]);
    
    setFilters({ 
      ...filters, 
      dateRange: [today, today], 
      comparisonDateRange: [subYears(today, 1), subYears(today, 1)] 
    });
    
    onClose();
  };

  // Appliquer directement la période correspondante de N-1
  const applyLastYear = () => {
    if (!mainDateRange[0].startDate || !mainDateRange[0].endDate) return;
    
    setComparisonDateRange([
      {
        startDate: subYears(mainDateRange[0].startDate, 1),
        endDate: subYears(mainDateRange[0].endDate, 1),
        key: "comparison",
      },
    ]);
  };

  // Formatage pour affichage de dates au format court
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "--/--/--";
    return format(date, "dd/MM/yy");
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sélection de période"
      width="w-96"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
            {/* Résumé des dates sélectionnées */}
            <div className="flex flex-row justify-between rounded-lg bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 p-3">
              <div className="flex-1 flex flex-col items-center border-r border-blue-100 pr-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Principale</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDateDisplay(mainDateRange[0].startDate)} → {formatDateDisplay(mainDateRange[0].endDate)}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center pl-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Comparaison</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDateDisplay(comparisonDateRange[0].startDate)} → {formatDateDisplay(comparisonDateRange[0].endDate)}
                </div>
              </div>
            </div>

            {/* Sélection de la période principale */}
            <div className="space-y-2">
              <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
                <HiCalendar className="text-teal-500" />
                Période principale
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <DateRange
                  ranges={mainDateRange}
                  onChange={(ranges) => {
                    if (ranges.main) setMainDateRange([ranges.main]);
                  }}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#0ea5e9"]} // sky-500
                  months={1}
                  direction="vertical"
                  locale={fr}
                  className="overflow-hidden"
                />
              </div>
            </div>

            {/* Sélection de la période de comparaison */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
                  <HiCalendar className="text-orange-500" />
                  Période de comparaison
                </h4>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={applyLastYear}
                  className="flex items-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-colors"
                >
                  <HiArrowPath className="text-gray-500" size={14} />
                  Appliquer N-1
                </motion.button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <DateRange
                  ranges={comparisonDateRange}
                  onChange={(ranges) => {
                    if (ranges.comparison) setComparisonDateRange([ranges.comparison]);
                  }}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#f97316"]} // orange-500
                  months={1}
                  direction="vertical"
                  locale={fr}
                  className="overflow-hidden"
                />
              </div>
            </div>
            
            {/* Espace pour éviter que le footer ne masque du contenu */}
            <div className="h-16"></div>
          </div>
        </div>

        {/* Footer avec boutons d'action */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-auto">
          <div className="flex justify-between">
            <ActionButton
              onClick={clearDateFilter}
              icon={<HiXMark />}
              variant="danger"
            >
              Réinitialiser
            </ActionButton>

            <ActionButton
              onClick={applyDateFilter}
              icon={<HiCheck />}
              variant="success"
            >
              Appliquer
            </ActionButton>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
};

export default DateRangeDrawer;
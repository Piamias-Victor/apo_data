import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaCalendarMinus } from "react-icons/fa";
import { DateRange } from "react-date-range";
import { subYears } from "date-fns";
import { fr } from "date-fns/locale";
import { useFilterContext } from "@/contexts/FilterContext";
import BaseDrawer from "@/components/ui/BaseDrawer";
import ActionButton from "@/components/ui/buttons/ActionButton";

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

  const footerContent = (
    <div className="flex flex-col gap-3">
      <div className="w-[50%]">
        <ActionButton
        onClick={applyLastYear}
        icon={<FaCalendarMinus />}
        variant="warning"
      >
        Appliquer N-1
      </ActionButton>
      </div>

      <div className="flex justify-between">
        <ActionButton
          onClick={clearDateFilter}
          icon={<FaTimes />}
          variant="danger"
        >
          Réinitialiser
        </ActionButton>

        <ActionButton
          onClick={applyDateFilter}
          icon={<FaCheck />}
          variant="success"
        >
          Appliquer
        </ActionButton>
      </div>
    </div>
  );

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sélectionner une période"
      width="w-96"
      footer={footerContent}
    >
      <div className="space-y-6">
        {/* Sélection de la période principale */}
        <h4 className="text-md font-medium text-gray-700 mb-2">Période principale</h4>
        <DateRange
          ranges={mainDateRange}
          onChange={(ranges) => {
            if (ranges.main) setMainDateRange([ranges.main])
          }}
          moveRangeOnFirstSelection={false}
          rangeColors={["#2563eb"]}
          months={1}
          direction="vertical"
          locale={fr}
          className="rounded-lg"
        />

        {/* Sélection de la période de comparaison */}
        <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">Période de comparaison</h4>
        <DateRange
          ranges={comparisonDateRange}
          onChange={(ranges) => {
            if (ranges.comparison) setComparisonDateRange([ranges.comparison])
          }}
          moveRangeOnFirstSelection={false}
          rangeColors={["#ff5722"]}
          months={1}
          direction="vertical"
          locale={fr}
          className="rounded-lg"
        />
      </div>
    </BaseDrawer>
  );
};

export default DateRangeDrawer;
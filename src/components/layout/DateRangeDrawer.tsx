import React, { useState } from "react";
import { FaTimes, FaCheck, FaHistory, FaCalendarMinus } from "react-icons/fa";
import { DateRange } from "react-date-range";
import { format, subMonths, subWeeks, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";

interface DateRangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DateRangeDrawer: React.FC<DateRangeDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters } = useFilterContext();

  // 🟢 Période principale
  const [mainDateRange, setMainDateRange] = useState([
    {
      startDate: filters.dateRange[0] || new Date(),
      endDate: filters.dateRange[1] || new Date(),
      key: "main",
    },
  ]);

  // 🔵 Période de comparaison (année précédente par défaut)
  const [comparisonDateRange, setComparisonDateRange] = useState([
    {
      startDate: subYears(filters.dateRange[0] || new Date(), 1),
      endDate: subYears(filters.dateRange[1] || new Date(), 1),
      key: "comparison",
    },
  ]);

  // 📌 Appliquer les filtres
  const applyDateFilter = () => {
    setFilters({
      ...filters,
      dateRange: [mainDateRange[0].startDate, mainDateRange[0].endDate],
      comparisonDateRange: [comparisonDateRange[0].startDate, comparisonDateRange[0].endDate],
    });
    onClose();
  };

  // 🧹 Réinitialiser les filtres
  const clearDateFilter = () => {
    setMainDateRange([{ startDate: null, endDate: null, key: "main" }]);
    setComparisonDateRange([{ startDate: null, endDate: null, key: "comparison" }]);
    setFilters({ ...filters, dateRange: [null, null], comparisonDateRange: [null, null] });
    onClose();
  };

  // 🔄 Appliquer la période précédente automatiquement (corrigé)
  const applyPreviousPeriod = () => {
    const start = mainDateRange[0].startDate;
    const end = mainDateRange[0].endDate;

    if (!start || !end) return;

    let newStart, newEnd;

    const daysDifference = differenceInDays(end, start);

    // Si la période est un mois entier, on prend le mois précédent
    if (startOfMonth(start).getTime() === start.getTime() && endOfMonth(end).getTime() === end.getTime()) {
      newStart = subMonths(start, 1);
      newEnd = subMonths(end, 1);
    }
    // Si la période est une semaine entière, on prend la semaine précédente
    else if (startOfWeek(start, { weekStartsOn: 1 }).getTime() === start.getTime() &&
             endOfWeek(end, { weekStartsOn: 1 }).getTime() === end.getTime()) {
      newStart = subWeeks(start, 1);
      newEnd = subWeeks(end, 1);
    }
    // Sinon, on soustrait le même nombre de jours pour garder la durée identique
    else {
      newStart = new Date(start);
      newEnd = new Date(end);
      newStart.setDate(start.getDate() - (daysDifference + 1));
      newEnd.setDate(end.getDate() - (daysDifference + 1));
    }

    setComparisonDateRange([{ startDate: newStart, endDate: newEnd, key: "comparison" }]);
  };

  // 🟠 Appliquer directement la période correspondante de N-1
  const applyLastYear = () => {
    setComparisonDateRange([
      {
        startDate: subYears(mainDateRange[0].startDate, 1),
        endDate: subYears(mainDateRange[0].endDate, 1),
        key: "comparison",
      },
    ]);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-800">Sélectionner une période</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 🔹 Sélection de la période principale */}
          <h4 className="text-md font-medium text-gray-700 mb-2">Période principale</h4>
          <DateRange
            ranges={mainDateRange}
            onChange={(ranges) => setMainDateRange([ranges.main])}
            moveRangeOnFirstSelection={false}
            rangeColors={["#2563eb"]}
            months={1}
            direction="vertical"
            locale={fr}
            className="rounded-lg"
          />

          {/* 🔹 Sélection de la période de comparaison */}
          <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">Période de comparaison</h4>
          <DateRange
            ranges={comparisonDateRange}
            onChange={(ranges) => setComparisonDateRange([ranges.comparison])}
            moveRangeOnFirstSelection={false}
            rangeColors={["#ff5722"]}
            months={1}
            direction="vertical"
            locale={fr}
            className="rounded-lg"
          />
        </div>

        {/* 🎯 Actions fixes en bas */}
        
<div className="p-4 border-t bg-white sticky bottom-0 z-10 flex flex-col gap-3">
  {/* Bouton Appliquer N-1 */}
  <motion.button
    onClick={applyLastYear}
    className="flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-500 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-orange-100 transition"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <FaCalendarMinus />
    Appliquer N-1
  </motion.button>

  {/* Bouton Appliquer Période Précédente */}
  {/* <motion.button
    onClick={applyPreviousPeriod}
    className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-600 border border-yellow-500 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-yellow-100 transition"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <FaHistory />
    Appliquer la période précédente
  </motion.button> */}

  {/* Boutons Réinitialiser et Appliquer */}
  <div className="flex justify-between">
    {/* Bouton Réinitialiser */}
    <motion.button
      onClick={clearDateFilter}
      className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-500 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaTimes />
      Réinitialiser
    </motion.button>

    {/* Bouton Appliquer */}
    <motion.button
      onClick={applyDateFilter}
      className="flex items-center gap-2 bg-teal-50 text-teal-600 border border-teal-500 px-4 py-2 rounded-md text-sm shadow-sm transition hover:bg-teal-100"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaCheck />
      Appliquer
    </motion.button>
  </div>
</div>
      </div>
    </>
  );
};

export default DateRangeDrawer;
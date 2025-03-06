import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCalendarAlt, FaStore, FaListAlt, FaTags } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import clsx from "clsx";

// 📌 Icônes pour chaque filtre
const filterIcons: Record<string, JSX.Element> = {
  pharmacies: <FaStore className="text-purple-600" />,
  categories: <FaListAlt className="text-orange-600" />,
  distributors: <FaTags className="text-green-600" />,
  brands: <FaTags className="text-blue-600" />,
  dateRange: <FaCalendarAlt className="text-teal-600" />,
};

const FilterSummary: React.FC = () => {
  const { filters, setFilters } = useFilterContext();

  // ✅ Supprime un filtre spécifique
  const removeFilter = (key: keyof typeof filters, value?: string) => {
    if (Array.isArray(filters[key])) {
      setFilters({ [key]: (filters[key] as string[]).filter((item) => item !== value) });
    } else {
      setFilters({ [key]: null });
    }
  };

  // 📌 Formate les dates
  const formatDateRange = (range: [Date | null, Date | null]) => {
    if (!range[0] || !range[1]) return "Sélectionner une période";
    return `${format(range[0], "dd MMM yyyy", { locale: fr })} → ${format(range[1], "dd MMM yyyy", { locale: fr })}`;
  };

  // ✅ Liste des filtres actifs
  const activeFilters = [
    { key: "pharmacies", label: "Pharmacie(s)", values: filters.pharmacies },
    { key: "categories", label: "Catégorie(s)", values: filters.categories },
    { key: "distributors", label: "Distributeur(s)", values: filters.distributors },
    { key: "brands", label: "Marque(s)", values: filters.brands },
    { key: "dateRange", label: "Période", values: [formatDateRange(filters.dateRange)] },
  ].filter((filter) => filter.values.length); // 🔥 Garde uniquement les filtres activés

  if (activeFilters.length === 0) return null; // 👀 Cache le composant si aucun filtre actif

  return (
    <motion.div
      className="bg-white shadow-md rounded-md p-3 flex flex-wrap gap-2 border border-gray-200 transition-all"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <span className="text-gray-500 text-sm font-semibold mr-2">🔍 Filtres actifs :</span>

      <AnimatePresence>
        {activeFilters.map(({ key, label, values }) =>
          values.map((value) => (
            <motion.div
              key={`${key}-${value}`}
              className={clsx(
                "flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md text-sm font-medium shadow-sm transition",
                "hover:bg-gray-200"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {filterIcons[key]}
              <span className="text-gray-700">{value}</span>
              <button
                onClick={() => removeFilter(key as keyof typeof filters, value)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <FaTimes />
              </button>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterSummary;
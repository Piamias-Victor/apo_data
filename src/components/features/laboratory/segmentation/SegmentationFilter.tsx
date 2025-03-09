import { FilterState } from "@/contexts/FilterContext";
import { motion } from "framer-motion";


interface SegmentationFilterProps {
  label: string;
  values: string[];
  filterKey: keyof FilterState;
  selectedFilters: FilterState;
  toggleFilter: (filterKey: keyof FilterState, value: string) => void;
}

const SegmentationFilter: React.FC<SegmentationFilterProps> = ({ label, values, filterKey, selectedFilters, toggleFilter }) => {
  if (!values.length) return null;

  // ✅ Trier les valeurs par ordre alphabétique (insensible à la casse)
  const sortedValues = [...values].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  return (
    <div className="mt-4 w-full">
      <h3 className="text-md font-semibold text-teal-700">{label}</h3>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden flex flex-wrap gap-2 mt-2"
      >
        {sortedValues.map((value) => (
          <button
            key={`${filterKey}-${value}`}
            className={`px-3 py-1 rounded-md text-sm border ${
              selectedFilters[filterKey]?.includes(value)
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-600 border-teal-600 hover:bg-teal-100"
            }`}
            onClick={() => toggleFilter(filterKey, value)}
          >
            {value}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default SegmentationFilter;
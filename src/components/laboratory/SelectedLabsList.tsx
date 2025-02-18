import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import SegmentationDisplay from "./segmentation/SegmentationDisplay";

const SelectedLabsList: React.FC = () => {
  const { filters } = useFilterContext();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const selectedItems = [...filters.distributors, ...filters.brands];

  return (
    <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-md p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laboratoires sélectionnés</h2>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2"
        >
          {isCollapsed ? "Afficher les détails" : "Masquer les détails"}
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      {selectedItems.map((item) => (
        <div key={item} className="mt-2">
          <p className="font-medium text-teal-700">{item}</p>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden flex flex-wrap gap-2"
              >
                <SegmentationDisplay />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default SelectedLabsList;
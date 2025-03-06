import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import SegmentationDisplay from "./segmentation/SegmentationDisplay";

const COLORS = ["border-teal-500", "border-blue-500", "border-purple-500", "border-green-500", "border-red-500"];

const SelectedLabsList: React.FC = () => {
  const { filters } = useFilterContext();
  const { distributors } = useSegmentationContext();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const selectedLabsMap = new Map<string, string[]>();

  filters.distributors.forEach((lab) => {
    selectedLabsMap.set(lab, []);
  });

  filters.brands.forEach((brand) => {
    const lab = distributors.find((d) => d.brands.some((b) => b.brand_lab === brand))?.lab_distributor;
    if (lab) {
      if (!selectedLabsMap.has(lab)) {
        selectedLabsMap.set(lab, []);
      }
      selectedLabsMap.get(lab)?.push(brand);
    }
  });

  const selectedLabsArray = Array.from(selectedLabsMap.entries());

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Laboratoires sélectionnés</h2>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2"
        >
          {isCollapsed ? "Afficher les détails" : "Masquer les détails"}
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedLabsArray.map(([lab, brands], index) => (
          <div
            key={lab}
            className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${COLORS[index % COLORS.length]}`}
          >
            <p className="font-semibold text-gray-900">{lab}</p>

            {brands.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {brands.map((brand) => (
                  <li key={brand} className="bg-gray-100 px-2 py-1 rounded-md inline-block mr-2 mt-1">
                    {brand}
                  </li>
                ))}
              </ul>
            )}

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4"
                >
                  <SegmentationDisplay lab={lab}/>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedLabsList;
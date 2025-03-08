import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";

const SelectedSegmentationList: React.FC = () => {
  const { filters } = useFilterContext();

  const selectedItems = [
    ...filters.universes,
    ...filters.categories,
    ...filters.families,
    ...filters.specificities,
  ];

  return (
    <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-md p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Segments sélectionnés</h2>
      </div>

      {selectedItems.map((item) => (
        <div key={item} className="mt-2">
          <p className="font-medium text-teal-700">{item}</p>
        </div>
      ))}
    </div>
  );
};

export default SelectedSegmentationList;
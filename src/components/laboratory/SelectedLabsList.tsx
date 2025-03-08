import React, { useState, useMemo } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import SegmentationDisplay from "./segmentation/SegmentationDisplay";

// Couleurs pour les différents labs (cycliques)
const COLORS = [
  "border-teal-500",
  "border-blue-500",
  "border-purple-500", 
  "border-green-500",
  "border-red-500"
];

const SelectedLabsList: React.FC = () => {
  // Context hooks
  const { filters } = useFilterContext();
  const { distributors } = useSegmentationContext();
  
  // Local state
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Create a map of selected labs with their brands
  const selectedLabsMap = useMemo(() => {
    const labsMap = new Map<string, string[]>();

    // First, add all selected distributors (labs) with empty brand arrays
    filters.distributors.forEach((lab) => {
      labsMap.set(lab, []);
    });

    // Then, find the parent lab for each selected brand and add it to the appropriate lab
    filters.brands.forEach((brand) => {
      // Find the distributor that contains this brand
      const distributor = distributors.find((d) => 
        d.brands.some((b) => b.brand_lab === brand)
      );
      
      if (distributor) {
        const lab = distributor.lab_distributor;
        
        // If the lab isn't in our map yet, add it
        if (!labsMap.has(lab)) {
          labsMap.set(lab, []);
        }
        
        // Add the brand to its lab's array
        const brandsForLab = labsMap.get(lab);
        if (brandsForLab) {
          brandsForLab.push(brand);
        }
      }
    });

    return labsMap;
  }, [filters.distributors, filters.brands, distributors]);

  // Convert map to array for rendering
  const selectedLabsArray = Array.from(selectedLabsMap.entries());

  // Don't render anything if no labs or brands are selected
  if (selectedLabsArray.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {/* Header with title and toggle button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Laboratoires sélectionnés
        </h2>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2"
          aria-expanded={!isCollapsed}
          aria-controls="labs-content"
        >
          {isCollapsed ? "Afficher les détails" : "Masquer les détails"}
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      {/* Grid of lab cards */}
      <div id="labs-content" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedLabsArray.map(([lab, brands], index) => (
          <div
            key={lab}
            className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${COLORS[index % COLORS.length]}`}
          >
            {/* Lab name */}
            <p className="font-semibold text-gray-900">{lab}</p>

            {/* Brands list if any */}
            {brands.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {brands.map((brand) => (
                  <li key={brand} className="bg-gray-100 px-2 py-1 rounded-md inline-block mr-2 mt-1">
                    {brand}
                  </li>
                ))}
              </ul>
            )}

            {/* Segmentation details (animated on expand/collapse) */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4"
                >
                  <SegmentationDisplay lab={lab} />
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
// src/pages/laboratory.tsx
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import SalesDataComponent from "@/components/laboratory/test";

const LaboratoryPage: React.FC = () => {
  const { distributors, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext(); // Contexte des filtres

  const [selectedLabs, setSelectedLabs] = useState<string[]>(filters.distributors || []);
  const [selectedRanges, setSelectedRanges] = useState<string[]>(filters.ranges || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const filteredLabs = distributors
    .map((lab) => lab.lab_distributor)
    .filter((lab) => lab.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const handleSelectLab = (lab: string) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((selected) => selected !== lab) : [...prev, lab]
    );

    if (selectedLabs.includes(lab)) {
      setSelectedRanges((prev) => {
        const newRanges = { ...prev };
        delete newRanges[lab];
        return newRanges;
      });
    }
  };

  const handleSelectRange = (_lab: string, range: string) => {
    setSelectedRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  // Appliquer les filtres au contexte global
  const handleApplyFilters = () => {
    setFilters({
      distributors: selectedLabs,
      ranges: selectedRanges, // Déjà sous forme de tableau de strings
    });
  
    setIsDropdownOpen(false);
  };

  const handleRangesApplyFilters = () => {
    setFilters({
      distributors: selectedLabs,
      ranges: selectedRanges, // Plus besoin de transformation
    });
  
    setIsDropdownOpen(false);
    setIsApplied(true);
    setTimeout(() => {
      setIsApplied(false);
    }, 1000);
  };

  const handleClearSelection = () => {
    setSelectedLabs([]);
    setSelectedRanges([]);
    setFilters({ distributors: [], ranges: [] });
  };

  const handleClearRanges = () => {
    setSelectedRanges([]);
    setFilters({ ranges: [] });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sélectionner un Laboratoire</h1>

      {loading && <p className="text-gray-600">Chargement des laboratoires...</p>}
      {error && <p className="text-red-600">Erreur : {error}</p>}

      {!loading && !error && (
        <div className="relative max-w-lg mx-auto">
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedLabs.length > 0
                ? `${selectedLabs.length} laboratoire(s) sélectionné(s)`
                : "Choisir un laboratoire"}
            </span>
            <FaChevronDown className="text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
              <div className="p-3 border-b border-gray-200 flex items-center bg-gray-100 rounded-t-md">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Rechercher un laboratoire..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredLabs.map((lab, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                      selectedLabs.includes(lab) ? "bg-teal-100" : ""
                    }`}
                    onClick={() => handleSelectLab(lab)}
                  >
                    <span className="text-sm text-gray-700 flex-1">{lab}</span>
                    {selectedLabs.includes(lab) && <FaCheck className="text-teal-500" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200">
                <button
                  onClick={handleClearSelection}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
                >
                  <FaTimes />
                  Effacer
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-100 transition"
                >
                  <FaCheck />
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedLabs.length > 0 && (
        <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Laboratoires sélectionnés</h2>
            <button
              onClick={toggleCollapse}
              className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2"
            >
              {isCollapsed ? "Afficher les gammes" : "Masquer les gammes"}
              {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>

          {selectedLabs.map((lab) => {
            const labData = distributors.find((d) => d.lab_distributor === lab);
            const ranges =
              labData?.brands.flatMap((brand) =>
                brand.ranges.filter((range) => range.range_name !== null)
              ) || [];

            return (
              <div key={lab} className="mt-2">
                <p className="font-medium text-teal-700">{lab}</p>

                <AnimatePresence>
                  {!isCollapsed && ranges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-wrap gap-2 mt-2"
                    >
                      {ranges.map((range) => (
                        <button
                          key={range.range_name}
                          className={`px-3 py-1 rounded-md text-sm border ${
                            selectedRanges.includes(range.range_name)
                              ? "bg-teal-600 text-white"
                              : "bg-white text-teal-600 border-teal-600 hover:bg-teal-100"
                          }`}
                          onClick={() => handleSelectRange(lab, range.range_name)}
                        >
                          {range.range_name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {!isCollapsed && (
            <div className="flex justify-between items-center gap-3 p-3 m-2 border-t border-gray-200 w-full">
            <button
              onClick={handleClearRanges}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 border border-red-500 transition"
            >
              <FaTimes />
              Effacer
            </button>
            <motion.button
            onClick={handleRangesApplyFilters}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm shadow-sm transition border ${
                isApplied
                ? "bg-green-50 text-green-600 border-green-500 animate-pulse"
                : "bg-blue-50 text-blue-600 border-blue-500 hover:bg-blue-100"
            }`}
            >
            <FaCheck />
            {isApplied ? "Filtres appliqués !" : "Appliquer"}
            </motion.button>
          </div>
          )}
        </div>
      )}
      <SalesDataComponent/>
    </div>
  );
};

export default LaboratoryPage;
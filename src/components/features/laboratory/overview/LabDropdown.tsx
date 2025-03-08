import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import { useFilterContext } from "@/contexts/FilterContext";
import { FaChevronDown, FaSearch, FaCheck, FaTimes, FaLayerGroup } from "react-icons/fa";
import Loader from "@/components/common/feedback/Loader";

const LabDropdown: React.FC = () => {
  // Context hooks
  const { distributors, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"labs" | "brands">("labs");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected labs and brands from filters
  const selectedLabs = filters.distributors || [];
  const selectedBrands = filters.brands || [];

  // Create flat list of all labs and brands
  const allLabs = distributors.map((lab) => ({ 
    name: lab.lab_distributor, 
    type: "lab",
    brandCount: lab.brands.length 
  }));
  
  const allBrands = distributors.flatMap((lab) => 
    lab.brands.map((brand) => ({ 
      name: brand.brand_lab, 
      type: "brand",
      parent: lab.lab_distributor
    }))
  );

  // Filter items based on search term and active tab
  const filteredItems = activeTab === "labs"
    ? allLabs.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allBrands.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle lab/brand selection
  const handleSelectItem = (item: { name: string, type: string }) => {
    if (item.type === "lab") {
      setFilters({
        distributors: selectedLabs.includes(item.name)
          ? selectedLabs.filter((lab) => lab !== item.name)
          : [...selectedLabs, item.name],
        brands: selectedBrands
      });
    } else {
      setFilters({
        distributors: selectedLabs,
        brands: selectedBrands.includes(item.name)
          ? selectedBrands.filter((brand) => brand !== item.name)
          : [...selectedBrands, item.name]
      });
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setFilters({ 
      distributors: [], 
      brands: [],
      // Preserve other filter properties
      ranges: filters.ranges || [] 
    });
    setSearchTerm("");
  };

  // Function to check if an item is selected
  const isItemSelected = (name: string, type: string): boolean => {
    return type === "lab" 
      ? selectedLabs.includes(name) 
      : selectedBrands.includes(name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Display placeholder text based on selections
  const getPlaceholderText = () => {
    const totalSelected = selectedLabs.length + selectedBrands.length;
    if (totalSelected === 0) return "Sélectionnez un laboratoire ou une marque";
    return `${totalSelected} élément${totalSelected > 1 ? 's' : ''} sélectionné${totalSelected > 1 ? 's' : ''}`;
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={dropdownRef}>
      {/* Show loader when loading */}
      {loading && <Loader message="Chargement des laboratoires..." />}

      {/* Show error message if there's an error */}
      {!loading && error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 mb-4">
          <div className="flex items-center">
            <FaTimes className="mr-2 flex-shrink-0" />
            <p>Une erreur s'est produite lors du chargement des données: {error}</p>
          </div>
        </div>
      )}

      {/* Main dropdown UI */}
      {!loading && !error && (
        <>
          {/* Dropdown button */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center text-gray-700">
              <FaLayerGroup className="text-teal-500 mr-2" />
              <span className="text-sm truncate">
                {getPlaceholderText()}
              </span>
            </div>
            <FaChevronDown className={`text-gray-400 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-lg mt-2 z-50 overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    className={`flex-1 py-3 font-medium text-sm ${
                      activeTab === "labs" 
                        ? "text-teal-600 border-b-2 border-teal-500" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("labs")}
                  >
                    Laboratoires
                  </button>
                  <button
                    className={`flex-1 py-3 font-medium text-sm ${
                      activeTab === "brands" 
                        ? "text-teal-600 border-b-2 border-teal-500" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("brands")}
                  >
                    Marques
                  </button>
                </div>

                {/* Search bar */}
                <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Rechercher un ${activeTab === "labs" ? "laboratoire" : "marque"}...`}
                      className="bg-white w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setSearchTerm("")}
                      >
                        <FaTimes className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="py-4 px-3 text-center text-gray-500 bg-gray-50 italic text-sm">
                      Aucun résultat trouvé
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredItems.map((item, index) => (
                        <div
                          key={`${item.type}-${item.name}-${index}`}
                          className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                            isItemSelected(item.name, item.type) ? "bg-teal-50" : ""
                          }`}
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              {activeTab === "labs" && "brandCount" in item && (
                                <p className="text-xs text-gray-500">{item.brandCount} marques</p>
                              )}
                              {activeTab === "brands" && "parent" in item && (
                                <p className="text-xs text-gray-500">Lab: {item.parent}</p>
                              )}
                            </div>
                            {isItemSelected(item.name, item.type) && (
                              <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                <FaCheck className="text-white text-xs" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected count & clear button */}
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {selectedLabs.length + selectedBrands.length} élément(s) sélectionné(s)
                  </div>
                  {(selectedLabs.length > 0 || selectedBrands.length > 0) && (
                    <button
                      onClick={handleClearSelection}
                      className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                    >
                      <FaTimes className="mr-1" /> Effacer tout
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected items display when dropdown is closed */}
          {!isDropdownOpen && (selectedLabs.length > 0 || selectedBrands.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedLabs.map((lab) => (
                <div 
                  key={`selected-lab-${lab}`} 
                  className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full flex items-center border border-teal-200"
                >
                  <span className="font-medium">Lab: {lab}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem({ name: lab, type: "lab" });
                    }}
                    className="ml-2 text-teal-500 hover:text-teal-700"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
              {selectedBrands.map((brand) => (
                <div 
                  key={`selected-brand-${brand}`} 
                  className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center border border-blue-200"
                >
                  <span className="font-medium">Marque: {brand}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem({ name: brand, type: "brand" });
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabDropdown;
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import { useFilterContext } from "@/contexts/FilterContext";
import { 
  HiChevronDown, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiCheck, 
  HiBeaker, 
  HiArchiveBox
} from "react-icons/hi2";
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
      ranges: filters.ranges || [],
      universes: filters.universes || [],
      categories: filters.categories || [],
      subCategories: filters.subCategories || [],
      families: filters.families || [],
      subFamilies: filters.subFamilies || [],
      specificities: filters.specificities || [],
      dateRange: filters.dateRange || [null, null],
      comparisonDateRange: filters.comparisonDateRange || [null, null],
      ean13Products: filters.ean13Products || [],
      type: filters.type || null,
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
    hidden: { opacity: 0, y: -10, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.25, 
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.97,
      transition: { 
        duration: 0.2, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (index: number) => ({
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.03 * index,
        duration: 0.25, 
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const tabVariants = {
    inactive: { 
      color: "#6B7280", 
      background: "transparent",
      borderColor: "transparent"
    },
    active: { 
      color: "#0F766E", 
      background: "rgba(240, 253, 250, 0.75)",
      borderColor: "#0F766E" 
    },
    hover: { 
      scale: 1.02,
      y: -1
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      {/* Show loader when loading */}
      {loading && <Loader message="Chargement des laboratoires..." />}

      {/* Show error message if there's an error */}
      {!loading && error && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 mb-6 flex items-center shadow-sm"
        >
          <HiXMark className="mr-2 flex-shrink-0 text-lg" />
          <p className="text-sm">Une erreur s'est produite lors du chargement des données: {error}</p>
        </motion.div>
      )}

      {/* Main dropdown UI */}
      {!loading && !error && (
        <>
          {/* Dropdown button */}
          <motion.button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent group"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center text-gray-700 group-hover:text-teal-700 transition-colors">
              <span className="w-9 h-9 mr-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center text-teal-600 shadow-sm border border-teal-200/50 group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                <HiBeaker className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium">
                {getPlaceholderText()}
              </span>
            </div>
            <motion.div 
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 group-hover:text-teal-500 transition-colors"
            >
              <HiChevronDown />
            </motion.div>
          </motion.button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-0 right-0 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl mt-2 z-50 overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50/80">
                  <motion.button
                    variants={tabVariants}
                    initial={activeTab === "labs" ? "active" : "inactive"}
                    animate={activeTab === "labs" ? "active" : "inactive"}
                    whileHover="hover"
                    className="flex-1 py-3.5 font-medium text-sm relative border-b-2 transition-all duration-300"
                    onClick={() => setActiveTab("labs")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HiBeaker className={activeTab === "labs" ? "opacity-100" : "opacity-50"} />
                      Laboratoires
                    </div>
                    {activeTab === "labs" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-teal-500"
                      />
                    )}
                  </motion.button>
                  <motion.button
                    variants={tabVariants}
                    initial={activeTab === "brands" ? "active" : "inactive"}
                    animate={activeTab === "brands" ? "active" : "inactive"}
                    whileHover="hover"
                    className="flex-1 py-3.5 font-medium text-sm relative border-b-2 transition-all duration-300"
                    onClick={() => setActiveTab("brands")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HiArchiveBox className={activeTab === "brands" ? "opacity-100" : "opacity-50"} />
                      Marques
                    </div>
                    {activeTab === "brands" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-teal-500"
                      />
                    )}
                  </motion.button>
                </div>

                {/* Search bar */}
                <div className="p-3 border-b border-gray-200/80 bg-gray-50/30">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiMagnifyingGlass className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Rechercher un ${activeTab === "labs" ? "laboratoire" : "marque"}...`}
                      className="bg-white w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm transition-all 
                      focus:border-teal-300 focus:ring-2 focus:ring-teal-300/30 focus:outline-none shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setSearchTerm("")}
                      >
                        <HiXMark className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Selected count */}
                  <div className="flex items-center justify-between mt-3 px-1">
                    <p className="text-xs text-gray-500">
                      {selectedLabs.length + selectedBrands.length} élément(s) sélectionné(s)
                    </p>
                    
                    {(selectedLabs.length > 0 || selectedBrands.length > 0) && (
                      <button 
                        onClick={handleClearSelection}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Tout effacer
                      </button>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div className="max-h-64 overflow-y-auto py-2 px-2">
                  {filteredItems.length === 0 ? (
                    <div className="py-6 px-3 text-center text-gray-500 bg-gray-50/50 rounded-lg italic text-sm">
                      Aucun résultat trouvé
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredItems.map((item, index) => (
                        <motion.div
                          key={`${item.type}-${item.name}-${index}`}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.button
                            onClick={() => handleSelectItem(item)}
                            whileHover={{ scale: 1.01, backgroundColor: isItemSelected(item.name, item.type) ? "#e6f7f5" : "#f3f4f6" }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                              isItemSelected(item.name, item.type)
                                ? "bg-teal-50 border-teal-200 border shadow-sm"
                                : "bg-white hover:bg-gray-50 border border-transparent"
                            }`}
                          >
                            <div className={`mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isItemSelected(item.name, item.type)
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {isItemSelected(item.name, item.type) ? (
                                <HiCheck className="w-5 h-5" />
                              ) : (
                                item.type === "lab" ? <HiBeaker className="w-5 h-5" /> : <HiArchiveBox className="w-5 h-5" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isItemSelected(item.name, item.type) ? "text-teal-700" : "text-gray-800"
                              }`}>
                                {item.name}
                              </p>
                              
                              {"brandCount" in item ? (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                    {item.brandCount} marque{item.brandCount > 1 ? "s" : ""}
                                  </span>
                                </p>
                              ) : "parent" in item ? (
                                <p className="text-xs text-gray-500">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                    {item.parent}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected items display when dropdown is closed */}
          {!isDropdownOpen && (selectedLabs.length > 0 || selectedBrands.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {selectedLabs.map((lab) => (
                <motion.div 
                  key={`selected-lab-${lab}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  className="bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full flex items-center border border-teal-200 shadow-sm"
                >
                  <HiBeaker className="mr-1.5 text-teal-500" />
                  <span className="font-medium">{lab}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem({ name: lab, type: "lab" });
                    }}
                    className="ml-2 text-teal-500 hover:text-teal-700 p-0.5 hover:bg-teal-100 rounded-full transition-colors"
                  >
                    <HiXMark size={14} />
                  </button>
                </motion.div>
              ))}
              {selectedBrands.map((brand) => (
                <motion.div 
                  key={`selected-brand-${brand}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center border border-blue-200 shadow-sm"
                >
                  <HiArchiveBox className="mr-1.5 text-blue-500" />
                  <span className="font-medium">{brand}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem({ name: brand, type: "brand" });
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 p-0.5 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <HiXMark size={14} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default LabDropdown;
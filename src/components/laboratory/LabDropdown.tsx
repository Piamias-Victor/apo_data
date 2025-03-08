import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";

const LabDropdown: React.FC = () => {
  // Context hooks
  const { distributors, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get selected labs and brands from filters
  const selectedLabs = filters.distributors || [];
  const selectedBrands = filters.brands || [];

  // Create flat list of all labs and brands
  const allItems = distributors.flatMap((lab) => [
    { name: lab.lab_distributor, type: "lab" },
    ...lab.brands.map((brand) => ({ name: brand.brand_lab, type: "brand" })),
  ]);

  // Filter items based on search term and remove duplicates
  const filteredItems = Array.from(
    new Map(
      allItems
        .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((item) => [item.name, item])
    ).values()
  );

  // Handle lab/brand selection
  const handleSelectItem = (item: string, type: string) => {
    if (type === "lab") {
      setFilters({
        distributors: selectedLabs.includes(item)
          ? selectedLabs.filter((lab) => lab !== item)
          : [...selectedLabs, item],
        brands: selectedBrands
      });
    } else {
      setFilters({
        distributors: selectedLabs,
        brands: selectedBrands.includes(item)
          ? selectedBrands.filter((brand) => brand !== item)
          : [...selectedBrands, item]
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
  };

  // Function to check if an item is selected
  const isItemSelected = (name: string): boolean => {
    return selectedLabs.includes(name) || selectedBrands.includes(name);
  };

  return (
    <div className="relative max-w-lg mx-auto">
      {/* Show loader when loading */}
      {loading && <Loader message="Chargement des laboratoires..." />}

      {/* Show error message if there's an error */}
      {!loading && error && (
        <p className="text-red-600 p-3 bg-red-50 rounded-md border border-red-200">
          Erreur : {error}
        </p>
      )}

      {/* Main dropdown UI */}
      {!loading && !error && (
        <>
          {/* Dropdown button */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedLabs.length + selectedBrands.length > 0
                ? `${selectedLabs.length + selectedBrands.length} sélectionné(s)`
                : "Choisir un laboratoire ou une marque"}
            </span>
            <FaChevronDown className="text-gray-500" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
              {/* Search bar */}
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

              {/* Items list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredItems.length === 0 && (
                  <p className="px-4 py-2 text-center text-gray-500">Aucun résultat trouvé</p>
                )}
                
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                      isItemSelected(item.name) ? "bg-teal-100" : ""
                    }`}
                    onClick={() => handleSelectItem(item.name, item.type)}
                  >
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    {isItemSelected(item.name) && <FaCheck className="text-teal-500" />}
                  </div>
                ))}
              </div>

              {/* Selected items display */}
              {(selectedLabs.length > 0 || selectedBrands.length > 0) && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs uppercase text-gray-600 font-semibold mb-2">Sélectionnés :</p>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedLabs, ...selectedBrands].map((item) => (
                      <span
                        key={item}
                        className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                      >
                        {item}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(item, selectedLabs.includes(item) ? "lab" : "brand");
                          }} 
                          className="text-white hover:text-teal-200 transition"
                          aria-label={`Supprimer ${item}`}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-start items-center gap-3 p-3 border-t border-gray-200">
                <button
                  onClick={handleClearSelection}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
                >
                  <FaTimes />
                  Effacer
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabDropdown;
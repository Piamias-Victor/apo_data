import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader"; // ✅ Import du loader

const LabDropdown: React.FC = () => {
  const { distributors, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedLabs = filters.distributors || [];
  const selectedBrands = filters.brands || [];

  const filteredLabs = Array.from(
    new Map(
      distributors.flatMap((lab) => [
        { name: lab.lab_distributor, type: "lab" },
        ...lab.brands.map((brand) => ({ name: brand.brand_lab, type: "brand" })),
      ]).map((item) => [item.name, item])
    ).values()
  ).filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectLab = (item: string) => {
    const isLab = distributors.some((lab) => lab.lab_distributor === item);
  
    console.log('isLab :', isLab);
  
    // Récupère les filtres actuels
    const { distributors: selectedLabs, brands: selectedBrands } = filters;
  
    const alreadySelected = isLab
      ? selectedLabs.includes(item)
      : selectedBrands.includes(item);
  
    console.log('alreadySelected :', alreadySelected);
    console.log('Filtres avant mise à jour :', filters);
  
    // Construire les nouveaux filtres
    const newFilters = {
      distributors: isLab
        ? alreadySelected
          ? selectedLabs.filter((lab) => lab !== item) // Supprime si déjà sélectionné
          : [...selectedLabs, item] // Ajoute sinon
        : selectedLabs,
      brands: !isLab
        ? alreadySelected
          ? selectedBrands.filter((brand) => brand !== item) // Supprime si déjà sélectionné
          : [...selectedBrands, item] // Ajoute sinon
        : selectedBrands,
    };
  
    // Mettre à jour les filtres
    setFilters(newFilters);
  };

  const handleClearSelection = () => {
    setFilters({ distributors: [], brands: [], ranges: filters.ranges || [] });
  };

  return (
    <div className="relative max-w-lg mx-auto">
      {loading && <Loader message="Chargement des laboratoires..." />} {/* ✅ Affichage du loader */}

      {!loading && error && <p className="text-red-600">Erreur : {error}</p>} {/* ✅ Gestion d'erreur */}

      {!loading && !error && ( // ✅ Affichage uniquement si pas en charge et pas d'erreur
        <>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedLabs.length + selectedBrands.length > 0
                ? `${selectedLabs.length + selectedBrands.length} sélectionné(s)`
                : "Choisir un laboratoire ou une marque"}
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
                {filteredLabs.map((item, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                      selectedLabs.includes(item.name) || selectedBrands.includes(item.name) ? "bg-teal-100" : ""
                    }`}
                    onClick={() => handleSelectLab(item.name)}
                  >
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    {(selectedLabs.includes(item.name) || selectedBrands.includes(item.name)) && (
                      <FaCheck className="text-teal-500" />
                    )}
                  </div>
                ))}
              </div>

              {selectedLabs.length + selectedBrands.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs uppercase text-gray-600 font-semibold mb-2">Sélectionnés :</p>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedLabs, ...selectedBrands].map((item) => (
                      <span
                        key={item}
                        className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                      >
                        {item}
                        <button onClick={() => handleSelectLab(item)} className="text-white">
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
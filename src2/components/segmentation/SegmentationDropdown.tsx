import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";

const SegmentationDropdown: React.FC = () => {
  const { universes, families, specificities, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🟢 Récupération des segments sélectionnés
  const selectedSegments = [
    ...(filters.universes || []),
    ...(filters.categories || []),
    ...(filters.families || []),
    ...(filters.specificities || []),
  ];

  // 📌 Séparation des segments par type
  const universesList = universes.map((u) => ({ name: u.universe, type: "universe" }));
  const categoriesList = universes.flatMap((u) =>
    u.categories.map((c) => ({ name: c.category, type: "category" }))
  );
  const familiesList = families.map((f) => ({ name: f.family, type: "family" }));
  const specificitiesList = specificities.map((s) => ({ name: s.specificity, type: "specificity" }));

  // 📌 Filtrage des segments par recherche
  const filterSegments = (segments: { name: string; type: string }[]) =>
    segments.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredUniverses = filterSegments(universesList);
  const filteredCategories = filterSegments(categoriesList);
  const filteredFamilies = filterSegments(familiesList);
  const filteredSpecificities = filterSegments(specificitiesList);

  // 🟢 Fonction pour sélectionner un segment
  const handleSelectSegment = (item: string, type: string) => {
    setFilters({
      universes: type === "universe" ? [item] : filters.universes,
      categories: type === "category" ? [item] : filters.categories,
      families: type === "family" ? [item] : filters.families,
      specificities: type === "specificity" ? [item] : filters.specificities,
    });

    setIsDropdownOpen(false);
  };

  // 🔄 Fonction pour vider la sélection
  const handleClearSelection = () => {
    setFilters({ universes: [], categories: [], families: [], specificities: [] });
  };

  return (
    <div className="relative max-w-lg mx-auto">
      {loading && <Loader message="Chargement des segments..." />}
      {!loading && error && <p className="text-red-600">Erreur : {error}</p>}
      {!loading && !error && (
        <>
          {/* 🔹 Bouton principal */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedSegments.length > 0 ? selectedSegments.join(", ") : "Choisir un segment"}
            </span>
            <FaChevronDown className="text-gray-500" />
          </button>

          {/* 🔹 Dropdown ouvert */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
              {/* 🔍 Barre de recherche */}
              <div className="p-3 border-b border-gray-200 flex items-center bg-gray-100 rounded-t-md">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Rechercher un segment..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 🟢 Liste des segments avec séparateurs */}
              <div className="max-h-64 overflow-y-auto">
                {/* 🔹 Univers */}
                {filteredUniverses.length > 0 && (
                  <>
                    <div className="bg-teal-200 text-teal-800 font-bold px-4 py-2">🌍 Univers</div>
                    {filteredUniverses.map((item, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                          selectedSegments.includes(item.name) ? "bg-teal-100" : ""
                        }`}
                        onClick={() => handleSelectSegment(item.name, item.type)}
                      >
                        <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                        {selectedSegments.includes(item.name) && <FaCheck className="text-teal-500" />}
                      </div>
                    ))}
                  </>
                )}

                {/* 🔹 Catégories */}
                {filteredCategories.length > 0 && (
                  <>
                    <div className="bg-blue-200 text-blue-800 font-bold px-4 py-2">📂 Catégories</div>
                    {filteredCategories.map((item, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center gap-3 ${
                          selectedSegments.includes(item.name) ? "bg-blue-100" : ""
                        }`}
                        onClick={() => handleSelectSegment(item.name, item.type)}
                      >
                        <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                        {selectedSegments.includes(item.name) && <FaCheck className="text-blue-500" />}
                      </div>
                    ))}
                  </>
                )}

                {/* 🔹 Familles */}
                {filteredFamilies.length > 0 && (
                  <>
                    <div className="bg-green-200 text-green-800 font-bold px-4 py-2">🏡 Familles</div>
                    {filteredFamilies.map((item, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 cursor-pointer hover:bg-green-50 flex items-center gap-3 ${
                          selectedSegments.includes(item.name) ? "bg-green-100" : ""
                        }`}
                        onClick={() => handleSelectSegment(item.name, item.type)}
                      >
                        <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                        {selectedSegments.includes(item.name) && <FaCheck className="text-green-500" />}
                      </div>
                    ))}
                  </>
                )}

                {/* 🔹 Spécificités */}
                {filteredSpecificities.length > 0 && (
                  <>
                    <div className="bg-purple-200 text-purple-800 font-bold px-4 py-2">🔍 Spécificités</div>
                    {filteredSpecificities.map((item, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 cursor-pointer hover:bg-purple-50 flex items-center gap-3 ${
                          selectedSegments.includes(item.name) ? "bg-purple-100" : ""
                        }`}
                        onClick={() => handleSelectSegment(item.name, item.type)}
                      >
                        <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                        {selectedSegments.includes(item.name) && <FaCheck className="text-purple-500" />}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* 🔄 Effacer la sélection */}
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

export default SegmentationDropdown;
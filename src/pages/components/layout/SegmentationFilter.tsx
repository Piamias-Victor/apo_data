import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";
import { useUniversesContext } from "@/contexts/universesContext";
import { useLabDistributorsContext } from "@/contexts/brandsContext";
import { useFilterContext } from "@/contexts/filtersContext";

// Couleurs des univers
const UNIVERS_COLORS: { [key: string]: string } = {
  "BANDES COMPRESSES PANSEMENTS MEDICAUX": "#FFA07A",
  "BEBE": "#87CEFA",
  "BIEN ÊTRE AU QUOTIDIEN": "#FFD700",
  "DERMOCOSMETIQUE": "#FFB6C1",
  "DIVERS ACCESSOIRES MEDICAUX": "#C0C0C0",
  "DIVERS CONSEIL ET PRESCRIPTION SANS AMM DONT LPPR - POD": "#40E0D0",
  "MASQUES DE PROTECTION": "#FF7F7F",
  "MATERIEL MEDICAL": "#B0C4DE",
  "MEDICATION FAMILIALE": "#BA55D3",
  "MEDICATION FAMILIALE ALLOPATHIE CONSEIL": "#4682B4",
  "MEDICATION FAMILIALE HOMEOPATHIE DEREMBOURSEE ET CONSEIL": "#FF69B4",
  "NATURE ET SANTE": "#98FB98",
  "ORTHOPEDIE - INCONTINENCE ET NUTRITION CLINIQUE": "#9370DB",
  "PRESCRIPTION OBLIGATOIRE NON REMBOURSABLE": "#4169E1",
  "SERVICES": "#FFDAB9",
  "SEVRAGE TABAC REMBOURSABLE": "#FF4500",
  "TESTS GLYCÉMIE": "#32CD32",
  "VETERINAIRE": "#00FA9A",
};

// Fonction pour obtenir la couleur d'un univers
const getColorForUniverse = (universe: string) => {
  return UNIVERS_COLORS[universe.toUpperCase()] || "#A9A9A9"; // Gris par défaut
};

const SegmentationFilter: React.FC = () => {
  const { universes, loading: loadingUniverses, error: errorUniverses } = useUniversesContext();
  const { labDistributors, loading: loadingLabs, error: errorLabs } = useLabDistributorsContext();
  const { filters, setFilters } = useFilterContext();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState({
    universe: "",
    category: "",
    subCategory: "",
    distributor: "",
    lab: "",
    range: "",
  });

  const [tempSelectedFilters, setTempSelectedFilters] = useState({
    universe: filters.universe || [],
    category: filters.category || [],
    subCategory: filters.subCategory || [],
    distributor: filters.labDistributor || [],
    lab: filters.brandLab || [],
    range: filters.rangeName || [],
  });

  useEffect(() => {
    setTempSelectedFilters({
      universe: filters.universe || [],
      category: filters.category || [],
      subCategory: filters.subCategory || [],
      distributor: filters.labDistributor || [],
      lab: filters.brandLab || [],
      range: filters.rangeName || [],
    });
  }, [filters]);

  const toggleDropdown = (key: keyof typeof tempSelectedFilters) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleSearch = (key: keyof typeof searchTerms, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectItem = (key: keyof typeof tempSelectedFilters, id: string) => {
    const isSelected = tempSelectedFilters[key].includes(id);
    const updatedSelection = isSelected
      ? tempSelectedFilters[key].filter((itemId) => itemId !== id)
      : [...tempSelectedFilters[key], id];
    setTempSelectedFilters((prev) => ({ ...prev, [key]: updatedSelection }));
  };

  const handleClearSelection = (key: keyof typeof tempSelectedFilters) => {
    setTempSelectedFilters((prev) => ({ ...prev, [key]: [] }));
  };

  const handleApply = (key: keyof typeof tempSelectedFilters) => {
    setFilters({ [key]: tempSelectedFilters[key] });
    setActiveDropdown(null);
  };

  const renderDropdown = (
    label: string,
    key: keyof typeof tempSelectedFilters,
    items: { id: string; name: string; parent?: string; grandParent?: string }[]
  ) => {
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerms[key].toLowerCase())
    );

    return (
      <div className="relative mb-4">
        <button
          onClick={() => toggleDropdown(key)}
          className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm w-64 hover:bg-gray-100 transition mx-auto"
        >
          <span className="text-gray-700 text-sm">
            {tempSelectedFilters[key].length > 0
              ? `${tempSelectedFilters[key].length} ${label} sélectionné(s)`
              : `Sélectionnez ${label}`}
          </span>
          <FaChevronDown className="text-gray-500" />
        </button>

        {activeDropdown === key && (
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-md mt-2 w-64 z-10">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={`Rechercher ${label}...`}
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerms[key]}
                  onChange={(e) => handleSearch(key, e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectItem(key, item.id)}
                >
                  {["universe", "category", "subCategory"].includes(key) && (
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: item.parent
                          ? getColorForUniverse(item.parent)
                          : getColorForUniverse(item.name),
                      }}
                    ></span>
                  )}
                  <span className="text-sm text-gray-700 truncate flex-1">{item.name}</span>
                  {tempSelectedFilters[key].includes(item.id) && <FaCheck className="text-blue-500" />}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200">
              <button
                onClick={() => handleClearSelection(key)}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
              >
                <FaTimes /> Effacer
              </button>
              <button
                onClick={() => handleApply(key)}
                className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-100 transition"
              >
                <FaCheck /> Appliquer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loadingUniverses || loadingLabs) return <p>Chargement des données...</p>;
  if (errorUniverses || errorLabs) return <p className="text-red-500">Erreur de chargement des données.</p>;

  return (
    <div className="p-4 flex flex-col items-center">
      {renderDropdown(
        "univers",
        "universe",
        universes.map((universe) => ({
          id: universe.universe,
          name: universe.universe,
        }))
      )}
      {renderDropdown(
        "catégories",
        "category",
        universes.flatMap((universe) =>
          universe.categories.map((category) => ({
            id: category.category,
            name: category.category,
            parent: universe.universe,
          }))
        )
      )}
      {renderDropdown(
        "sous-catégories",
        "subCategory",
        universes.flatMap((universe) =>
          universe.categories.flatMap((category) =>
            category.sub_categories.map((subCategory) => ({
              id: subCategory.sub_category,
              name: subCategory.sub_category,
              parent: universe.universe,
            }))
          )
        )
      )}
      {renderDropdown(
        "distributeurs",
        "distributor",
        labDistributors.map((lab) => ({ id: lab.lab_distributor, name: lab.lab_distributor }))
      )}
      {renderDropdown(
        "laboratoires",
        "lab",
        labDistributors.flatMap((lab) =>
          lab.brand_labs.map((brandLab) => ({
            id: brandLab.brand_lab,
            name: brandLab.brand_lab,
            parent: lab.lab_distributor,
          }))
        )
      )}
      {renderDropdown(
        "gammes",
        "range",
        labDistributors.flatMap((lab) =>
          lab.brand_labs.flatMap((brandLab) =>
            brandLab.range_names.map((range) => ({
              id: range.range_name,
              name: range.range_name,
              parent: brandLab.brand_lab,
              grandParent: lab.lab_distributor,
            }))
          )
        )
      )}
    </div>
  );
};

export default SegmentationFilter;

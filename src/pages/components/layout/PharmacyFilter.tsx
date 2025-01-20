import React, { useState } from "react";
import { usePharmaciesContext } from "@/contexts/pharmaciesContext";
import { useFilterContext } from "@/contexts/filtersContext";
import { Pharmacy } from "@/types/Pharmacy";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";

const PharmacyFilter: React.FC = () => {
  const { pharmacies, loading, error } = usePharmaciesContext();
  const { filters, setFilters } = useFilterContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedPharmacyIds, setTempSelectedPharmacyIds] = useState<string[]>(
    filters.pharmacy || []
  );

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    const isSelected = tempSelectedPharmacyIds.includes(pharmacy.id);
    const updatedSelection = isSelected
      ? tempSelectedPharmacyIds.filter((id) => id !== pharmacy.id)
      : [...tempSelectedPharmacyIds, pharmacy.id];

    setTempSelectedPharmacyIds(updatedSelection);
  };

  const handleClearSelection = () => {
    setTempSelectedPharmacyIds([]);
  };

  const handleApplyFilters = () => {
    setFilters({
      ...filters,
      pharmacy: tempSelectedPharmacyIds,
    });
    setIsDropdownOpen(false);
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.name?.toLowerCase().includes(searchTerm)
  );

  if (loading) return <p>Chargement des pharmacies...</p>;
  if (error) return <p className="text-red-500">Erreur : {error}</p>;

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm w-64 hover:bg-gray-100 transition"
      >
        <span className="text-gray-700 text-sm">
          {tempSelectedPharmacyIds.length > 0
            ? `${tempSelectedPharmacyIds.length} sélectionnée(s)`
            : "Sélectionnez des pharmacies"}
        </span>
        <FaChevronDown className="text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute bg-white border border-gray-300 shadow-lg rounded-md mt-2 w-64 z-10">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Pharmacies List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredPharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  tempSelectedPharmacyIds.includes(pharmacy.id) ? "bg-blue-50" : ""
                }`}
                onClick={() => handleSelectPharmacy(pharmacy)}
              >
                <span className="text-sm text-gray-700">{pharmacy.name}</span>
                {tempSelectedPharmacyIds.includes(pharmacy.id) && (
                  <FaCheck className="text-blue-500" />
                )}
              </div>
            ))}

            {filteredPharmacies.length === 0 && (
              <p className="text-sm text-gray-500 px-4 py-2">
                Aucune pharmacie trouvée.
              </p>
            )}
          </div>

          {/* Actions */}
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
  );
};

export default PharmacyFilter;

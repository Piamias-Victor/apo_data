import { usePharmacyContext } from "@/contexts/segmentation/PharmaciesContext";
import { useFilterContext } from "@/contexts/FilterContext";
import React, { useState } from "react";
import { FaTimes, FaChevronDown, FaCheck, FaSearch } from "react-icons/fa";

interface PharmacyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PharmacyDrawer: React.FC<PharmacyDrawerProps> = ({ isOpen, onClose }) => {
  const { pharmacies, loading, error } = usePharmacyContext();
  const { filters, setFilters } = useFilterContext();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>(filters.pharmacies || []);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les pharmacies en fonction de la recherche
  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    (pharmacy.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  // Gérer la sélection/désélection d'une pharmacie
  const handleSelectPharmacy = (id: string) => {
    setSelectedPharmacies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Réinitialiser la sélection
  const handleClearSelection = () => {
    setSelectedPharmacies([]);
  };

  // Appliquer le filtre au contexte global
  const applyFilter = () => {
    setFilters({ pharmacies: selectedPharmacies });
    onClose(); // Fermer le drawer après application
  };

  return (
    <>
      {/* Overlay noir semi-transparent */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        {/* Header du Drawer */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtres Pharmacies</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Contenu du Drawer */}
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">Sélectionnez une ou plusieurs pharmacies :</p>

          {/* Dropdown Pharmacies */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
            >
              <span className="text-gray-700 text-sm truncate">
                {selectedPharmacies.length > 0
                  ? `${selectedPharmacies.length} sélectionnée(s)`
                  : "Choisir une pharmacie"}
              </span>
              <FaChevronDown className="text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
                {/* Barre de recherche */}
                <div className="p-3 border-b border-gray-200 flex items-center bg-gray-100 rounded-t-md">
                  <FaSearch className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Rechercher une pharmacie..."
                    className="bg-transparent outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Liste des pharmacies */}
                <div className="max-h-64 overflow-y-auto">
                {loading ? (
                    <p className="text-center text-gray-500 p-3">Chargement...</p>
                ) : error ? (
                    <p className="text-center text-red-500 p-3">{error}</p>
                ) : (
                    filteredPharmacies.map((pharmacy) => (
                    <div
                        key={pharmacy.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                        selectedPharmacies.includes(pharmacy.id) ? "bg-teal-100" : ""
                        }`}
                        onClick={() => handleSelectPharmacy(pharmacy.id)}
                    >
                        <span className="text-sm text-gray-700 flex-1">
                        {pharmacy.name}
                        </span>
                        {selectedPharmacies.includes(pharmacy.name) && (
                        <FaCheck className="text-teal-500" />
                        )}
                    </div>
                    ))
                )}
                </div>

                {/* Boutons Effacer & Appliquer */}
                <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200 bg-gray-50 rounded-b-md">
                {/* Bouton Effacer */}
                <button
                    onClick={handleClearSelection}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
                >
                    <FaTimes />
                    Effacer
                </button>

                {/* Bouton Appliquer */}
                <button
                    onClick={applyFilter}
                    className="flex items-center justify-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-100 transition"
                >
                    <FaCheck />
                    Appliquer
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyDrawer;
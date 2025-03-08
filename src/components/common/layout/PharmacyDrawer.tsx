import { usePharmacyContext } from "@/contexts/segmentation/PharmaciesContext";
import { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaChevronDown, FaSearch } from "react-icons/fa";
import ActionButton from "../buttons/ActionButton";
import BaseDrawer from "../sections/BaseDrawer";
import { useFilterContext } from "@/contexts/FilterContext";


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

  // Synchroniser l'état local avec les filtres globaux
  useEffect(() => {
    if (isOpen) {
      setSelectedPharmacies(filters.pharmacies || []);
    }
  }, [isOpen, filters.pharmacies]);

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
    setIsDropdownOpen(false);
  };

  // Appliquer le filtre au contexte global
  const applyFilter = () => {
    setFilters({ pharmacies: selectedPharmacies });
    setIsDropdownOpen(false);
    onClose();
  };

  // Fermer le dropdown quand on clique en-dehors
  useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false);
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.pharmacy-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isDropdownOpen]);

  const footerContent = (
    <div className="flex justify-between">
      <ActionButton
        onClick={handleClearSelection}
        icon={<FaTimes />}
        variant="danger"
      >
        Réinitialiser
      </ActionButton>
      
      <ActionButton
        onClick={applyFilter}
        icon={<FaCheck />}
        variant="success"
      >
        Appliquer
      </ActionButton>
    </div>
  );

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtres Pharmacies"
      width="w-80"
      footer={footerContent}
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">Sélectionnez une ou plusieurs pharmacies :</p>

        {/* Dropdown Pharmacies */}
        <div className="relative pharmacy-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedPharmacies.length > 0
                ? `${selectedPharmacies.length} sélectionnée(s)`
                : "Choisir une pharmacie"}
            </span>
            <FaChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                ) : filteredPharmacies.length === 0 ? (
                  <p className="text-center text-gray-500 p-3">Aucune pharmacie trouvée</p>
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
                      {selectedPharmacies.includes(pharmacy.id) && (
                        <FaCheck className="text-teal-500" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bouton pour fermer le dropdown */}
              <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-md text-center">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Fermer la liste
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Affichage des pharmacies sélectionnées */}
        {selectedPharmacies.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pharmacies sélectionnées :</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPharmacies.map((id) => {
                const pharmacy = pharmacies.find(p => p.id === id);
                return (
                  <div 
                    key={id} 
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    <span>{pharmacy?.name || id}</span>
                    <button 
                      onClick={() => handleSelectPharmacy(id)}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};

export default PharmacyDrawer;
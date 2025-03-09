import { usePharmacyContext } from "@/contexts/segmentation/PharmaciesContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiMagnifyingGlass, HiXMark, HiCheck, HiStore, HiBuildingStorefront, HiOutlineMap
} from "react-icons/hi2";
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>(filters.pharmacies || []);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  // Synchroniser l'état local avec les filtres globaux
  useEffect(() => {
    if (isOpen) {
      setSelectedPharmacies(filters.pharmacies || []);
      setSearchTerm("");
      // Focus sur le champ de recherche lors de l'ouverture
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, filters.pharmacies]);

  // Filtrer les pharmacies en fonction de la recherche
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((pharmacy) => {
      // Exclure les pharmacies sans nom
      if (!pharmacy.name || pharmacy.name.trim() === "") return false;
      
      return (pharmacy.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
             (pharmacy.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [pharmacies, searchTerm]);

  // Grouper par première lettre pour une interface plus structurée
  const pharmaciesByLetter = useMemo(() => {
    const groupedPharmacies: Record<string, typeof filteredPharmacies> = {};
    
    filteredPharmacies.forEach((pharmacy) => {
      // Vérifier à nouveau que le nom existe (par sécurité)
      if (!pharmacy.name || pharmacy.name.trim() === "") return;
      
      const firstLetter = pharmacy.name.charAt(0).toUpperCase();
      if (!groupedPharmacies[firstLetter]) {
        groupedPharmacies[firstLetter] = [];
      }
      groupedPharmacies[firstLetter].push(pharmacy);
    });
    
    return Object.entries(groupedPharmacies).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPharmacies]);

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
    setFilters({
      ...filters,
      pharmacies: selectedPharmacies,
    });
    onClose();
  };

  // Récupérer le nom d'une pharmacie par son ID
  const getPharmacyName = (id: string) => {
    const pharmacy = pharmacies.find(p => p.id === id);
    return pharmacy?.name || id;
  };

  // Animation pour les éléments de la liste
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sélection des pharmacies"
      width="w-96"
      footer={
        <div className="flex justify-between w-full">
          <ActionButton
            onClick={handleClearSelection}
            icon={<HiXMark />}
            variant="danger"
          >
            Réinitialiser
          </ActionButton>
          
          <ActionButton
            onClick={applyFilter}
            icon={<HiCheck />}
            variant="success"
          >
            Appliquer ({selectedPharmacies.length})
          </ActionButton>
        </div>
      }
    >
      <div className="p-4">
        {/* Barre de recherche */}
        <div className="sticky top-0 z-20 bg-white pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="text-gray-400" />
            </div>
            
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher une pharmacie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <HiXMark className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Compteur de sélection */}
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-xs text-gray-500">
              {selectedPharmacies.length} pharmacie(s) sélectionnée(s)
            </p>
            
            {selectedPharmacies.length > 0 && (
              <button 
                onClick={handleClearSelection}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Tout effacer
              </button>
            )}
          </div>
          
          <div className="border-t border-gray-100 mt-3"></div>
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="ml-3 text-gray-500 text-sm">Chargement des pharmacies...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg my-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Liste des pharmacies */}
        {!loading && !error && (
          <div ref={listContainerRef} className="mt-2 pb-4">
            {pharmaciesByLetter.length === 0 ? (
              <div className="text-center py-8">
                <HiStore className="mx-auto text-gray-300 text-4xl mb-2" />
                <p className="text-gray-500 text-sm">Aucune pharmacie ne correspond à votre recherche</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pharmaciesByLetter.map(([letter, groupPharmacies]) => (
                  <div key={letter} className="relative">
                    <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 rounded-md mb-2">
                      {letter}
                    </div>
                    
                    <ul className="space-y-1 pl-2">
                      {groupPharmacies.map((pharmacy) => (
                        <motion.li
                          key={pharmacy.id}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <button
                            onClick={() => handleSelectPharmacy(pharmacy.id)}
                            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors ${
                              selectedPharmacies.includes(pharmacy.id)
                                ? "bg-blue-50 border-blue-200 border"
                                : "hover:bg-gray-50/80 border border-transparent"
                            }`}
                          >
                            <div className={`mr-3 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedPharmacies.includes(pharmacy.id)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {selectedPharmacies.includes(pharmacy.id) ? (
                                <HiCheck className="w-5 h-5" />
                              ) : (
                                <HiBuildingStorefront className="w-4 h-4" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                selectedPharmacies.includes(pharmacy.id) ? "text-blue-700" : "text-gray-800"
                              }`}>
                                {pharmacy.name}
                              </p>
                              
                              {pharmacy.address && (
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                  <HiOutlineMap className="w-3 h-3 flex-shrink-0" />
                                  {pharmacy.address}
                                </p>
                              )}
                            </div>
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Affichage des pharmacies sélectionnées */}
        {selectedPharmacies.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Pharmacies sélectionnées:</p>
            <div className="max-h-28 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {selectedPharmacies.map((id) => (
                  <div 
                    key={id} 
                    className="group bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-blue-200 transition-colors hover:bg-blue-100"
                  >
                    <span className="truncate max-w-[150px]">{getPharmacyName(id)}</span>
                    <button 
                      onClick={() => handleSelectPharmacy(id)}
                      className="ml-1 text-blue-400 hover:text-blue-600 group-hover:text-blue-600"
                    >
                      <HiXMark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};

export default PharmacyDrawer;
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
  HiGlobeAlt,
  HiBars3BottomLeft,
  HiViewfinderCircle
} from "react-icons/hi2";
import Loader from "@/components/common/feedback/Loader";

// Types pour les éléments de filtrage
type SegmentationType = "labs" | "subcategories" | "specificities";

interface SegmentItem {
  name: string;
  type: SegmentationType;
  parent?: string;
  childCount?: number;
}

const SegmentationDropdown: React.FC = () => {
  // Context hooks
  const { 
    distributors,
    universes, 
    specificities,
    loading, 
    error 
  } = useSegmentationContext();
  
  const { filters, setFilters } = useFilterContext();

  // States locaux
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SegmentationType>("labs");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Récupérer les éléments sélectionnés depuis les filtres
  const selectedLabs = filters.distributors || [];
  const selectedSubCategories = filters.subCategories || [];
  const selectedSpecificities = filters.specificities || [];

  // Création des listes plates pour chaque type d'élément
  const allLabs = distributors.map((lab) => ({ 
    name: lab.lab_distributor, 
    type: "labs" as SegmentationType,
    childCount: lab.brands.length 
  }));
  
  const allSubCategories = universes.flatMap((universe) => 
    universe.categories.flatMap((category) => 
      category.sub_categories.map((subCategory) => ({
        name: subCategory.sub_category,
        type: "subcategories" as SegmentationType,
        parent: category.category
      }))
    )
  );
  
  const allSpecificities = specificities.map((specificity) => ({
    name: specificity.specificity,
    type: "specificities" as SegmentationType
  }));

  // Configuration des onglets de segmentation
  const segmentationTabs = [
    { id: "labs", label: "Laboratoires", icon: <HiBeaker /> },
    { id: "subcategories", label: "Sous-catégories", icon: <HiBars3BottomLeft /> },
    { id: "specificities", label: "Spécificités", icon: <HiViewfinderCircle /> },
  ];

  // Fonction pour obtenir les items filtrés selon l'onglet actif
  const getFilteredItems = (): SegmentItem[] => {
    let items: SegmentItem[] = [];
    
    switch (activeTab) {
      case "labs":
        items = allLabs;
        break;
      case "subcategories":
        items = allSubCategories;
        break;
      case "specificities":
        items = allSpecificities;
        break;
      default:
        items = allLabs;
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  // Les items filtrés selon l'onglet actif et le terme de recherche
  const filteredItems = getFilteredItems();

  // Vérifier si un élément est sélectionné
  const isItemSelected = (name: string, type: SegmentationType): boolean => {
    switch (type) {
      case "labs":
        return selectedLabs.includes(name);
      case "subcategories":
        return selectedSubCategories.includes(name);
      case "specificities":
        return selectedSpecificities.includes(name);
      default:
        return false;
    }
  };

  // Gérer la sélection/désélection d'un élément
  const handleSelectItem = (item: SegmentItem) => {
    const { name, type } = item;
    
    switch (type) {
      case "labs":
        setFilters({
          ...filters,
          distributors: selectedLabs.includes(name)
            ? selectedLabs.filter((lab) => lab !== name)
            : [...selectedLabs, name]
        });
        break;
      case "subcategories":
        setFilters({
          ...filters,
          subCategories: selectedSubCategories.includes(name)
            ? selectedSubCategories.filter((subCategory) => subCategory !== name)
            : [...selectedSubCategories, name]
        });
        break;
      case "specificities":
        setFilters({
          ...filters,
          specificities: selectedSpecificities.includes(name)
            ? selectedSpecificities.filter((specificity) => specificity !== name)
            : [...selectedSpecificities, name]
        });
        break;
      default:
        break;
    }
  };

  // Réinitialiser tous les filtres de segmentation
  const handleClearSelection = () => {
    setFilters({ 
      ...filters,
      distributors: [], 
      subCategories: [],
      specificities: [],
    });
    setSearchTerm("");
  };

  // Obtenir le total des éléments sélectionnés
  const getTotalSelectedItems = (): number => {
    return (
      selectedLabs.length +
      selectedSubCategories.length +
      selectedSpecificities.length
    );
  };

  // Texte affiché dans le bouton de sélection
  const getPlaceholderText = () => {
    const totalSelected = getTotalSelectedItems();
    if (totalSelected === 0) return "Segmenter les produits...";
    return `${totalSelected} élément${totalSelected > 1 ? 's' : ''} sélectionné${totalSelected > 1 ? 's' : ''}`;
  };

  // Gestionnaire pour fermer le dropdown quand on clique en dehors
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

  // Obtenir l'icône pour le type de segmentation
  const getItemIcon = (type: SegmentationType, isSelected: boolean) => {
    const iconMap = {
      labs: <HiBeaker className="w-5 h-5" />,
      subcategories: <HiBars3BottomLeft className="w-5 h-5" />,
      specificities: <HiViewfinderCircle className="w-5 h-5" />
    };
    
    if (isSelected) {
      return <HiCheck className="w-5 h-5" />;
    }
    
    return iconMap[type];
  };

  // Obtenir la couleur pour le type de segmentation
  const getItemColor = (type: SegmentationType) => {
    const colorMap = {
      labs: {
        bg: "bg-teal-50",
        border: "border-teal-200",
        text: "text-teal-700",
        icon: "text-teal-500",
        hoverBg: "hover:bg-teal-100/50"
      },
      subcategories: {
        bg: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-700",
        icon: "text-violet-500",
        hoverBg: "hover:bg-violet-100/50"
      },
      specificities: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "text-amber-500",
        hoverBg: "hover:bg-amber-100/50"
      }
    };
    
    return colorMap[type];
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
    active: (tab: SegmentationType) => ({ 
      color: getItemColor(tab).text.replace("text-", ""), 
      background: getItemColor(tab).bg.replace("bg-", "bg-opacity-75 bg-"),
      borderColor: getItemColor(tab).border.replace("border-", "")
    }),
    hover: { 
      scale: 1.02,
      y: -1
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center" ref={dropdownRef}>
      {/* Loader */}
      {loading && <Loader message="Chargement des données de segmentation..." />}

      {/* Message d'erreur */}
      {!loading && error && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 mb-6 flex items-center shadow-sm w-full"
        >
          <HiXMark className="mr-2 flex-shrink-0 text-lg" />
          <p className="text-sm">Une erreur s'est produite lors du chargement des données: {error}</p>
        </motion.div>
      )}

      {/* Interface principale */}
      {!loading && !error && (
        <div className="w-full flex flex-col items-center">
          {/* Bouton d'ouverture du dropdown */}
          <motion.button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between w-full max-w-xl bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-md hover:shadow-lg hover:border-teal-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent group"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center text-gray-700 group-hover:text-teal-700 transition-colors">
              <span className="w-9 h-9 mr-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center text-teal-600 shadow-sm border border-teal-200/50 group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                <HiGlobeAlt className="w-5 h-5" />
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

          {/* Menu déroulant */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl z-[9999] overflow-hidden max-w-3xl mx-auto w-full"
                style={{ maxHeight: '80vh' }}
              >
                {/* Onglets de catégories */}
                <div className="flex flex-wrap border-b border-gray-200 bg-gray-50/80 sticky top-0 z-[9999] p-1 gap-1">
                  {segmentationTabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      custom={tab.id as SegmentationType}
                      variants={tabVariants}
                      initial="inactive"
                      animate={activeTab === tab.id ? "active" : "inactive"}
                      whileHover="hover"
                      className="py-2 px-3 text-xs font-medium relative border-b-2 transition-all duration-300 rounded-lg flex items-center gap-1.5"
                      onClick={() => setActiveTab(tab.id as SegmentationType)}
                    >
                      {tab.icon}
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                            getItemColor(tab.id as SegmentationType).bg.replace("bg", "from")
                          }-400 to-${getItemColor(tab.id as SegmentationType).text.replace("text-", "")}-500`}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Barre de recherche */}
                <div className="p-3 border-b border-gray-200/80 bg-gray-50/30 sticky top-[53px] z-[9998]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiMagnifyingGlass className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Rechercher ${segmentationTabs.find(tab => tab.id === activeTab)?.label.toLowerCase() || ''}...`}
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
                  
                  {/* Compteur d'éléments sélectionnés */}
                  <div className="flex items-center justify-between mt-3 px-1">
                    <p className="text-xs text-gray-500">
                      {getTotalSelectedItems()} élément(s) sélectionné(s)
                    </p>
                    
                    {getTotalSelectedItems() > 0 && (
                      <button 
                        onClick={handleClearSelection}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Tout effacer
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste des éléments filtrés */}
                <div className="max-h-[40vh] overflow-y-auto py-2 px-2">
                  {filteredItems.length === 0 ? (
                    <div className="py-6 px-3 text-center text-gray-500 bg-gray-50/50 rounded-lg italic text-sm">
                      Aucun résultat trouvé
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredItems.map((item, index) => {
                        const isSelected = isItemSelected(item.name, item.type);
                        const colorStyle = getItemColor(item.type);
                        
                        return (
                          <motion.div
                            key={`${item.type}-${item.name}-${index}`}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.button
                              onClick={() => handleSelectItem(item)}
                              whileHover={{ 
                                scale: 1.01, 
                                backgroundColor: isSelected 
                                  ? colorStyle.bg.replace("bg-", "bg-opacity-90 bg-") 
                                  : "#f3f4f6" 
                              }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                                isSelected
                                  ? `${colorStyle.bg} ${colorStyle.border} border shadow-sm`
                                  : "bg-white hover:bg-gray-50 border border-transparent"
                              }`}
                            >
                              <div className={`mr-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected
                                  ? `${colorStyle.text} bg-white`
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {getItemIcon(item.type, isSelected)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isSelected ? colorStyle.text : "text-gray-800"
                                }`}>
                                  {item.name}
                                </p>
                                
                                {item.childCount ? (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                      {item.childCount} élément{item.childCount > 1 ? 's' : ''}
                                    </span>
                                  </p>
                                ) : item.parent ? (
                                  <p className="text-xs text-gray-500">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                      {item.parent}
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Affichage des éléments sélectionnés */}
          {!isDropdownOpen && getTotalSelectedItems() > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex flex-wrap gap-2 justify-center w-full"
            >
              {/* Laboratoires */}
              {selectedLabs.map((lab) => {
                const colorStyle = getItemColor("labs");
                return (
                  <motion.div 
                    key={`selected-lab-${lab}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    className={`${colorStyle.bg} ${colorStyle.text} text-xs px-3 py-1.5 rounded-full flex items-center ${colorStyle.border} border shadow-sm`}
                  >
                    <HiBeaker className={`mr-1.5 ${colorStyle.icon}`} />
                    <span className="font-medium">{lab}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectItem({ name: lab, type: "labs" });
                      }}
                      className={`ml-2 ${colorStyle.icon} hover:${colorStyle.text} p-0.5 hover:${colorStyle.hoverBg} rounded-full transition-colors`}
                    >
                      <HiXMark size={14} />
                    </button>
                  </motion.div>
                );
              })}
              
              {/* Sous-catégories */}
              {selectedSubCategories.map((subCategory) => {
                const colorStyle = getItemColor("subcategories");
                return (
                  <motion.div 
                    key={`selected-subcategory-${subCategory}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    className={`${colorStyle.bg} ${colorStyle.text} text-xs px-3 py-1.5 rounded-full flex items-center ${colorStyle.border} border shadow-sm`}
                  >
                    <HiBars3BottomLeft className={`mr-1.5 ${colorStyle.icon}`} />
                    <span className="font-medium">{subCategory}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectItem({ name: subCategory, type: "subcategories" });
                      }}
                      className={`ml-2 ${colorStyle.icon} hover:${colorStyle.text} p-0.5 hover:${colorStyle.hoverBg} rounded-full transition-colors`}
                    >
                      <HiXMark size={14} />
                    </button>
                  </motion.div>
                );
              })}
              
              {/* Spécificités */}
              {selectedSpecificities.map((specificity) => {
                const colorStyle = getItemColor("specificities");
                return (
                  <motion.div 
                    key={`selected-specificity-${specificity}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    className={`${colorStyle.bg} ${colorStyle.text} text-xs px-3 py-1.5 rounded-full flex items-center ${colorStyle.border} border shadow-sm`}
                  >
                    <HiViewfinderCircle className={`mr-1.5 ${colorStyle.icon}`} />
                    <span className="font-medium">{specificity}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectItem({ name: specificity, type: "specificities" });
                      }}
                      className={`ml-2 ${colorStyle.icon} hover:${colorStyle.text} p-0.5 hover:${colorStyle.hoverBg} rounded-full transition-colors`}
                    >
                      <HiXMark size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentationDropdown;
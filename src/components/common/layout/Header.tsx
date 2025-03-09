import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCalendarAlt, 
  FaStore, 
  FaListAlt, 
  FaTags, 
  FaBell,
  FaQuestionCircle
} from "react-icons/fa";
import DateRangeDrawer from "./DateRangeDrawer";
import PharmacyDrawer from "./PharmacyDrawer";
import ProductDrawer from "./ProductDrawer";
import { useFilterContext } from "@/contexts/FilterContext";

interface FilterBadgeProps {
  count: number;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

// Composant de badge amélioré pour les filtres
const FilterBadge: React.FC<FilterBadgeProps> = ({ count, onClick, icon, label, color }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    onClick={onClick}
    className={`group relative flex items-center bg-white/80 backdrop-blur-sm rounded-full 
                px-3 py-1.5 text-sm shadow-sm hover:shadow transition-all duration-200 
                border border-gray-200/70 focus:outline-none focus:ring-2 ${color}`}
  >
    <div className={`mr-2 ${count > 0 ? color : "text-gray-400"}`}>
      {icon}
    </div>
    <span className="text-gray-700">{label}</span>
    {count > 0 && (
      <span className={`ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full bg-white/90 ${color}`}>
        {count}
      </span>
    )}
    <motion.div
      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100"
      layoutId="filterHover"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </motion.button>
);

const Header: React.FC = () => {
  // États
  const [menuState, setMenuState] = useState({
    isDateDrawerOpen: false,
    isPharmacyFilterOpen: false,
    isProductFilterOpen: false,
    isProfileMenuOpen: false
  });
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { filters } = useFilterContext();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Compter les filtres sélectionnés
  const selectedPharmacyCount = filters.pharmacies.length;
  const selectedCategoryCount = [
    ...filters.universes,
    ...filters.categories,
    ...filters.subCategories,
    ...filters.families,
    ...filters.subFamilies,
    ...filters.specificities
  ].length;
  const selectedProductCount = filters.ean13Products?.length || 0;

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet pour fermer les menus lorsqu'on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fermer le menu profil si on clique en dehors
      if (
        menuState.isProfileMenuOpen && 
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuState(prev => ({ ...prev, isProfileMenuOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuState]);

  const toggleDrawer = (drawerName: keyof typeof menuState) => {
    setMenuState(prev => ({ ...prev, [drawerName]: !prev[drawerName] }));
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50" 
          : "bg-white/95"
      }`}
    >
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Espace vide à gauche (remplace les éléments supprimés) */}
        <div className="flex-1"></div>

        {/* Filtres et Menu profil */}
        <div className="flex items-center space-x-2">
          {/* Boutons de filtres */}
          <div className="flex space-x-2">
            <FilterBadge 
              count={0}
              onClick={() => toggleDrawer('isDateDrawerOpen')}
              icon={<FaCalendarAlt />}
              label="Période"
              color="focus:ring-teal-400"
            />
            
            <FilterBadge 
              count={selectedPharmacyCount}
              onClick={() => toggleDrawer('isPharmacyFilterOpen')}
              icon={<FaStore />}
              label="Pharmacies"
              color="focus:ring-blue-400 text-blue-500"
            />
            
            <FilterBadge 
              count={selectedCategoryCount}
              onClick={() => {}}
              icon={<FaListAlt />}
              label="Catégories"
              color="focus:ring-purple-400 text-purple-500"
            />
            
            <FilterBadge 
              count={selectedProductCount}
              onClick={() => toggleDrawer('isProductFilterOpen')}
              icon={<FaTags />}
              label="Produits"
              color="focus:ring-rose-400 text-rose-500"
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex items-center space-x-1">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 focus:outline-none relative"
            >
              <FaBell />
              <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 focus:outline-none"
            >
              <FaQuestionCircle />
            </motion.button>
            
            <div className="relative" ref={profileMenuRef}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDrawer('isProfileMenuOpen')}
                className="flex items-center space-x-1 ml-2 bg-gradient-to-br from-teal-500 to-blue-500 p-1.5 rounded-full focus:outline-none shadow-sm"
              >
                <div className="h-6 w-6 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  A
                </div>
              </motion.button>
              
              <AnimatePresence>
                {menuState.isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <p className="text-sm font-medium text-gray-900">Admin ApoData</p>
                      <p className="text-xs text-gray-500">admin@apodata.com</p>
                    </div>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors">
                      Mon profil
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors">
                      Paramètres
                    </button>
                    <div className="border-t border-gray-200/50 mt-1 pt-1">
                      <button className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-gray-100/80 transition-colors">
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* Drawers */}
      <DateRangeDrawer
        isOpen={menuState.isDateDrawerOpen}
        onClose={() => setMenuState(prev => ({ ...prev, isDateDrawerOpen: false }))}
      />
      
      <PharmacyDrawer
        isOpen={menuState.isPharmacyFilterOpen}
        onClose={() => setMenuState(prev => ({ ...prev, isPharmacyFilterOpen: false }))}
      />
      
      <ProductDrawer
        isOpen={menuState.isProductFilterOpen}
        onClose={() => setMenuState(prev => ({ ...prev, isProductFilterOpen: false }))}
      />
    </header>
  );
};

export default Header;
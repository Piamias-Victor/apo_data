import React, { useState, useRef, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaStore, 
  FaListAlt, 
  FaTags, 
  FaBars,
  FaSearch,
  FaBell,
  FaQuestionCircle,
  FaUser
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  <button
    onClick={onClick}
    className={`group relative flex items-center bg-white rounded-full px-3 py-1.5 text-sm shadow-sm hover:shadow transition-all duration-200 border border-gray-200 focus:outline-none focus:ring-2 ${color}`}
  >
    <div className={`mr-2 ${count > 0 ? color : "text-gray-400"}`}>
      {icon}
    </div>
    <span className="text-gray-700">{label}</span>
    {count > 0 && (
      <span className={`ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full bg-white ${color}`}>
        {count}
      </span>
    )}
    <motion.div
      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100"
      layoutId="filterHover"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

const Header: React.FC = () => {
  // États
  const [menuState, setMenuState] = useState({
    isMenuOpen: false,
    isDateDrawerOpen: false,
    isPharmacyFilterOpen: false,
    isProductFilterOpen: false,
    isProfileMenuOpen: false
  });
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { filters } = useFilterContext();
  const menuRef = useRef<HTMLDivElement>(null);
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
  const selectedBrandCount = [
    ...filters.brands,
    ...filters.distributors,
    ...filters.ranges
  ].length;

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
      
      // Fermer le menu principal si on clique en dehors
      if (
        menuState.isMenuOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuState(prev => ({ ...prev, isMenuOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuState.isProfileMenuOpen, menuState.isMenuOpen]);

  const toggleDrawer = (drawerName: keyof typeof menuState) => {
    setMenuState(prev => ({ ...prev, [drawerName]: !prev[drawerName] }));
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200" 
          : "bg-white"
      }`}
    >
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo et bouton de menu */}
        <div className="flex items-center">
          <button
            onClick={() => toggleDrawer('isMenuOpen')}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Menu"
          >
            <FaBars />
          </button>
          
          <Link href="/" className="ml-3 flex items-center space-x-2">
            <div className="h-8 w-8 relative">
              <Image 
                src="/logo.svg" 
                alt="ApoData Logo" 
                width={32} 
                height={32} 
                className="object-contain" 
              />
            </div>
            <span className="font-semibold text-gray-900 hidden md:block">
              ApoData
            </span>
          </Link>
          
          {/* Recherche globale */}
          <div className="hidden md:flex ml-6 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-gray-100 text-sm pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 w-56 focus:w-72 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Filtres et Menu profil */}
        <div className="flex items-center space-x-2">
          {/* Boutons de filtres */}
          <div className="hidden md:flex space-x-2">
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
              color="focus:ring-red-400 text-red-500"
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative">
              <FaBell />
              <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
              <FaQuestionCircle />
            </button>
            
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => toggleDrawer('isProfileMenuOpen')}
                className="flex items-center space-x-1 ml-2 bg-gray-100 p-1.5 rounded-full focus:outline-none hover:bg-gray-200 transition-colors"
              >
                <div className="h-6 w-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  A
                </div>
              </button>
              
              <AnimatePresence>
                {menuState.isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Admin ApoData</p>
                      <p className="text-xs text-gray-500">admin@apodata.com</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </Link>
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
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
      
      {/* Menu mobile */}
      <AnimatePresence>
        {menuState.isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="py-2 px-4 space-y-2">
              <button
                onClick={() => toggleDrawer('isDateDrawerOpen')}
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaCalendarAlt className="mr-3 text-teal-500" />
                <span>Sélectionner une période</span>
              </button>
              
              <button
                onClick={() => toggleDrawer('isPharmacyFilterOpen')}
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaStore className="mr-3 text-blue-500" />
                <span>Filtres Pharmacies</span>
                {selectedPharmacyCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {selectedPharmacyCount}
                  </span>
                )}
              </button>
              
              <button
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaListAlt className="mr-3 text-purple-500" />
                <span>Filtres Catégories</span>
                {selectedCategoryCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {selectedCategoryCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => toggleDrawer('isProductFilterOpen')}
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaTags className="mr-3 text-red-500" />
                <span>Filtres Produits</span>
                {selectedProductCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    {selectedProductCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
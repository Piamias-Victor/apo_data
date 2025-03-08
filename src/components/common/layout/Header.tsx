import { useState } from "react";
import { FaCalendarAlt, FaStore, FaListAlt, FaTags } from "react-icons/fa";
import FilterButton from "../buttons/FilterButton";
import DateRangeDrawer from "./DateRangeDrawer";
import PharmacyDrawer from "./PharmacyDrawer";
import ProductDrawer from "./ProductDrawer";
import { useFilterContext } from "@/contexts/FilterContext";


const Header: React.FC = () => {
  const [menuState, setMenuState] = useState({
    isMenuOpen: false,
    isProductFilterOpen: false,
    isPharmacyFilterOpen: false,
    isCategoryFilterOpen: false,
    isDatePickerOpen: false,
    isDateDrawerOpen: false,
  });

  const { filters } = useFilterContext();

  const selectedPharmacyCount = filters.pharmacies.length;
  const selectedCategoryCount = [
    ...filters.universes,
    ...filters.categories,
    ...filters.subCategories,
    ...filters.families,
    ...filters.subFamilies,
    ...filters.specificities
  ].length;
  
  const selectedBrandCount = [
    ...filters.brands,
    ...filters.distributors,
    ...filters.ranges
  ].length;

  return (
    <div className="navbar sticky top-0 z-40 px-6 flex justify-between items-center">
      {/* Logo */}
      <button
        onClick={() => setMenuState({ ...menuState, isMenuOpen: !menuState.isMenuOpen })}
        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-md px-4 py-2 transition"
      >
        {/* Logo content */}
      </button>

      {/* Right Section: Filters */}
      <div className="flex items-center gap-4">
        {/* Date Picker Button */}
        <FilterButton
          icon={<FaCalendarAlt className="text-blue-600" />}
          label="Sélectionner une période"
          onClick={() => setMenuState({ ...menuState, isDateDrawerOpen: !menuState.isDateDrawerOpen })}
        />

        {/* Pharmacy Filter */}
        <FilterButton
          icon={<FaStore className="text-purple-600" />}
          label="Filtres Pharmacies"
          count={selectedPharmacyCount}
          onClick={() => setMenuState({ ...menuState, isPharmacyFilterOpen: !menuState.isPharmacyFilterOpen })}
        />

        {/* Category Filter */}
        <FilterButton
          icon={<FaListAlt className="text-orange-600" />}
          label="Filtres Catégories"
          count={selectedCategoryCount}
          onClick={() => setMenuState({ ...menuState, isCategoryFilterOpen: !menuState.isCategoryFilterOpen })}
        />

        {/* Brand Filter */}
        <FilterButton
          icon={<FaTags className="text-green-600" />}
          label="Filtres Marques"
          count={selectedBrandCount}
          onClick={() => {}}
        />

        {/* Product Filter */}
        <FilterButton
          icon={<FaTags className="text-red-600" />}
          label="Filtres Produits"
          count={filters.ean13Products?.length}
          onClick={() => setMenuState({ ...menuState, isProductFilterOpen: !menuState.isProductFilterOpen })}
        />

        {/* Drawers */}
        <DateRangeDrawer
          isOpen={menuState.isDateDrawerOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isDateDrawerOpen: false }))}
        />

        <PharmacyDrawer
          isOpen={menuState.isPharmacyFilterOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isPharmacyFilterOpen: false }))}
        />

        <ProductDrawer
          isOpen={menuState.isProductFilterOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isProductFilterOpen: false }))}
        />
      </div>
    </div>
  );
};

export default Header;
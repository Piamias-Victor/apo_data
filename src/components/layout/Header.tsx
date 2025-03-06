import React, { useState } from "react";
import Image from "next/image";
import { FaCalendarAlt, FaTags, FaStore, FaListAlt, FaTimes, FaCheck } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import PharmacyDrawer from "./PharmacyDrawer";
import DateRangeDrawer from "./DateRangeDrawer";
import FilterSummary from "./FilterSummary";

const Header: React.FC = () => {
  const [menuState, setMenuState] = useState({
    isMenuOpen: false,
    isProductFilterOpen: false,
    isPharmacyFilterOpen: false,
    isCategoryFilterOpen: false,
    isDatePickerOpen: false,
    isDateDrawerOpen: false,
  });

  const { filters, setFilters } = useFilterContext();

  const selectedPharmacyCount = filters.pharmacies.length;

  return (
    <div className="navbar sticky top-0 z-40 px-6 flex justify-between items-center">
      {/* Logo */}
      <button
        onClick={() => setMenuState({ ...menuState, isMenuOpen: !menuState.isMenuOpen })}
        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-md px-4 py-2 transition"
      >
      </button>

      {/* Right Section: Filters */}
      <div className="flex items-center gap-4">
        {/* Date Picker (refait pour correspondre aux autres boutons) */}

        {/* Date Picker Button */}
        <button
          onClick={() => setMenuState({ ...menuState, isDateDrawerOpen: !menuState.isDateDrawerOpen })}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
        >
          <FaCalendarAlt className="text-blue-600" />
          <span className="text-gray-700 text-sm">
            {filters.dateRange[0] && filters.dateRange[1]
              ? `${format(filters.dateRange[0], "dd MMM yyyy", { locale: fr })} → ${format(filters.dateRange[1], "dd MMM yyyy", { locale: fr })}`
              : "Sélectionner une période"}
          </span>
        </button>

        {/* Pharmacy Filter */}
        <button
          onClick={() => setMenuState({ ...menuState, isPharmacyFilterOpen: !menuState.isPharmacyFilterOpen })}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
        >
          <FaStore className="text-purple-600" />
          <span className="text-gray-700 text-sm">
            {selectedPharmacyCount > 0 ? `${selectedPharmacyCount} sélectionnée(s)` : "Filtres Pharmacies"}
          </span>
        </button>

        {/* 📌 Sélecteur de date en pop-up */}
        <DateRangeDrawer
          isOpen={menuState.isDateDrawerOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isDateDrawerOpen: false }))}
        />

        {/* Drawer Pharmacies */}
        <PharmacyDrawer
          isOpen={menuState.isPharmacyFilterOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isPharmacyFilterOpen: false }))}
        />
        {/* Category Filter */}
{/* Category Filter */}
<button
  onClick={() => setMenuState({ ...menuState, isCategoryFilterOpen: !menuState.isCategoryFilterOpen })}
  className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
>
  <FaListAlt className="text-orange-600" />
  <span className="text-gray-700 text-sm">
    {[
      ...filters.universes,
      ...filters.categories,
      ...filters.subCategories,
      ...filters.families,
      ...filters.subFamilies,
      ...filters.specificities
    ].length > 0
      ? `${[
          ...filters.universes,
          ...filters.categories,
          ...filters.subCategories,
          ...filters.families,
          ...filters.subFamilies,
          ...filters.specificities
        ].length} sélectionné(s)`
      : "Filtres Catégories"}
  </span>
</button>

<button
  className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
>
  <FaTags className="text-green-600" />
  <span className="text-gray-700 text-sm">
    {[
      ...filters.brands,
      ...filters.distributors,
      ...filters.ranges
    ].length > 0
      ? `${[
          ...filters.brands,
          ...filters.distributors,
          ...filters.ranges
        ].length} sélectionné(s)`
      : "Filtres Marques"}
  </span>
</button>

    
        {/* Product Filter */}
        {/* <button
          onClick={() => setMenuState({ ...menuState, isProductFilterOpen: !menuState.isProductFilterOpen })}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
        >
          <FaTags className="text-green-600" />
          <span className="text-gray-700 text-sm">Filtres Produits</span>
        </button> */}
      </div>
    </div>
  );
};

export default Header;
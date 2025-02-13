import React, { useState } from "react";
import Image from "next/image";
import { FaCalendarAlt, FaTags, FaStore, FaListAlt, FaTimes, FaCheck } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import PharmacyDrawer from "./PharmacyDrawer";

const Header: React.FC = () => {
  const [menuState, setMenuState] = useState({
    isMenuOpen: false,
    isProductFilterOpen: false,
    isPharmacyFilterOpen: false,
    isCategoryFilterOpen: false,
    isDatePickerOpen: false,
  });

  const { filters, setFilters } = useFilterContext();
  const [dateRange, setDateRange] = useState([
    {
      startDate: filters.dateRange[0] || new Date(),
      endDate: filters.dateRange[1] || new Date(),
      key: "selection",
    },
  ]);

  const toggleDatePicker = () => {
    setMenuState((prev) => ({ ...prev, isDatePickerOpen: !prev.isDatePickerOpen }));
  };

  const applyDateFilter = () => {
    setFilters({ ...filters, dateRange: [dateRange[0].startDate, dateRange[0].endDate] });
    toggleDatePicker();
  };

  const clearDateFilter = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setFilters({ ...filters, dateRange: [null, null] });
    toggleDatePicker();
  };

  const selectedPharmacyCount = filters.pharmacies.length;
  const selectedCategoryCount = filters.universes.length + filters.categories.length + filters.subCategories.length;

  return (
    <div className="navbar bg-white shadow-md sticky top-0 z-50 px-6 flex justify-between items-center">
      {/* Logo */}
      <button
        onClick={() => setMenuState({ ...menuState, isMenuOpen: !menuState.isMenuOpen })}
        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-md px-4 py-2 transition"
      >
        <Image src="/logo.svg" alt="Logo" width={35} height={35} className="w-9 h-9" priority />
        <span className="text-lg font-semibold text-gray-800">Apo Data</span>
      </button>

      {/* Right Section: Filters */}
      <div className="flex items-center gap-4">
        {/* Date Picker (refait pour correspondre aux autres boutons) */}
        <div className="relative">
          <button
            onClick={toggleDatePicker}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
          >
            <FaCalendarAlt className="text-blue-600" />
            <span className="text-gray-700 text-sm">
              {dateRange[0].startDate && dateRange[0].endDate
                ? `${format(dateRange[0].startDate, "dd/MM/yyyy")} - ${format(dateRange[0].endDate, "dd/MM/yyyy")}`
                : "Plage de dates"}
            </span>
            {dateRange[0].startDate && dateRange[0].endDate && (
              <FaTimes
                className="text-gray-500 hover:text-red-500 transition cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateFilter();
                }}
              />
            )}
          </button>

          {menuState.isDatePickerOpen && (
            <div className="absolute top-full right-0 bg-white shadow-lg rounded-lg p-4 z-50">
              <DateRange
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                rangeColors={["#60A5FA"]}
                locale={fr}
                showMonthArrow
                showDateDisplay={false}
              />
              <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200">
                {/* Bouton Réinitialiser */}
                <button
                  onClick={clearDateFilter}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
                >
                  <FaTimes />
                  Effacer
                </button>

                {/* Bouton Appliquer */}
                <button
                  onClick={applyDateFilter}
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-100 transition"
                >
                  <FaCheck />
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>

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

        {/* Drawer Pharmacies */}
        <PharmacyDrawer
          isOpen={menuState.isPharmacyFilterOpen}
          onClose={() => setMenuState((prev) => ({ ...prev, isPharmacyFilterOpen: false }))}
        />
        {/* Category Filter */}
        <button
          onClick={() => setMenuState({ ...menuState, isCategoryFilterOpen: !menuState.isCategoryFilterOpen })}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
        >
          <FaListAlt className="text-orange-600" />
          <span className="text-gray-700 text-sm">
            {selectedCategoryCount > 0 ? `${selectedCategoryCount} filtre(s)` : "Filtres Catégories"}
          </span>
        </button>

        {/* Product Filter */}
        <button
          onClick={() => setMenuState({ ...menuState, isProductFilterOpen: !menuState.isProductFilterOpen })}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
        >
          <FaTags className="text-green-600" />
          <span className="text-gray-700 text-sm">Filtres Produits</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
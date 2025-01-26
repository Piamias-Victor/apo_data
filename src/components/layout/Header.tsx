import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTags, FaStore, FaListAlt, FaTimes } from "react-icons/fa";
import { useFilterContext } from "@/contexts/global/filtersContext";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import HeaderFilters from "./HeaderFilters"; // Pour les drawers

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Drawer à gauche
  const [isProductFilterOpen, setIsProductFilterOpen] = useState(false);
  const [isPharmacyFilterOpen, setIsPharmacyFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { filters, setFilters } = useFilterContext();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    filters.startDate ? new Date(filters.startDate) : null,
    filters.endDate ? new Date(filters.endDate) : null,
  ]);
  const [startDate, endDate] = dateRange;

  const applyDateFilter = () => {
    setFilters({
      ...filters,
      startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
      endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
    });
    setIsDatePickerOpen(false);
  };

  const clearDateFilter = () => {
    setDateRange([null, null]);
    setFilters({
      ...filters,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const selectedPharmacyCount = filters.pharmacy?.length || 0;
  const selectedCategoryCount =
    (filters.universe?.length || 0) +
    (filters.category?.length || 0) +
    (filters.subCategory?.length || 0);

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-white shadow-md sticky top-0 z-50 px-6 flex justify-between items-center">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-md px-4 py-2 transition"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={35}
            height={35}
            className="w-9 h-9"
            priority
          />
          <span className="text-lg font-semibold text-gray-800">Apo Data</span>
        </button>

        {/* Right Section: Filters */}
        <div className="flex items-center gap-4">
          {/* Date Picker */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-100 transition"
            >
              <FaCalendarAlt className="text-blue-600" />
              <span className="text-gray-700 text-sm">
                {startDate && endDate
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : "Plage de dates"}
              </span>
              {startDate && endDate && (
                <FaTimes
                  className="text-gray-500 hover:text-red-500 transition ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateFilter();
                  }}
                />
              )}
            </button>
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-10 p-4">
                <DatePicker
                  selected={startDate}
                  onChange={(dates: [Date | null, Date | null]) => setDateRange(dates)}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  className="rounded-lg"
                  calendarClassName="custom-calendar"
                />
                <button
                  onClick={applyDateFilter}
                  className="bg-blue-500 text-white mt-4 px-4 py-2 rounded-md shadow-md hover:bg-blue-600 w-full transition"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>

          {/* Pharmacy Filter */}
          <button
            onClick={() => setIsPharmacyFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-100 transition"
          >
            <FaStore className="text-purple-600" />
            <span className="text-gray-700 text-sm">
              {selectedPharmacyCount > 0
                ? `${selectedPharmacyCount} sélectionnée(s)`
                : "Filtres Pharmacies"}
            </span>
          </button>

          {/* Category Filter */}
          <button
            onClick={() => setIsCategoryFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-100 transition"
          >
            <FaListAlt className="text-orange-600" />
            <span className="text-gray-700 text-sm">
              {selectedCategoryCount > 0
                ? `${selectedCategoryCount} filtre(s)`
                : "Filtres Catégories"}
            </span>
          </button>

          {/* Product Filter */}
          <button
            onClick={() => setIsProductFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-100 transition"
          >
            <FaTags className="text-green-600" />
            <span className="text-gray-700 text-sm">Filtres Produits</span>
          </button>
        </div>
      </div>

      {/* Import Drawer */}
      <HeaderFilters
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isProductFilterOpen={isProductFilterOpen}
        setIsProductFilterOpen={setIsProductFilterOpen}
        isPharmacyFilterOpen={isPharmacyFilterOpen}
        setIsPharmacyFilterOpen={setIsPharmacyFilterOpen}
        isCategoryFilterOpen={isCategoryFilterOpen}
        setIsCategoryFilterOpen={setIsCategoryFilterOpen}
      />
    </>
  );
};

export default Header;
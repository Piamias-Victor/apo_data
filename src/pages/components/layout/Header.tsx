import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTags, FaStore, FaListAlt, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { useFilterContext } from "@/contexts/filtersContext";
import "react-datepicker/dist/react-datepicker.css";
import PharmacyFilter from "./PharmacyFilter";
import SegmentationFilter from "./SegmentationFilter";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const clearCategoryFilters = () => {
    setFilters({
      ...filters,
      universe: [],
      category: [],
      subCategory: [],
    });
  };

  const clearPharmacyFilters = () => {
    setFilters({
      ...filters,
      pharmacy: [],
    });
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-white shadow-md sticky top-0 z-50 px-6 flex justify-between items-center">
        {/* Logo acts as Menu Button */}
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
          {/* Date Picker Button */}
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
                  dayClassName={(date) =>
                    date >= startDate && date <= endDate ? "bg-blue-100" : ""
                  }
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

          {/* Pharmacy Filter Button */}
          <div className="relative">
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
              {selectedPharmacyCount > 0 && (
                <FaTimes
                  className="text-gray-500 hover:text-red-500 transition ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPharmacyFilters();
                  }}
                />
              )}
            </button>
          </div>

          {/* Category Filter Button */}
          <div className="relative">
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
              {selectedCategoryCount > 0 && (
                <FaTimes
                  className="text-gray-500 hover:text-red-500 transition ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCategoryFilters();
                  }}
                />
              )}
            </button>
          </div>

          {/* Product Filter Button */}
          <button
            onClick={() => setIsProductFilterOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm hover:bg-gray-100 transition"
          >
            <FaTags className="text-green-600" />
            <span className="text-gray-700 text-sm">Filtres Produits</span>
          </button>
        </div>
      </div>

      {/* DRAWERS */}
      {/* Produits */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
          isProductFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsProductFilterOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-72 bg-white shadow-lg p-6 transition-transform duration-300 ${
            isProductFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold text-gray-700 mb-4">Filtres Produits</div>
          <p className="text-gray-500">Ajoutez vos filtres produits ici.</p>
        </div>
      </div>

      {/* Pharmacies */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
          isPharmacyFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsPharmacyFilterOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-72 bg-white shadow-lg p-6 transition-transform duration-300 ${
            isPharmacyFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold text-gray-700 mb-4">Filtres Pharmacies</div>
          <PharmacyFilter />
        </div>
      </div>

      {/* Catégories */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
          isCategoryFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCategoryFilterOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-72 bg-white shadow-lg p-6 transition-transform duration-300 ${
            isCategoryFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold text-gray-700 mb-4">Filtres Catégories</div>
          <SegmentationFilter />
        </div>
      </div>
    </>
  );
};

export default Header;

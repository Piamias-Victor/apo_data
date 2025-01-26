import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTags, FaStore, FaListAlt, FaTimes, FaChartBar, FaClipboardList, FaPills, FaShoppingCart, FaWarehouse } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { useFilterContext } from "@/contexts/global/filtersContext";
import "react-datepicker/dist/react-datepicker.css";
import PharmacyFilter from "./PharmacyFilter";
import SegmentationFilter from "./SegmentationFilter";

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
          onClick={() => setIsMenuOpen(true)} // Ouvrir le drawer à gauche
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

      {/* DRAWER GAUCHE */}
      <div
  className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
    isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
  onClick={() => setIsMenuOpen(false)}
>
  <div
    className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 transition-transform duration-300 ${
      isMenuOpen ? "translate-x-0" : "-translate-x-full"
    }`}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="text-lg font-bold text-gray-700 mb-6">Menu</div>
    <ul className="space-y-6">
      <li>
        <Link href="/sell-out">
          <div className="flex items-center gap-4 p-4 bg-indigo-100 hover:bg-indigo-200 shadow-md rounded-lg transition-all">
            <FaChartBar className="text-indigo-500 h-6 w-6" />
            <span className="font-medium text-indigo-600">Sell-out</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/sell-in">
          <div className="flex items-center gap-4 p-4 bg-green-100 hover:bg-green-200 shadow-md rounded-lg transition-all">
            <FaShoppingCart className="text-green-500 h-6 w-6" />
            <span className="font-medium text-green-600">Sell-in</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/stock">
          <div className="flex items-center gap-4 p-4 bg-orange-100 hover:bg-orange-200 shadow-md rounded-lg transition-all">
            <FaWarehouse className="text-orange-500 h-6 w-6" />
            <span className="font-medium text-orange-600">Stock</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/achat">
          <div className="flex items-center gap-4 p-4 bg-sky-100 hover:bg-sky-200 shadow-md rounded-lg transition-all">
            <FaClipboardList className="text-sky-500 h-6 w-6" />
            <span className="font-medium text-sky-600">Achat</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/generiques">
          <div className="flex items-center gap-4 p-4 bg-purple-100 hover:bg-purple-200 shadow-md rounded-lg transition-all">
            <FaPills className="text-purple-500 h-6 w-6" />
            <span className="font-medium text-purple-600">Génériques</span>
          </div>
        </Link>
      </li>
    </ul>
  </div>
</div>

      {/* DRAWERS DROITE */}
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
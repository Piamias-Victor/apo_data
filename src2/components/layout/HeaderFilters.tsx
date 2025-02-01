import React from "react";
import Link from "next/link";
import { FaChartBar, FaShoppingCart, FaWarehouse, FaClipboardList, FaPills, FaHome } from "react-icons/fa";
import PharmacyFilter from "./PharmacyFilter";
import SegmentationFilter from "./SegmentationFilter";

interface HeaderFiltersProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProductFilterOpen: boolean;
  setIsProductFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPharmacyFilterOpen: boolean;
  setIsPharmacyFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCategoryFilterOpen: boolean;
  setIsCategoryFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  isProductFilterOpen,
  setIsProductFilterOpen,
  isPharmacyFilterOpen,
  setIsPharmacyFilterOpen,
  isCategoryFilterOpen,
  setIsCategoryFilterOpen,
}) => {
  return (
    <>
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
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-4 p-4 bg-teal-100 hover:bg-teal-200 shadow-md rounded-lg transition-all">
                  <FaHome className="text-teal-500 h-6 w-6" />
                  <span className="font-medium text-teal-600">Home</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/sell-out" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-4 p-4 bg-indigo-100 hover:bg-indigo-200 shadow-md rounded-lg transition-all">
                  <FaChartBar className="text-indigo-500 h-6 w-6" />
                  <span className="font-medium text-indigo-600">Sell-out</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/sell-in" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-4 p-4 bg-green-100 hover:bg-green-200 shadow-md rounded-lg transition-all">
                  <FaShoppingCart className="text-green-500 h-6 w-6" />
                  <span className="font-medium text-green-600">Sell-in</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/stock" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-4 p-4 bg-orange-100 hover:bg-orange-200 shadow-md rounded-lg transition-all">
                <FaWarehouse className="text-orange-500 h-6 w-6" />
                <span className="font-medium text-orange-600">Stock</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/achat" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-4 p-4 bg-sky-100 hover:bg-sky-200 shadow-md rounded-lg transition-all">
                <FaClipboardList className="text-sky-500 h-6 w-6" />
                <span className="font-medium text-sky-600">Achat</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/generiques" onClick={() => setIsMenuOpen(false)}>
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

export default HeaderFilters;
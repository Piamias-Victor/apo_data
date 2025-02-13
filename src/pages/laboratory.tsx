// src/pages/laboratory.tsx
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import SalesDataComponent from "@/components/laboratory/test";
import TopProductsComponent from "@/components/laboratory/test2";
import PharmacySalesList from "@/components/laboratory/test3";
import Tabs from "@/components/misc/Tabs";
import StockBreakRate from "@/components/laboratory/StockBreakRate";
import SegmentationDisplay from "@/components/laboratory/SegmentationDisplay";
import CatalogProducts from "@/components/laboratory/Catalogue";
import SegmentationRevenueComponent from "@/components/laboratory/SegmentationRevenue";
import SegmentationDebugComponent from "@/components/laboratory/check";
import New from "@/components/laboratory/New";
import SalesByRange from "@/components/laboratory/New";
import SalesDataDisplay from "@/components/JSON";
import SalesTable from "@/components/laboratory/Last";

const LaboratoryPage: React.FC = () => {
  const { distributors, loading, error } = useSegmentationContext();
  const { filters, setFilters } = useFilterContext(); // Contexte des filtres

  const [selectedLabs, setSelectedLabs] = useState<string[]>(filters.distributors || []);
  const [selectedRanges, setSelectedRanges] = useState<string[]>(filters.ranges || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(filters.brands || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const filteredLabs = Array.from(
    new Map(
      distributors.flatMap((lab) => [
        { name: lab.lab_distributor, type: "lab" }, // ✅ Stocke avec type "lab"
        ...lab.brands.map((brand) => ({ name: brand.brand_lab, type: "brand" })) // ✅ Stocke avec type "brand"
      ]).map((item) => [item.name, item]) // 🔹 Utilise Map pour supprimer les doublons (clé = name)
    ).values()
  ).filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const handleSelectLab = (item: string) => {
    const isLab = distributors.some((lab) => lab.lab_distributor === item);
    
    if (isLab) {
      setSelectedLabs([item]);
      setSelectedBrands([]);
      setFilters({ distributors: [item], brands: [], ranges: selectedRanges }); // ✅ Mise à jour immédiate
    } else {
      setSelectedBrands([item]);
      setSelectedLabs([]);
      setFilters({ distributors: [], brands: [item], ranges: selectedRanges }); // ✅ Mise à jour immédiate
    }
  
    setIsDropdownOpen(false); // ✅ Ferme le dropdown après sélection
  };

  // Appliquer les filtres au contexte global
  const handleApplyFilters = () => {
    setFilters({
      distributors: selectedLabs, // ✅ Stocke seulement les laboratoires ici
      brands: selectedBrands, // ✅ Stocke les marques ici
      ranges: selectedRanges,
    });
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedLabs([]);
    setSelectedBrands([]);
    setSelectedRanges([]);
    setFilters({ distributors: [], ranges: [] });
  };

  const tabItems = [
    {
      label: "📊 Global",
      content: <SalesDataComponent />,
    },
    {
      label: "⭐ Produits",
      content: <TopProductsComponent />,
    },
    {
      label: "🏥 Pharmacies",
      content: <PharmacySalesList />,
    },
    {
      label: "🚨 Rupture",
      content: <StockBreakRate />,
    },
    {
      label: "🔍 Segmentation",
      content: <SegmentationRevenueComponent />,
    },
    {
      label: "📖 Catalogue",
      content: <SalesTable />,
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sélectionner un Laboratoire</h1>

      {loading && <p className="text-gray-600">Chargement des laboratoires...</p>}
      {error && <p className="text-red-600">Erreur : {error}</p>}

      {!loading && !error && (
        <div className="relative max-w-lg mx-auto">
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 text-sm truncate">
              {selectedLabs.length + selectedBrands.length > 0
                ? `${selectedLabs.length + selectedBrands.length} sélectionné(s)`
                : "Choisir un laboratoire ou une marque"}
            </span>
            <FaChevronDown className="text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
              <div className="p-3 border-b border-gray-200 flex items-center bg-gray-100 rounded-t-md">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Rechercher un laboratoire..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
              {filteredLabs.map((item, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                    (item.type === "lab" && selectedLabs.includes(item.name)) || 
                    (item.type === "brand" && selectedBrands.includes(item.name)) ? "bg-teal-100" : ""
                  }`}
                  onClick={() => handleSelectLab(item.name)}
                >
                  <span className="text-sm text-gray-700 flex-1">
                    {item.name} {item.type === "brand"} {/* Facultatif pour indiquer une marque */}
                  </span>
                  {(selectedLabs.includes(item.name) || selectedBrands.includes(item.name)) && (
                    <FaCheck className="text-teal-500" />
                  )}
                </div>
              ))}
              </div>

              <div className="flex justify-start items-center gap-3 p-3 border-t border-gray-200">
                <button
                  onClick={handleClearSelection}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
                >
                  <FaTimes />
                  Effacer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Laboratoires sélectionnés</h2>
            <button
              onClick={toggleCollapse}
              className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2"
            >
              {isCollapsed ? "Afficher les détails" : "Masquer les détails"}
              {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>

          {[...selectedLabs, ...selectedBrands].map((item) => {
          // Trouver si c'est un laboratoire
          const labData = distributors.find((d) => d.lab_distributor === item);

          // Trouver si c'est une marque (brand)
          const brandData = distributors.flatMap((d) => d.brands).find((b) => b.brand_lab === item);

          // Récupérer les gammes (ranges)
          // Assurer que chaque gamme est unique avec un Set
          const rangesSet = new Set<string>();

          if (labData?.brands) {
            labData.brands.forEach((brand) => {
              if (Array.isArray(brand.ranges)) {
                brand.ranges.forEach((range: { range_name: string }) => {
                  if (range.range_name) {
                    rangesSet.add(range.range_name);
                  }
                });
              }
            });
          }

          if (brandData?.ranges) {
            if (Array.isArray(brandData.ranges)) {
              brandData.ranges.forEach((range: { range_name: string }) => {
                if (range.range_name) {
                  rangesSet.add(range.range_name);
                }
              });
            }
          }

          // Convertir Set en tableau pour l'affichage
          return (
            <div key={item} className="mt-2">
              <p className="font-medium text-teal-700">{item}</p>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden flex flex-wrap gap-2"
                  >
                    <SegmentationDisplay />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        </div>
        <div className="mt-8">
          <Tabs tabs={tabItems} defaultIndex={0} />
        </div>
    </div>
  );
};

export default LaboratoryPage;
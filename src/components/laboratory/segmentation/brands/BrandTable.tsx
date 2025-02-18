import Loader from "@/components/ui/Loader";
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { motion } from "framer-motion";
import React, { useState, useEffect, useMemo } from "react";
import { FaSort, FaChevronRight, FaTag, FaWarehouse } from "react-icons/fa";
import SalesDataComponent from "../../global/sales/SalesDataComponent";
import BrandSalesStockChart from "./BrandSalesStockChart";
import Link from "next/link";
interface Brand {
  brand_lab: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_margin: number;  // ❌ Supprimé de l'affichage, mais toujours utilisé pour le calcul
  total_purchase: number; // ✅ Ajout du montant d'achat total
  avg_sale_price: number;
  min_sale_price: number;
  max_sale_price: number;
  avg_purchase_price: number;
  pharmacies_in_stock: number;
  revenue_share: number;
  margin_share: number;
  rentability_index: number;
  margin_percentage: number; // ✅ Nouveau champ pour afficher le pourcentage de marge
}

const BrandTable: React.FC = () => {
  const { filters } = useFilterContext();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTotalMode, setIsTotalMode] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Brand | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const hasSelectedFilters =
    filters.distributors.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0;

  // 📌 Traduction des colonnes
  const columnHeaders: { [key in keyof Brand]: string } = {
    brand_lab: "Marque",
    total_quantity_sold: "Quantité Vendue",
    total_revenue: "Chiffre d'Affaires (€)",
    total_purchase: "Montant d'Achat (€)", // ✅ Ajouté
    margin_percentage: "Marge (%)", // ✅ Ajouté
    avg_sale_price: "Prix de Vente(€)",
    min_sale_price: "Prix Min(€)",
    max_sale_price: "Prix Max(€)",
    avg_purchase_price: "Prix d'Achat(€)",
    pharmacies_in_stock: "Pharmacies en Stock",
    revenue_share: "Part CA (%)",
    margin_share: "Part Marge (%)",
    rentability_index: "Indice Rentabilité",
  };

  // 🚀 **Appel API pour récupérer les données**
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/segmentation/getBrandsData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) throw new Error("Erreur lors de la récupération des marques");
  
        const data = await response.json();
  
        // ✅ Ajout du calcul du pourcentage de marge
        const processedBrands = data.brands.map((brand: Brand) => ({
          ...brand,
          margin_percentage: brand.total_revenue > 0
            ? ((brand.total_margin / brand.total_revenue) * 100).toFixed(2) // ✅ Conversion en pourcentage
            : "0.00",
        }));
  
        setBrands(processedBrands);
      } catch (err) {
        setError("Impossible de charger les marques");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBrands();
  }, [filters]);

  // 🔽🔼 Fonction de tri
  const toggleSort = (column: keyof Brand) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 🔍 **Filtrage et tri des marques**
  const filteredBrands = useMemo(() => {
    let sorted = brands
      .map((brand) => ({
        ...brand,
        rentability_index: brand.margin_share - brand.revenue_share, // ✅ Calcul dynamique de l'indice
      }))
      .filter(
        (b) =>
          (b.brand_lab.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.lab_distributor.toLowerCase().includes(searchQuery.toLowerCase())) &&
          b.total_quantity_sold > 0 // Filtrer les marques avec 0 ventes si nécessaire
      );

    if (sortColumn) {
      sorted = sorted.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (typeof valA === "string") valA = parseFloat(valA);
        if (typeof valB === "string") valB = parseFloat(valB);

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return sorted;
  }, [searchQuery, sortColumn, sortOrder, brands]);

  // 📌 **Toggle détails de la marque**
  const toggleDetails = (brand: string) => {
    if (expandedBrand === brand) {
      setExpandedBrand(null);
    } else {
      setExpandedBrand(brand);
    }
  };

  // ✅ Fonction pour basculer entre valeurs unitaires et totales
const getDisplayValue = (brand: Brand, field: keyof Brand) => {
  if (isTotalMode) {
    // 🔹 Mode Total → Affichage des montants totaux
    if (field === "total_revenue" || field === "total_purchase") {
      return formatLargeNumber(brand[field]); // Affiche les montants
    }
  } else {
    // 🔹 Mode Unitaire → Affichage des moyennes
    if (field === "total_revenue") return formatLargeNumber(brand.avg_sale_price); // Prix moyen de vente
    if (field === "total_purchase") return formatLargeNumber(brand.avg_purchase_price); // Prix moyen d'achat
  }
  
  return formatLargeNumber(brand[field]); // Par défaut, affiche normalement
};

  if (!hasSelectedFilters) return <p className="text-center">Sélectionnez un filtre pour afficher les données.</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-teal-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-yellow-500">📊</span> Suivi des Performances Commerciales
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Analyse des ventes, marges et prévisions pour une gestion optimale 📈
        </p>
      </motion.div>

      {/* 📊 Section des données de ventes */}
      <SalesDataComponent />

      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-teal-300">
        {/* 🔍 Barre de recherche et mode total */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou code..."
            className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsTotalMode(!isTotalMode)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            {isTotalMode ? "Valeurs Unitaires" : "Totaux"}
          </button>
        </div>

        {/* 🚀 **Affichage du Loader ou de l'erreur** */}
        {loading && <Loader message="Chargement des marques..." />}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* 📊 Tableau */}
        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                {["brand_lab", "total_quantity_sold", "total_revenue", "total_purchase", "margin_percentage", "rentability_index"].map(
                  (col) => (
                    <th key={col} className="p-3 cursor-pointer" onClick={() => toggleSort(col as keyof Brand)}>
                      {columnHeaders[col as keyof Brand]} <FaSort className="inline-block ml-1" />
                    </th>
                  )
                )}
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand) => (
                <React.Fragment key={brand.brand_lab}>
                  <tr className="border-b hover:bg-teal-50">
                  <td className="p-3">
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/laboratory?brand=${encodeURIComponent(brand.brand_lab)}`}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    {brand.brand_lab}
                  </Link>
                </td>
                    <td className="p-3 text-center">{formatLargeNumber(brand.total_quantity_sold, false)}</td>
                    
                    {/* ✅ Utilisation de getDisplayValue pour alterner entre CA total et prix unitaire */}
                    <td className="p-3 text-center">{getDisplayValue(brand, "total_revenue")}</td>
                    
                    {/* ✅ Utilisation de getDisplayValue pour alterner entre Achat total et prix unitaire */}
                    <td className="p-3 text-center">{getDisplayValue(brand, "total_purchase")}</td>
                    
                    <td className="p-3 text-center">{brand.margin_percentage} %</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          brand.rentability_index > 0 ? "bg-green-400 text-white" 
                          : brand.rentability_index < 0 ? "bg-red-400 text-white" 
                          : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {brand.rentability_index > 0 ? "+" : ""}
                        {brand.rentability_index.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <motion.button
                        animate={{ rotate: expandedBrand === brand.brand_lab ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => toggleDetails(brand.brand_lab)}
                        className="p-2 rounded-full bg-teal-600"
                      >
                        <FaChevronRight className="text-white text-lg" />
                      </motion.button>
                    </td>
                  </tr>
                  {expandedBrand === brand.brand_lab && (
                      <tr>
                      <td colSpan={7} className="p-4 bg-teal-100 shadow-md">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col w-full text-teal-900 p-2"
                        >
                          <div className="flex items-center gap-2 w-full justify-between text-teal-900 p-2">
                            <p className="flex items-center gap-2">
                              <FaWarehouse className="text-gray-700" />
                              <strong>Pharmacies en Stock :</strong> {brand.pharmacies_in_stock}
                            </p>
                      
                            {/* 📊 Part du Chiffre d'Affaires */}
                            <p className="flex items-center gap-2 font-bold">
                              <FaTag className="text-gray-700" />
                              <strong>Part du CA :</strong> {brand.revenue_share}%
                            </p>
                      
                            {/* 📈 Part de la Marge */}
                            <p className="flex items-center gap-2 font-bold">
                              <FaTag className="text-gray-700" />
                              <strong>Part de la Marge :</strong> {brand.margin_share}%
                            </p>
                          </div>
                          {/* 📦 Nombre de pharmacies en stock */}
                          <BrandSalesStockChart brandLab={brand.brand_lab} />
                        </motion.div>
                      </td>
                    </tr>
                  )}                  
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrandTable;
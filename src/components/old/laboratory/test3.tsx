import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaChartLine, FaMoneyBillWave, FaBoxOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

interface PharmacySales {
  pharmacy_id: string;
  pharmacy_name: string;
  id_nat: string;
  address: string;
  total_quantity?: number;
  revenue?: number;
  margin?: number;
  purchase_quantity?: number;
  purchase_amount?: number;
}

// Fonction pour formater les nombres
const formatLargeNumber = (value: any, isCurrency: boolean = false): string => {
  const num = parseFloat(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
  return isCurrency ? `${num.toFixed(2).replace(".", ",")} €` : num.toFixed(2).replace(".", ",");
};

// Couleurs pour les 3 premières places (médaille d'or, d'argent, de bronze)
const medalColors = [
  "from-yellow-400 to-yellow-600", // 🥇 Or
  "from-gray-400 to-gray-600", // 🥈 Argent
  "from-orange-500 to-orange-700", // 🥉 Bronze
];

// Couleurs aléatoires pour les autres cartes dans les tons bleus
const randomColors = [
  "from-blue-500 to-blue-700",
  "from-teal-500 to-teal-700",
  "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
  "from-sky-500 to-sky-700",
];

const PharmacySalesList: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [pharmacySales, setPharmacySales] = useState<PharmacySales[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false); // ✅ État pour afficher plus

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchPharmacySales = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getSalesByPharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Échec du fetch des données");

        const data = await response.json();
        setPharmacySales(data.pharmacySales);
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacySales();
  }, [filters]);

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir les données.</p>;
  }

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* 📌 Titre + Bouton "Afficher plus" en haut */}
      <div className="flex justify-end items-center">

        {/* 📌 Bouton Afficher plus / moins */}
        {pharmacySales.length > 3 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition flex items-center"
          >
            {showMore ? "Masquer" : "Afficher plus"}
            {showMore ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
        )}
      </div>

      {/* 🌀 Loader */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* 📌 Liste des pharmacies */}
      <AnimatePresence>
        {!loading && !error && pharmacySales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {pharmacySales.slice(0, showMore ? pharmacySales.length : 3).map((pharmacy, index) => {
              // Appliquer les couleurs de médaille pour les 3 premiers, sinon choisir une couleur aléatoire
              const bgColor =
                index < 3 ? medalColors[index] : randomColors[index % randomColors.length];

              return (
                <motion.div
                  key={index}
                  className={`p-6 bg-gradient-to-r ${bgColor} text-white rounded-xl shadow-lg flex justify-between items-center`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* 📌 Infos Pharmacie */}
                  <div>
                    <h3 className="text-lg font-semibold">{pharmacy.pharmacy_name}</h3>
                  </div>

                  {/* 📌 Valeurs affichées */}
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <FaShoppingCart className="text-2xl mx-auto" />
                      <p className="text-xl font-bold">{formatLargeNumber(pharmacy.total_quantity, false)}</p>
                      <p className="text-sm">Ventes</p>
                    </div>
                    <div className="text-center">
                      <FaChartLine className="text-2xl mx-auto" />
                      <p className="text-xl font-bold">{formatLargeNumber(pharmacy.revenue)}</p>
                      <p className="text-sm">CA</p>
                    </div>
                    <div className="text-center">
                      <FaMoneyBillWave className="text-2xl mx-auto" />
                      <p className="text-xl font-bold">{formatLargeNumber(pharmacy.margin)}</p>
                      <p className="text-sm">Marge</p>
                    </div>
                    <div className="w-px h-18 bg-white opacity-30"></div>
                    <div className="text-center">
                      <FaBoxOpen className="text-2xl mx-auto" />
                      <p className="text-xl font-bold">{formatLargeNumber(pharmacy.purchase_quantity, false)}</p>
                      <p className="text-sm">Achats</p>
                    </div>
                    <div className="text-center">
                      <FaMoneyBillWave className="text-2xl mx-auto" />
                      <p className="text-xl font-bold">{formatLargeNumber(pharmacy.purchase_amount)}</p>
                      <p className="text-sm">Montant Achat</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* 🔴 Si aucune donnée */}
        {!loading && !error && pharmacySales.length === 0 && (
          <p className="text-gray-500 text-center mt-4">Aucune donnée disponible pour ce laboratoire.</p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PharmacySalesList;
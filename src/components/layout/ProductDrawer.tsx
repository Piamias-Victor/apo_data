import { useFilterContext } from "@/contexts/FilterContext";
import React, { useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters } = useFilterContext();
  const [ean13Input, setEan13Input] = useState(filters.ean13Products?.join("\n") || ""); // ✅ Initialise avec les valeurs actuelles

  // Réinitialiser la sélection
  const handleClearSelection = () => {
    setEan13Input(""); // ✅ Efface la liste des EAN13
  };

  // Fonction pour formater les EAN13 et regrouper en paquets de 13 chiffres
  const formatEan13 = (input: string) => {
    const digitsOnly = input.replace(/\D+/g, ""); // 🔥 Supprime tout sauf les chiffres
    const groupedEan13: string[] = [];

    for (let i = 0; i < digitsOnly.length; i += 13) {
      const chunk = digitsOnly.substring(i, i + 13);
      if (chunk.length === 13) { // ✅ Vérifie qu'on a bien un EAN13 complet
        groupedEan13.push(chunk);
      }
    }

    return groupedEan13;
  };

  // Appliquer le filtre au contexte global
  const applyFilter = () => {
    console.log("ean13Input avant nettoyage :", ean13Input);

    const validEan13 = formatEan13(ean13Input); // 🔄 Formate et regroupe les EAN13

    console.log("validEan13 après traitement :", validEan13);

    // ✅ Mise à jour du contexte en conservant les autres filtres
    setFilters({
      ...filters, // 🔥 Garde les filtres existants
      ean13Products: validEan13, // ✅ Ajoute les codes EAN13 dans le contexte
    });

    onClose(); // Fermer le drawer après application
  };

  return (
    <>
      {/* Overlay noir semi-transparent */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        {/* Header du Drawer */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtres Produits</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Contenu du Drawer */}
        <div className="p-4 space-y-6">
          {/* 🔢 Saisie des Codes EAN13 */}
          <div>
            <p className="text-gray-600 text-sm">Coller des codes EAN13 :</p>
            <textarea
              value={ean13Input}
              onChange={(e) => setEan13Input(e.target.value)}
              placeholder="Collez ici une liste de codes EAN13, peu importe le format..."
              className="w-full border border-gray-300 rounded-md p-3 text-sm shadow-md focus:border-teal-500 focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              rows={5}
            ></textarea>
          </div>

          {/* Boutons Effacer & Appliquer */}
          <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200 rounded-b-md">
            {/* Bouton Effacer */}
            <button
              onClick={handleClearSelection}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 transition"
            >
              <FaTimes />
              Effacer
            </button>

            {/* Bouton Appliquer */}
            <button
              onClick={applyFilter}
              className="flex items-center justify-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-100 transition"
            >
              <FaCheck />
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDrawer;
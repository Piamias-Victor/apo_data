// src/components/SelectedLabs.tsx
import React from "react";
import { FaChevronUp, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedLabs: string[];
  selectedRanges: { [key: string]: string[] };
  setSelectedRanges: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  handleApplyFilters: () => void;
  handleClearRanges: () => void;
  distributors: { lab_distributor: string; brands: { ranges: { range_name: string }[] }[] }[];
}

const SelectedLabs: React.FC<Props> = ({
  selectedLabs,
  selectedRanges,
  setSelectedRanges,
  handleApplyFilters,
  handleClearRanges,
  distributors,
}) => {
  return (
    <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-md p-4">
      <h2 className="text-lg font-semibold">Laboratoires sélectionnés</h2>

      {/* Boutons Appliquer & Effacer */}
      <div className="flex justify-between items-center mt-3">
        <button onClick={handleClearRanges} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
          <FaTimes /> Effacer les gammes
        </button>
        <button onClick={handleApplyFilters} className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition">
          <FaCheck /> Appliquer les gammes
        </button>
      </div>
    </div>
  );
};

export default SelectedLabs;
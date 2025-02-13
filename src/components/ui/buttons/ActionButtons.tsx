import { FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  onApply: () => void;
  onReset: () => void;
  isApplied: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onApply, onReset, isApplied }) => {
  return (
    <div className="flex justify-between items-center gap-3 py-3 my-2 border-t border-gray-200 w-full">
      {/* Bouton Effacer */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 border border-red-500 transition"
      >
        <FaTimes />
        Effacer
      </button>

      {/* Bouton Appliquer */}
      <motion.button
        onClick={onApply}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm shadow-sm transition border ${
          isApplied
            ? "bg-teal-50 text-teal-600 border-teal-500 animate-pulse"
            : "bg-teal-50 text-teal-600 border-teal-500 hover:bg-teal-100"
        }`}
      >
        <FaCheck />
        {isApplied ? "Filtres appliqués !" : "Appliquer"}
      </motion.button>
    </div>
  );
};

export default ActionButtons;
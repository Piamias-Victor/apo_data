// components/ui/PercentageControl.tsx
import React from "react";
import { FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";

interface PercentageControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accentColor?: string;
}

const PercentageControl: React.FC<PercentageControlProps> = ({ 
  value, 
  onChange, 
  min = -100, 
  max = 100,
  accentColor = "text-teal-600"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative flex items-center bg-gray-100 rounded-lg px-4 py-2 shadow-md border border-gray-300"
    >
      {/* Bouton de diminution */}
      <button
        className="bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
        onClick={() => onChange(Math.max(value - 1, min))}
      >
        <FaMinus className="text-gray-600 text-xs" />
      </button>

      {/* Input */}
      <div className="flex items-center mx-3">
        <input
          type="number"
          className="w-14 text-center text-gray-800 bg-transparent outline-none appearance-none no-spinner font-bold"
          placeholder="0"
          value={value}
          onChange={(e) => {
            const newVal = parseFloat(e.target.value) || 0;
            onChange(Math.max(Math.min(newVal, max), min));
          }}
          min={min}
          max={max}
        />
        <FaPercentage className={`${accentColor} text-sm`} />
      </div>

      {/* Bouton d'augmentation */}
      <button
        className="bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        <FaPlus className="text-gray-600 text-xs" />
      </button>
    </motion.div>
  );
};

export default PercentageControl;
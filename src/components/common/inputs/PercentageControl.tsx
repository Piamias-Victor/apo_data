// components/ui/PercentageControl.tsx
import React, { useState } from "react";
import { FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface PercentageControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accentColor?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange" | "gray" | "red";
  size?: "sm" | "md" | "lg";
  withAnimation?: boolean;
  disabled?: boolean;
  withShadow?: boolean;
  variant?: "filled" | "outlined" | "glassmorphic" | "minimal";
}

const PercentageControl: React.FC<PercentageControlProps> = ({ 
  value, 
  onChange, 
  min = -100, 
  max = 100,
  accentColor = "teal",
  size = "md",
  withAnimation = true,
  disabled = false,
  withShadow = true,
  variant = "filled"
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Configuration des couleurs
  const colorConfig = {
    teal: {
      icon: "text-teal-600",
      button: "bg-teal-100 hover:bg-teal-200 text-teal-700 active:bg-teal-300",
      input: "focus:border-teal-500",
      focus: "ring-teal-400/50",
      slider: "from-teal-500 to-teal-400"
    },
    blue: {
      icon: "text-blue-600",
      button: "bg-blue-100 hover:bg-blue-200 text-blue-700 active:bg-blue-300",
      input: "focus:border-blue-500",
      focus: "ring-blue-400/50",
      slider: "from-blue-500 to-blue-400"
    },
    purple: {
      icon: "text-purple-600",
      button: "bg-purple-100 hover:bg-purple-200 text-purple-700 active:bg-purple-300",
      input: "focus:border-purple-500", 
      focus: "ring-purple-400/50",
      slider: "from-purple-500 to-purple-400"
    },
    indigo: {
      icon: "text-indigo-600",
      button: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 active:bg-indigo-300",
      input: "focus:border-indigo-500",
      focus: "ring-indigo-400/50",
      slider: "from-indigo-500 to-indigo-400"
    },
    rose: {
      icon: "text-rose-600",
      button: "bg-rose-100 hover:bg-rose-200 text-rose-700 active:bg-rose-300",
      input: "focus:border-rose-500",
      focus: "ring-rose-400/50",
      slider: "from-rose-500 to-rose-400"
    },
    orange: {
      icon: "text-orange-600",
      button: "bg-orange-100 hover:bg-orange-200 text-orange-700 active:bg-orange-300",
      input: "focus:border-orange-500",
      focus: "ring-orange-400/50",
      slider: "from-orange-500 to-orange-400"
    },
    red: {
      icon: "text-red-600",
      button: "bg-red-100 hover:bg-red-200 text-red-700 active:bg-red-300",
      input: "focus:border-red-500",
      focus: "ring-red-400/50",
      slider: "from-red-500 to-red-400"
    },
    gray: {
      icon: "text-gray-600",
      button: "bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300",
      input: "focus:border-gray-500",
      focus: "ring-gray-400/50",
      slider: "from-gray-500 to-gray-400"
    }
  };

  const colors = colorConfig[accentColor];

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      height: "h-8",
      button: "p-1.5 text-xs",
      iconSize: "text-xs",
      input: "text-xs w-12 h-6",
      gap: "gap-1",
      padding: "px-2 py-1"
    },
    md: {
      height: "h-10",
      button: "p-2 text-sm",
      iconSize: "text-sm",
      input: "text-sm w-14 h-7",
      gap: "gap-2",
      padding: "px-3 py-2"
    },
    lg: {
      height: "h-12",
      button: "p-2.5 text-base",
      iconSize: "text-base",
      input: "text-base w-16 h-8",
      gap: "gap-3",
      padding: "px-4 py-2.5"
    }
  };

  const sizes = sizeConfig[size];

  // Configuration des variantes
  const variantConfig = {
    filled: {
      container: "bg-gray-100 border border-gray-200",
      input: "bg-white border border-gray-300",
      focus: `focus:ring-2 ring-opacity-50`
    },
    outlined: {
      container: "bg-white border border-gray-200",
      input: "bg-white border border-gray-300",
      focus: `focus:ring-2 ring-opacity-50`
    },
    glassmorphic: {
      container: "bg-white/30 backdrop-blur-md border border-white/50",
      input: "bg-white/50 backdrop-blur-sm border border-white/60",
      focus: `focus:ring-2 ring-opacity-50 focus:bg-white/80`
    },
    minimal: {
      container: "bg-transparent border-b border-gray-200",
      input: "bg-transparent border-b border-gray-300",
      focus: "focus:border-b-2"
    }
  };

  const variantStyle = variantConfig[variant];

  // Configuration des décrémentations/incrémentations
  const step = 1;
  const decreaseValue = () => onChange(Math.max(value - step, min));
  const increaseValue = () => onChange(Math.min(value + step, max));

  // Calculer le pourcentage pour le slider visuel
  const percentage = ((value - min) / (max - min)) * 100;

  // Animation du bouton
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative flex items-center ${variantStyle.container} 
                rounded-lg ${sizes.padding} ${withShadow ? 'shadow-md' : ''}
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                ${focused ? `${colors.focus} ${variantStyle.focus}` : 'hover:border-gray-300'}
                transition-all duration-300`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fond animé selon la valeur */}
      {withAnimation && (
        <div className="absolute inset-0 overflow-hidden rounded-lg z-0">
          <div 
            className={`absolute left-0 bottom-0 top-0 bg-gradient-to-r ${colors.slider} opacity-10 transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}

      {/* Bouton de diminution */}
      <motion.button
        className={`${sizes.button} ${colors.button} rounded-full z-10
                   ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                   transition-colors duration-200 focus:outline-none focus:ring-2 ring-opacity-50`}
        onClick={decreaseValue}
        disabled={disabled || value <= min}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <FaMinus className={`${sizes.iconSize} ${value <= min ? 'opacity-50' : ''}`} />
      </motion.button>

      {/* Container de l'input et de l'icône */}
      <div className={`flex items-center mx-3 ${sizes.gap}`}>
        <input
          type="number"
          className={`${sizes.input} text-center text-gray-800 ${variantStyle.input} 
                      outline-none appearance-none z-10 font-medium
                      rounded ${colors.input} transition-all duration-200
                      ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="0"
          value={value}
          onChange={(e) => {
            const newVal = parseFloat(e.target.value) || 0;
            onChange(Math.max(Math.min(newVal, max), min));
          }}
          min={min}
          max={max}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <motion.div 
          className={`${colors.icon} ${sizes.iconSize} z-10`}
          animate={{ 
            scale: hovered || focused ? 1.2 : 1,
            rotate: hovered || focused ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            scale: { type: "spring", stiffness: 400, damping: 10 },
            rotate: { duration: 0.5, ease: "easeInOut" }
          }}
        >
          <FaPercentage />
        </motion.div>
      </div>

      {/* Bouton d'augmentation */}
      <motion.button
        className={`${sizes.button} ${colors.button} rounded-full z-10
                   ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                   transition-colors duration-200 focus:outline-none focus:ring-2 ring-opacity-50`}
        onClick={increaseValue}
        disabled={disabled || value >= max}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <FaPlus className={`${sizes.iconSize} ${value >= max ? 'opacity-50' : ''}`} />
      </motion.button>
    </motion.div>
  );
};

export default PercentageControl;
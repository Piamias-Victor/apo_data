import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaHistory } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange" | "gray" | "red";
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
  withHistory?: boolean;
  historyItems?: string[];
  onHistoryItemSelect?: (item: string) => void;
  onSearch?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  variant?: "default" | "outlined" | "filled" | "minimal" | "glassmorphic";
  size?: "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animationVariant?: "fade" | "scale" | "slide";
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher...",
  accentColor = "teal",
  onClear,
  autoFocus = false,
  className = "",
  withHistory = false,
  historyItems = [],
  onHistoryItemSelect,
  onSearch,
  onKeyDown,
  variant = "default",
  size = "md",
  rounded = "md",
  animationVariant = "fade"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Configuration des couleurs selon la prop accentColor
  const colorConfig = {
    teal: {
      ring: "ring-teal-400/60",
      text: "text-teal-600",
      border: "border-teal-500",
      bg: "bg-teal-50",
      hoverBg: "hover:bg-teal-100/80",
      iconColor: "text-teal-500",
      focusBg: "bg-white",
      historyBg: "bg-teal-50/80"
    },
    blue: {
      ring: "ring-blue-400/60",
      text: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100/80",
      iconColor: "text-blue-500",
      focusBg: "bg-white",
      historyBg: "bg-blue-50/80"
    },
    purple: {
      ring: "ring-purple-400/60",
      text: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-50",
      hoverBg: "hover:bg-purple-100/80",
      iconColor: "text-purple-500",
      focusBg: "bg-white",
      historyBg: "bg-purple-50/80"
    },
    indigo: {
      ring: "ring-indigo-400/60",
      text: "text-indigo-600",
      border: "border-indigo-500",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100/80",
      iconColor: "text-indigo-500",
      focusBg: "bg-white",
      historyBg: "bg-indigo-50/80"
    },
    rose: {
      ring: "ring-rose-400/60",
      text: "text-rose-600",
      border: "border-rose-500",
      bg: "bg-rose-50",
      hoverBg: "hover:bg-rose-100/80",
      iconColor: "text-rose-500",
      focusBg: "bg-white",
      historyBg: "bg-rose-50/80"
    },
    orange: {
      ring: "ring-orange-400/60",
      text: "text-orange-600",
      border: "border-orange-500",
      bg: "bg-orange-50",
      hoverBg: "hover:bg-orange-100/80",
      iconColor: "text-orange-500",
      focusBg: "bg-white",
      historyBg: "bg-orange-50/80"
    },
    red: {
      ring: "ring-red-400/60",
      text: "text-red-600",
      border: "border-red-500",
      bg: "bg-red-50",
      hoverBg: "hover:bg-red-100/80",
      iconColor: "text-red-500",
      focusBg: "bg-white",
      historyBg: "bg-red-50/80"
    },
    gray: {
      ring: "ring-gray-400/60",
      text: "text-gray-600",
      border: "border-gray-500",
      bg: "bg-gray-50",
      hoverBg: "hover:bg-gray-100/80",
      iconColor: "text-gray-500",
      focusBg: "bg-white",
      historyBg: "bg-gray-50/80"
    }
  };
  
  const colors = colorConfig[accentColor];
  
  // Configuration des tailles
  const sizeConfig = {
    sm: {
      padding: "py-1.5",
      text: "text-xs",
      iconSize: "text-xs",
      height: "h-8",
      iconLeft: "left-2",
      inputPadding: "pl-7 pr-7"
    },
    md: {
      padding: "py-2",
      text: "text-sm",
      iconSize: "text-sm",
      height: "h-10",
      iconLeft: "left-3",
      inputPadding: "pl-9 pr-9"
    },
    lg: {
      padding: "py-2.5",
      text: "text-base",
      iconSize: "text-base",
      height: "h-12",
      iconLeft: "left-3.5",
      inputPadding: "pl-10 pr-10"
    }
  };
  
  const sizeClasses = sizeConfig[size];
  
  // Configuration des arrondis
  const roundedConfig = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };
  
  const roundedClass = roundedConfig[rounded];
  
  // Configuration des variantes de style
  const variantConfig = {
    default: {
      container: `bg-white border border-gray-200 ${roundedClass} shadow-sm`,
      focus: `ring-2 ${colors.ring} border-transparent`,
      hover: "hover:border-gray-300"
    },
    outlined: {
      container: `bg-white/70 backdrop-blur-sm border border-gray-200 ${roundedClass}`,
      focus: `ring-2 ${colors.ring} border-transparent`,
      hover: "hover:border-gray-300"
    },
    filled: {
      container: `bg-gray-50/90 backdrop-blur-sm border border-transparent ${roundedClass}`,
      focus: `ring-2 ${colors.ring} bg-white`,
      hover: "hover:bg-gray-100/70"
    },
    minimal: {
      container: `bg-transparent border-b border-gray-200 ${roundedClass}`,
      focus: `border-b-2 ${colors.border}`,
      hover: "hover:border-gray-300"
    },
    glassmorphic: {
      container: `bg-white/30 backdrop-blur-md border border-white/50 ${roundedClass} shadow-sm`,
      focus: `ring-2 ${colors.ring} border-transparent`,
      hover: "hover:bg-white/40"
    }
  };
  
  const variantClasses = variantConfig[variant];
  
  // Animations selon la variante choisie
  const animationVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
    },
    slide: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
    }
  };
  
  // Gestion de l'autofocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Gestion du clic en dehors pour fermer l'historique
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion de la touche Entrée pour déclencher la recherche
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Gestion du clic sur un élément d'historique
  const handleHistoryItemClick = (item: string) => {
    if (onHistoryItemSelect) {
      onHistoryItemSelect(item);
    } else {
      onChange(item);
    }
    setIsHistoryOpen(false);
  };

  // Gestion du nettoyage du champ
  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Conteneur de l'input avec animation de transition */}
      <motion.div 
        className={`flex items-center ${variantClasses.container} ${sizeClasses.height} ${
          isFocused ? variantClasses.focus : variantClasses.hover
        } transition-all duration-200 overflow-hidden`}
        initial={{ opacity: 0.9, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Icône de recherche animée */}
        <motion.div 
          className={`absolute ${sizeClasses.iconLeft} ${
            isFocused ? colors.iconColor : 'text-gray-400'
          } transition-colors duration-300`}
          animate={{ 
            scale: isFocused ? 1.1 : 1,
            x: isFocused ? 2 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <FaSearch className={sizeClasses.iconSize} />
        </motion.div>
        
        {/* Champ de saisie */}
        <input
          ref={inputRef}
          type="text"
          className={`w-full ${sizeClasses.padding} ${sizeClasses.text} ${sizeClasses.inputPadding} 
                    outline-none bg-transparent placeholder-gray-400 text-gray-700
                    transition-all duration-300`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (withHistory && historyItems.length > 0) {
              setIsHistoryOpen(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label={placeholder}
        />
        
        {/* Conteneur des boutons d'action */}
        <div className="flex items-center absolute right-2">
          {/* Bouton d'historique */}
          {withHistory && historyItems.length > 0 && (
            <motion.button 
              className={`p-1.5 rounded-full ${isFocused ? colors.iconColor : 'text-gray-400'} 
                         hover:${colors.iconColor} transition-colors`}
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              type="button"
              aria-label="Afficher l'historique"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHistory className={sizeClasses.iconSize} />
            </motion.button>
          )}
          
          {/* Bouton pour effacer - avec animation */}
          <AnimatePresence>
            {value && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={handleClear}
                className={`p-1.5 rounded-full text-gray-400 hover:${colors.text} 
                           transition-colors focus:outline-none`}
                aria-label="Effacer la recherche"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes className={sizeClasses.iconSize} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Dropdown de l'historique avec animation */}
      <AnimatePresence>
        {withHistory && isHistoryOpen && historyItems.length > 0 && (
          <motion.div
            variants={animationVariants[animationVariant]}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute left-0 right-0 mt-1 bg-white border border-gray-200 ${roundedClass} 
                       shadow-lg z-10 max-h-60 overflow-y-auto backdrop-blur-sm`}
          >
            <ul className="py-1">
              {historyItems.map((item, index) => (
                <li key={index}>
                  <motion.button
                    type="button"
                    onClick={() => handleHistoryItemClick(item)}
                    className={`w-full text-left ${sizeClasses.padding} ${sizeClasses.text} 
                              flex items-center gap-2 ${colors.hoverBg} px-4 transition-colors`}
                    whileHover={{ x: 5, backgroundColor: colors.historyBg }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <FaHistory className="text-gray-400" />
                    <span className="truncate">{item}</span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
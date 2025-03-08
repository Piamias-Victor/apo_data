import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaHistory } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange" | "gray";
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
  withHistory?: boolean;
  historyItems?: string[];
  onHistoryItemSelect?: (item: string) => void;
  onSearch?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  variant?: "default" | "outlined" | "filled" | "minimal";
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
      ring: "ring-teal-400",
      text: "text-teal-600",
      border: "border-teal-500",
      bg: "bg-teal-50",
      hoverBg: "hover:bg-teal-100"
    },
    blue: {
      ring: "ring-blue-400",
      text: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100"
    },
    purple: {
      ring: "ring-purple-400",
      text: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-50",
      hoverBg: "hover:bg-purple-100"
    },
    indigo: {
      ring: "ring-indigo-400",
      text: "text-indigo-600",
      border: "border-indigo-500",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100"
    },
    rose: {
      ring: "ring-rose-400",
      text: "text-rose-600",
      border: "border-rose-500",
      bg: "bg-rose-50",
      hoverBg: "hover:bg-rose-100"
    },
    orange: {
      ring: "ring-orange-400",
      text: "text-orange-600",
      border: "border-orange-500",
      bg: "bg-orange-50",
      hoverBg: "hover:bg-orange-100"
    },
    gray: {
      ring: "ring-gray-400",
      text: "text-gray-600",
      border: "border-gray-500",
      bg: "bg-gray-50",
      hoverBg: "hover:bg-gray-100"
    }
  };
  
  const colors = colorConfig[accentColor];
  
  // Configuration des tailles
  const sizeConfig = {
    sm: {
      padding: "px-2 py-1.5",
      text: "text-xs",
      iconSize: "text-xs",
      height: "h-8"
    },
    md: {
      padding: "px-3 py-2",
      text: "text-sm",
      iconSize: "text-sm",
      height: "h-10"
    },
    lg: {
      padding: "px-4 py-2.5",
      text: "text-base",
      iconSize: "text-base",
      height: "h-12"
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
      container: `bg-white border border-gray-300 ${roundedClass} shadow-sm`,
      focus: `${colors.ring} ${colors.border}`
    },
    outlined: {
      container: `bg-transparent border border-gray-300 ${roundedClass}`,
      focus: `${colors.ring} ${colors.border}`
    },
    filled: {
      container: `bg-gray-100 border border-transparent ${roundedClass}`,
      focus: colors.ring
    },
    minimal: {
      container: `bg-transparent border-b border-gray-300`,
      focus: `border-b-2 ${colors.border}`
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
      {/* Conteneur de l'input */}
      <div 
        className={`flex items-center ${variantClasses.container} ${sizeClasses.height} ${
          isFocused ? `ring-2 ${variantClasses.focus}` : ''
        } transition-all duration-200`}
      >
        {/* Icône de recherche */}
        <div className={`pl-3 ${isFocused ? colors.text : 'text-gray-400'} transition-colors`}>
          <FaSearch className={sizeClasses.iconSize} />
        </div>
        
        {/* Champ de saisie */}
        <input
          ref={inputRef}
          type="text"
          className={`w-full ${sizeClasses.padding} ${sizeClasses.text} outline-none bg-transparent placeholder-gray-400 text-gray-700`}
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
        <div className="flex items-center">
          {/* Bouton d'historique */}
          {withHistory && historyItems.length > 0 && (
            <button 
              className={`p-2 ${isFocused ? colors.text : 'text-gray-400'} hover:${colors.text} transition-colors`}
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              type="button"
              aria-label="Afficher l'historique"
            >
              <FaHistory className={sizeClasses.iconSize} />
            </button>
          )}
          
          {/* Bouton pour effacer */}
          {value && (
            <button 
              onClick={handleClear}
              className={`p-2 text-gray-400 hover:${colors.text} transition-colors focus:outline-none`}
              aria-label="Effacer la recherche"
              type="button"
            >
              <FaTimes className={sizeClasses.iconSize} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown de l'historique avec animation */}
      <AnimatePresence>
        {withHistory && isHistoryOpen && historyItems.length > 0 && (
          <motion.div
            variants={animationVariants[animationVariant]}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute left-0 right-0 mt-1 bg-white border border-gray-200 ${roundedClass} shadow-lg z-10 max-h-60 overflow-y-auto`}
          >
            <ul>
              {historyItems.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleHistoryItemClick(item)}
                    className={`w-full text-left ${sizeClasses.padding} ${sizeClasses.text} flex items-center gap-2 hover:${colors.bg} transition-colors`}
                  >
                    <FaHistory className="text-gray-400" />
                    <span className="truncate">{item}</span>
                  </button>
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
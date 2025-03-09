import React, { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  buttonColorClass?: string;
  shadowDepth?: "none" | "sm" | "md" | "lg";
  transparentBackground?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  titleSize?: "sm" | "md" | "lg" | "xl";
  borderColor?: string;
  onToggle?: (isCollapsed: boolean) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultCollapsed = true,
  buttonColorClass = "bg-teal-500 hover:bg-teal-600",
  shadowDepth = "lg",
  transparentBackground = true,
  rounded = "xl",
  titleSize = "lg",
  borderColor = "border-gray-200/70",
  onToggle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Mapper les tailles d'arrondi en classes Tailwind
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl"
  };

  // Mapper les profondeurs d'ombre en classes Tailwind
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg"
  };

  // Mapper les tailles de titre en classes Tailwind
  const titleClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  // Définir les classes de fond
  const backgroundClass = transparentBackground 
    ? "bg-white/90 backdrop-blur-md" 
    : "bg-white";

  // Gestion du toggle
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Variantes d'animation pour le contenu
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] // Courbe d'accélération type Apple
      }
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div 
      className={`${backgroundClass} ${roundedClasses[rounded]} ${shadowClasses[shadowDepth]} p-6 border ${borderColor} relative overflow-hidden`}
    >
      {/* Bouton de toggle avec animation */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleToggle}
        className={`absolute top-4 right-4 ${buttonColorClass} text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition-all duration-300 flex items-center gap-2 z-10`}
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} 
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Titre */}
      <div className="flex items-start pr-32 mb-4">
        <h2 className={`${titleClasses[titleSize]} font-semibold text-gray-900 flex items-center gap-2 transition-colors duration-200`}>
          {icon} <span>{title}</span>
        </h2>
      </div>

      {/* Ligne de séparation */}
      <motion.div 
        className="border-b border-gray-200/70 w-full mb-6"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Contenu animé */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;
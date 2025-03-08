import React, { useState, ReactNode } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

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
  borderColor = "border-gray-200",
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
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div 
      className={`${backgroundClass} ${roundedClasses[rounded]} ${shadowClasses[shadowDepth]} p-6 border ${borderColor} relative overflow-hidden`}
    >
      {/* Bouton de toggle avec animation */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`absolute top-4 right-4 ${buttonColorClass} text-white px-4 py-2 ${roundedClasses.lg} text-sm font-medium shadow-md transition flex items-center gap-2 z-10`}
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} 
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown />
        </motion.div>
      </motion.button>

      {/* Titre */}
      <div className="flex items-start pr-32 mb-4">
        <h2 className={`${titleClasses[titleSize]} font-bold text-gray-900 flex items-center gap-2 transition-colors duration-200`}>
          {icon} <span>{title}</span>
        </h2>
      </div>

      {/* Ligne de séparation */}
      <motion.div 
        className="border-b border-gray-200 w-full mb-4"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5 }}
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
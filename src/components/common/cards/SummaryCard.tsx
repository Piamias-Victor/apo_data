import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SummaryCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray";
  variant?: "default" | "glass" | "bordered" | "elevated" | "gradient";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fullWidth?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  animationDelay?: number;
  noPadding?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  badge?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  children,
  accentColor = "teal",
  variant = "default",
  collapsible = false,
  defaultCollapsed = false,
  fullWidth = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  animationDelay = 0,
  noPadding = false,
  onToggle,
  badge
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Configuration des couleurs d'accent
  const colorConfig = {
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
      ring: "ring-teal-400",
      gradient: "from-teal-500 to-teal-400",
      shadow: "shadow-teal-100",
      badge: "bg-teal-500"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      ring: "ring-blue-400",
      gradient: "from-blue-500 to-blue-400",
      shadow: "shadow-blue-100",
      badge: "bg-blue-500"
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
      ring: "ring-indigo-400",
      gradient: "from-indigo-500 to-indigo-400",
      shadow: "shadow-indigo-100",
      badge: "bg-indigo-500"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
      ring: "ring-purple-400",
      gradient: "from-purple-500 to-purple-400",
      shadow: "shadow-purple-100",
      badge: "bg-purple-500"
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      ring: "ring-rose-400",
      gradient: "from-rose-500 to-rose-400",
      shadow: "shadow-rose-100",
      badge: "bg-rose-500"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
      ring: "ring-orange-400",
      gradient: "from-orange-500 to-orange-400",
      shadow: "shadow-orange-100",
      badge: "bg-orange-500"
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      ring: "ring-gray-400",
      gradient: "from-gray-500 to-gray-400",
      shadow: "shadow-gray-100",
      badge: "bg-gray-500"
    }
  };

  // Configuration des variantes de style
  const variantConfig = {
    default: {
      container: "bg-white border border-gray-100 shadow-sm",
      header: "border-b border-gray-100"
    },
    glass: {
      container: "bg-white/80 backdrop-blur-md border border-white/50 shadow-sm",
      header: "border-b border-white/40"
    },
    bordered: {
      container: `bg-white border-2 ${colorConfig[accentColor].border}`,
      header: `border-b ${colorConfig[accentColor].border}`
    },
    elevated: {
      container: `bg-white border border-gray-100 shadow-lg ${colorConfig[accentColor].shadow}`,
      header: "border-b border-gray-100"
    },
    gradient: {
      container: `bg-gradient-to-br ${colorConfig[accentColor].gradient} border-none text-white shadow-md`,
      header: "border-b border-white/20"
    }
  };

  // Sélectionner les classes
  const colors = colorConfig[accentColor];
  const variantClasses = variantConfig[variant];
  
  // Handlers
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut", 
        delay: animationDelay,
        when: "beforeChildren"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { 
      opacity: 1, 
      height: "auto", 
      transition: { 
        duration: 0.4, 
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { 
        duration: 0.3, 
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`
        ${variantClasses.container}
        ${fullWidth ? "w-full" : ""}
        rounded-xl
        ${noPadding ? "" : "p-5"}
        ${className}
        transition-all duration-300 hover:shadow-md relative overflow-hidden
      `}
    >
      {/* Badge (if provided) */}
      {badge && (
        <div className={`absolute top-0 right-0 ${colors.badge} text-xs font-bold text-white px-3 py-1 rounded-bl-lg`}>
          {badge}
        </div>
      )}
      
      {/* Header */}
      <div className={`
        ${variantClasses.header}
        ${noPadding ? "px-5 pt-5" : ""}
        ${headerClassName}
        ${collapsible ? "cursor-pointer" : ""}
        ${isCollapsed ? "pb-3" : "pb-3 mb-3"}
        flex items-center justify-between
      `} onClick={collapsible ? handleToggle : undefined}>
        <div className="flex items-center gap-2">
          {icon && (
            <div className={variant === "gradient" ? "text-white" : colors.text}>
              {icon}
            </div>
          )}
          <h3 className={`font-semibold ${variant === "gradient" ? "text-white" : "text-gray-800"}`}>
            {title}
          </h3>
        </div>
        
        {collapsible && (
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className={variant === "gradient" ? "text-white" : colors.text}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </div>
      
      {/* Content area */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${noPadding ? "px-5 pb-5" : ""} ${bodyClassName}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SummaryCard;
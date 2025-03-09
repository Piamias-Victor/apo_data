import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SummaryCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray" | "amber" | "emerald";
  size?: "sm" | "md" | "lg";
  animationDelay?: number;
  variant?: "default" | "outlined" | "glassmorphic" | "minimal" | "gradient";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fullWidth?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  noPadding?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  badge?: string;
  iconColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  children,
  accentColor = "teal",
  size = "md",
  animationDelay = 0,
  variant = "default",
  collapsible = false,
  defaultCollapsed = false,
  fullWidth = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  noPadding = false,
  onToggle,
  badge,
  iconColor
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Configuration des couleurs d'accent
  const colorConfig = {
    teal: {
      light: "bg-teal-50 text-teal-600 border-teal-200",
      medium: "bg-teal-100 text-teal-700 border-teal-300",
      dark: "bg-teal-600 text-white border-teal-700",
      gradient: "from-teal-500 to-teal-400",
      increase: "bg-teal-50 text-teal-600",
      badge: "bg-teal-100 text-teal-700",
      bar: "bg-teal-500/20",
      text: "text-teal-600"
    },
    blue: {
      light: "bg-blue-50 text-blue-600 border-blue-200",
      medium: "bg-blue-100 text-blue-700 border-blue-300",
      dark: "bg-blue-600 text-white border-blue-700",
      gradient: "from-blue-500 to-blue-400",
      increase: "bg-blue-50 text-blue-600",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-blue-500/20",
      text: "text-blue-600"
    },
    indigo: {
      light: "bg-indigo-50 text-indigo-600 border-indigo-200",
      medium: "bg-indigo-100 text-indigo-700 border-indigo-300",
      dark: "bg-indigo-600 text-white border-indigo-700",
      gradient: "from-indigo-500 to-indigo-400",
      increase: "bg-indigo-50 text-indigo-600",
      badge: "bg-indigo-100 text-indigo-700",
      bar: "bg-indigo-500/20",
      text: "text-indigo-600"
    },
    purple: {
      light: "bg-purple-50 text-purple-600 border-purple-200",
      medium: "bg-purple-100 text-purple-700 border-purple-300",
      dark: "bg-purple-600 text-white border-purple-700",
      gradient: "from-purple-500 to-purple-400",
      increase: "bg-purple-50 text-purple-600",
      badge: "bg-purple-100 text-purple-700",
      bar: "bg-purple-500/20",
      text: "text-purple-600"
    },
    rose: {
      light: "bg-rose-50 text-rose-600 border-rose-200",
      medium: "bg-rose-100 text-rose-700 border-rose-300",
      dark: "bg-rose-600 text-white border-rose-700",
      gradient: "from-rose-500 to-rose-400",
      increase: "bg-rose-50 text-rose-600",
      badge: "bg-rose-100 text-rose-700",
      bar: "bg-rose-500/20",
      text: "text-rose-600"
    },
    orange: {
      light: "bg-orange-50 text-orange-600 border-orange-200",
      medium: "bg-orange-100 text-orange-700 border-orange-300",
      dark: "bg-orange-600 text-white border-orange-700",
      gradient: "from-orange-500 to-orange-400",
      increase: "bg-orange-50 text-orange-600",
      badge: "bg-orange-100 text-orange-700",
      bar: "bg-orange-500/20",
      text: "text-orange-600"
    },
    amber: {
      light: "bg-amber-50 text-amber-600 border-amber-200",
      medium: "bg-amber-100 text-amber-700 border-amber-300",
      dark: "bg-amber-600 text-white border-amber-700",
      gradient: "from-amber-500 to-amber-400",
      increase: "bg-amber-50 text-amber-600",
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-amber-500/20",
      text: "text-amber-600"
    },
    emerald: {
      light: "bg-emerald-50 text-emerald-600 border-emerald-200",
      medium: "bg-emerald-100 text-emerald-700 border-emerald-300",
      dark: "bg-emerald-600 text-white border-emerald-700",
      gradient: "from-emerald-500 to-emerald-400",
      increase: "bg-emerald-50 text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      bar: "bg-emerald-500/20",
      text: "text-emerald-600"
    },
    gray: {
      light: "bg-gray-50 text-gray-600 border-gray-200",
      medium: "bg-gray-100 text-gray-700 border-gray-300",
      dark: "bg-gray-600 text-white border-gray-700",
      gradient: "from-gray-500 to-gray-400",
      increase: "bg-gray-50 text-gray-600",
      badge: "bg-gray-100 text-gray-700",
      bar: "bg-gray-500/20",
      text: "text-gray-600"
    },
    red: {
      light: "bg-red-50 text-red-600 border-red-200",
      medium: "bg-red-100 text-red-700 border-red-300",
      dark: "bg-red-600 text-white border-red-700",
      gradient: "from-red-500 to-red-400",
      increase: "bg-red-50 text-red-600",
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500/20",
      text: "text-red-600"
    }
  };
  
  // Configuration des tailles
  const sizeConfig = {
    sm: {
      container: "p-3 gap-1.5",
      title: "text-xs",
      value: "text-xl",
      change: "text-xs py-0.5 px-1.5",
      comparisonValue: "text-xs",
      barHeight: "h-1"
    },
    md: {
      container: "p-4 gap-2",
      title: "text-sm",
      value: "text-2xl",
      change: "text-xs py-1 px-2",
      comparisonValue: "text-xs",
      barHeight: "h-1.5"
    },
    lg: {
      container: "p-5 gap-3",
      title: "text-base",
      value: "text-3xl",
      change: "text-sm py-1 px-2.5",
      comparisonValue: "text-sm",
      barHeight: "h-2"
    }
  };

  // Configuration des variantes
  const variantConfig = {
    default: {
      container: "bg-white border border-gray-100 shadow-sm",
      valueColor: "text-gray-900",
      header: "border-b border-gray-100"
    },
    outlined: {
      container: `bg-white border-2 ${colorConfig[accentColor].light.replace("bg-", "border-")}`,
      valueColor: "text-gray-900",
      header: `border-b ${colorConfig[accentColor].light.replace("bg-", "border-")}`
    },
    glassmorphic: {
      container: "bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm",
      valueColor: "text-gray-900",
      header: "border-b border-white/40"
    },
    minimal: {
      container: "bg-transparent border-b border-gray-200",
      valueColor: "text-gray-900",
      header: "border-b border-gray-200"
    },
    gradient: {
      container: `bg-gradient-to-br ${colorConfig[accentColor].gradient} border-none shadow-md`,
      valueColor: "text-white",
      header: "border-b border-white/20"
    }
  };

  const sizes = sizeConfig[size] || sizeConfig.md;
  const colors = colorConfig[accentColor] || colorConfig.teal;
  // Fix: Adding fallback to avoid undefined error
  const variantClasses = variantConfig[variant] || variantConfig.default;

  // Handlers
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };
  
  // Fonction pour formater les valeurs longues de manière plus compacte
  const formatCompactValue = (value: number): string => {
    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value/1000).toFixed(1)}K`;
    return value.toFixed(2);
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
            <div className={variant === "gradient" ? "text-white" : iconColor || colors.text}>
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
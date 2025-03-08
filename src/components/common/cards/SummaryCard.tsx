import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  iconColor?: string;
  variant?: "default" | "gradient" | "outlined" | "flat" | "glass";
  colorScheme?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange" | "gray";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  withShadow?: boolean;
  withBadge?: boolean;
  badgeText?: string;
  withHoverEffect?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
  expandable?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  children,
  iconColor,
  variant = "default",
  colorScheme = "teal",
  rounded = "xl",
  withShadow = true,
  withBadge = false,
  badgeText,
  withHoverEffect = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  onClick,
  expandable = false
}) => {
  // Configuration des couleurs selon le schéma choisi
  const colorConfig = {
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
      gradient: "from-teal-500 to-blue-500",
      badge: "bg-teal-100 text-teal-800"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      gradient: "from-blue-500 to-indigo-500",
      badge: "bg-blue-100 text-blue-800"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
      gradient: "from-purple-500 to-pink-500",
      badge: "bg-purple-100 text-purple-800"
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
      gradient: "from-indigo-500 to-purple-500",
      badge: "bg-indigo-100 text-indigo-800"
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      gradient: "from-rose-500 to-pink-500",
      badge: "bg-rose-100 text-rose-800"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
      gradient: "from-orange-500 to-amber-500",
      badge: "bg-orange-100 text-orange-800"
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      gradient: "from-gray-500 to-slate-600",
      badge: "bg-gray-100 text-gray-800"
    }
  };

  const colors = colorConfig[colorScheme];
  
  // Configuration des arrondis
  const roundedConfig = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl"
  };
  
  const roundedClass = roundedConfig[rounded];
  
  // Configuration des variantes de style
  const variantConfig = {
    default: {
      container: `bg-white border ${colors.border}`,
      header: `border-b ${colors.border} pb-2`
    },
    gradient: {
      container: `bg-gradient-to-br ${colors.gradient} text-white border-none`,
      header: "border-b border-white/20 pb-2"
    },
    outlined: {
      container: `bg-transparent border-2 ${colors.border}`,
      header: `border-b ${colors.border} pb-2`
    },
    flat: {
      container: `${colors.bg} border ${colors.border}`,
      header: `border-b ${colors.border} pb-2`
    },
    glass: {
      container: "bg-white/70 backdrop-blur-md border border-white/50",
      header: "border-b border-white/50 pb-2"
    }
  };
  
  const variantClasses = variantConfig[variant];
  
  // Configuration de l'ombre
  const shadowClass = withShadow ? "shadow-md" : "";
  
  // Configuration de l'effet au survol
  const hoverEffectClass = withHoverEffect 
    ? "transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px]" 
    : "";
  
  // Déterminer la couleur de l'icône
  const actualIconColor = iconColor || 
    (variant === "gradient" ? "text-white" : colors.text);
  
  // Animations
  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={cardVariants}
      className={`
        ${variantClasses.container}
        ${roundedClass}
        ${shadowClass}
        ${hoverEffectClass}
        ${className}
        ${onClick || expandable ? "cursor-pointer" : ""}
        p-6 relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Badge optionnel */}
      {withBadge && badgeText && (
        <div className={`absolute top-0 right-0 ${colors.badge} text-xs font-medium px-2 py-1 ${roundedConfig.md}`}>
          {badgeText}
        </div>
      )}
      
      {/* En-tête */}
      <h3 className={`
        ${variantClasses.header} 
        ${variant === 'gradient' ? 'text-white' : colors.text} 
        text-md font-semibold mb-4 flex items-center 
        ${headerClassName}
      `}>
        {icon && <span className={`${actualIconColor} mr-2`}>{icon}</span>}
        {title}
        {expandable && (
          <span className="ml-auto text-xs">
            {variant === "gradient" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        )}
      </h3>
      
      {/* Corps */}
      <div className={bodyClassName}>
        {children}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
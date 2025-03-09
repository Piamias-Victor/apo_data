// src/components/ui/buttons/FilterButton.tsx
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface FilterButtonProps {
  icon: ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
  color?: "teal" | "blue" | "violet" | "rose" | "amber" | "emerald";
  size?: "sm" | "md" | "lg";
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  icon, 
  label, 
  count = 0, 
  onClick,
  active = false,
  color = "teal",
  size = "md"
}) => {
  // Configuration des couleurs
  const colorConfig = {
    teal: {
      active: "bg-teal-50 text-teal-700 border-teal-200",
      badge: "bg-teal-500 text-white",
      hover: "hover:border-teal-300 hover:bg-teal-50/50",
      iconActive: "text-teal-500",
      iconInactive: "text-gray-400 group-hover:text-teal-500"
    },
    blue: {
      active: "bg-blue-50 text-blue-700 border-blue-200",
      badge: "bg-blue-500 text-white",
      hover: "hover:border-blue-300 hover:bg-blue-50/50",
      iconActive: "text-blue-500",
      iconInactive: "text-gray-400 group-hover:text-blue-500"
    },
    violet: {
      active: "bg-violet-50 text-violet-700 border-violet-200",
      badge: "bg-violet-500 text-white",
      hover: "hover:border-violet-300 hover:bg-violet-50/50",
      iconActive: "text-violet-500",
      iconInactive: "text-gray-400 group-hover:text-violet-500"
    },
    rose: {
      active: "bg-rose-50 text-rose-700 border-rose-200",
      badge: "bg-rose-500 text-white",
      hover: "hover:border-rose-300 hover:bg-rose-50/50",
      iconActive: "text-rose-500",
      iconInactive: "text-gray-400 group-hover:text-rose-500"
    },
    amber: {
      active: "bg-amber-50 text-amber-700 border-amber-200",
      badge: "bg-amber-500 text-white",
      hover: "hover:border-amber-300 hover:bg-amber-50/50",
      iconActive: "text-amber-500",
      iconInactive: "text-gray-400 group-hover:text-amber-500"
    },
    emerald: {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "bg-emerald-500 text-white",
      hover: "hover:border-emerald-300 hover:bg-emerald-50/50",
      iconActive: "text-emerald-500",
      iconInactive: "text-gray-400 group-hover:text-emerald-500"
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      padding: "px-3 py-1.5",
      text: "text-xs",
      badge: "w-5 h-5 text-xs",
      gap: "gap-1.5"
    },
    md: {
      padding: "px-4 py-2",
      text: "text-sm",
      badge: "w-6 h-6 text-xs",
      gap: "gap-2"
    },
    lg: {
      padding: "px-5 py-2.5",
      text: "text-base",
      badge: "w-7 h-7 text-sm",
      gap: "gap-2.5"
    }
  };

  const colors = colorConfig[color];
  const sizes = sizeConfig[size];

  // Animation du badge lorsque le compteur change
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  };

  return (
    <motion.button
      onClick={onClick}
      className={`group flex items-center ${sizes.gap} ${sizes.padding} rounded-xl 
                 border backdrop-blur-sm font-medium transition-all duration-300 
                 ${active || count > 0 
                  ? colors.active
                  : `bg-white/90 border-gray-200 text-gray-700 ${colors.hover}`}
                 shadow-sm hover:shadow md transform hover:-translate-y-0.5`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Icône */}
      <span className={`transition-colors duration-300 ${
        active || count > 0 ? colors.iconActive : colors.iconInactive
      }`}>
        {icon}
      </span>
      
      {/* Libellé dynamique selon le comptage */}
      <span className={`whitespace-nowrap ${sizes.text}`}>
        {count > 0 ? `${count} sélectionné(s)` : label}
      </span>
      
      {/* Badge de comptage */}
      {count > 0 && (
        <motion.div
          className={`${colors.badge} ${sizes.badge} flex items-center justify-center 
                     font-bold rounded-full shadow-sm ml-0.5`}
          variants={badgeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={count}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
    </motion.button>
  );
};

export default FilterButton;
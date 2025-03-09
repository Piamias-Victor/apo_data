import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "dark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
  type?: "button" | "submit" | "reset";
  withShadow?: boolean;
  withRing?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon = true,
  rounded = "md",
  className = "",
  type = "button",
  withShadow = true,
  withRing = true
}) => {
  // Configuration des variantes de style avec dégradés améliorés
  const variantClasses = {
    primary: {
      bg: "bg-gradient-to-r from-blue-500 via-blue-550 to-teal-500",
      hover: "hover:from-blue-600 hover:via-blue-650 hover:to-teal-600",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-blue-300/50",
      shadow: "shadow-blue-500/20"
    },
    secondary: {
      bg: "bg-gradient-to-r from-gray-100 to-gray-50",
      hover: "hover:from-gray-200 hover:to-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      ring: "focus:ring-gray-200/50",
      shadow: "shadow-gray-200/30"
    },
    danger: {
      bg: "bg-gradient-to-r from-red-500 via-red-550 to-rose-500",
      hover: "hover:from-red-600 hover:via-red-650 hover:to-rose-600",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-red-300/50",
      shadow: "shadow-red-500/20"
    },
    success: {
      bg: "bg-gradient-to-r from-emerald-500 via-emerald-550 to-green-500",
      hover: "hover:from-emerald-600 hover:via-emerald-650 hover:to-green-600",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-green-300/50",
      shadow: "shadow-green-500/20"
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 via-amber-550 to-orange-500",
      hover: "hover:from-amber-600 hover:via-amber-650 hover:to-orange-600",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-amber-300/50",
      shadow: "shadow-amber-500/20"
    },
    info: {
      bg: "bg-gradient-to-r from-sky-500 via-sky-550 to-indigo-500",
      hover: "hover:from-sky-600 hover:via-sky-650 hover:to-indigo-600",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-sky-300/50",
      shadow: "shadow-sky-500/20"
    },
    dark: {
      bg: "bg-gradient-to-r from-gray-800 to-gray-900",
      hover: "hover:from-gray-900 hover:to-black",
      text: "text-white",
      border: "border-transparent",
      ring: "focus:ring-gray-500/50",
      shadow: "shadow-gray-800/30"
    }
  };

  // Configuration améliorée des tailles avec padding équilibré
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-lg"
  };

  // Configuration des arrondis
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  // Construire les classes CSS pour le bouton
  const buttonClasses = `
    ${variantClasses[variant].bg}
    ${variantClasses[variant].hover}
    ${variantClasses[variant].text}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${fullWidth ? "w-full" : ""}
    ${withShadow ? `shadow-md hover:shadow-lg ${variantClasses[variant].shadow}` : ""}
    ${withRing ? `focus:outline-none focus:ring-2 ${variantClasses[variant].ring}` : ""}
    ${disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""}
    transition-all duration-300 ease-out
    font-medium
    border ${variantClasses[variant].border}
    flex items-center justify-center gap-2.5
    transform hover:-translate-y-0.5 active:translate-y-0
    backdrop-blur-sm
    ${className}
  `;

  // Animation du bouton améliorée
  const buttonVariants = {
    hover: { 
      scale: disabled ? 1 : 1.02,
      boxShadow: withShadow ? "0 8px 20px rgba(0, 0, 0, 0.1)" : "none",
    },
    tap: { 
      scale: disabled ? 1 : 0.98,
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    initial: {
      boxShadow: withShadow ? "0 4px 10px rgba(0, 0, 0, 0.08)" : "none",
    }
  };

  // Contenu du bouton avec spinner pour l'état de chargement
  const buttonContent = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && icon && !loading && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      <span className="tracking-wide">{children}</span>
      {!leftIcon && icon && !loading && <span className="transition-transform group-hover:scale-110">{icon}</span>}
    </>
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`group ${buttonClasses}`}
      disabled={disabled || loading}
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      variants={buttonVariants}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default ActionButton;
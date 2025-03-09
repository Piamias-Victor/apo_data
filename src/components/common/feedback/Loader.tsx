import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
  size?: "small" | "medium" | "large";
  type?: "spinner" | "dots" | "pulse" | "skeleton";
  className?: string;
  color?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange" | "gray";
}

const Loader: React.FC<LoaderProps> = ({ 
  message = "Chargement en cours...",
  size = "medium",
  type = "spinner",
  className = "",
  color = "teal"
}) => {
  // Configuration des tailles
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16"
  };
  
  // Configuration des couleurs
  const colorClasses = {
    teal: "text-teal-500 border-teal-500/30 fill-teal-500",
    blue: "text-blue-500 border-blue-500/30 fill-blue-500",
    purple: "text-purple-500 border-purple-500/30 fill-purple-500",
    indigo: "text-indigo-500 border-indigo-500/30 fill-indigo-500",
    rose: "text-rose-500 border-rose-500/30 fill-rose-500",
    orange: "text-orange-500 border-orange-500/30 fill-orange-500",
    gray: "text-gray-500 border-gray-500/30 fill-gray-500"
  };

  // Variables pour l'animation des points
  const dotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const dotVariant = {
    initial: { y: 0 },
    animate: { 
      y: [0, -10, 0],
      transition: {
        repeat: Infinity,
        duration: 0.8
      }
    }
  };

  // Variantes pour l'animation pulsante
  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { 
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  // Fonction pour afficher le type de loader approprié
  const renderLoader = () => {
    switch(type) {
      case "dots":
        return (
          <motion.div 
            className="flex space-x-2 items-center justify-center"
            variants={dotsVariants}
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`rounded-full ${colorClasses[color]} ${
                  size === "small" ? "w-2 h-2" : 
                  size === "medium" ? "w-3 h-3" : 
                  "w-4 h-4"
                }`}
                variants={dotVariant}
              />
            ))}
          </motion.div>
        );
        
      case "pulse":
        return (
          <motion.div
            className={`rounded-full ${colorClasses[color]} ${sizeClasses[size]}`}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        );
        
      case "skeleton":
        return (
          <div className="w-full">
            <div className={`h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4`}></div>
            <div className={`h-4 bg-gray-200 rounded animate-pulse mb-2`}></div>
            <div className={`h-4 bg-gray-200 rounded animate-pulse w-5/6`}></div>
          </div>
        );
        
      case "spinner":
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className={`rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col justify-center items-center py-6 space-y-4 ${className}`}>
      {renderLoader()}
      
      {message && type !== "skeleton" && (
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className={`text-sm font-medium ${colorClasses[color]}`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
import React from "react";
import { motion } from "framer-motion";

interface SeparatorProps {
  from: string;
  via?: string;
  to: string;
  withDot?: boolean;
  height?: "thin" | "normal" | "thick";
  width?: "narrow" | "normal" | "wide" | "full";
  className?: string;
  animate?: boolean;
}

const Separator: React.FC<SeparatorProps> = ({
  from,
  via,
  to,
  withDot = false,
  height = "normal",
  width = "normal",
  className = "",
  animate = true
}) => {
  // Configuration des hauteurs
  const heightClasses = {
    thin: "h-0.5",
    normal: "h-1",
    thick: "h-1.5"
  };

  // Configuration des largeurs
  const widthClasses = {
    narrow: "w-1/3",
    normal: "w-3/4",
    wide: "w-5/6",
    full: "w-full"
  };

  // Génération de la classe de gradient
  const gradientClass = via
    ? `from-${from} via-${via} to-${to}`
    : `from-${from} to-${to}`;

  // Animation avec courbe d'accélération Apple-like
  const lineVariants = {
    hidden: { 
      width: 0,
      opacity: 0
    },
    visible: { 
      width: "100%",
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const dotVariants = {
    hidden: {
      scale: 0,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center my-12 ${className}`}>
      {/* Ligne de séparation avec gradient et animation */}
      <motion.div
        className={`${heightClasses[height]} ${widthClasses[width]} rounded-full bg-gradient-to-r ${gradientClass} mx-auto relative overflow-hidden shadow-sm`}
        variants={animate ? lineVariants : undefined}
        initial={animate ? "hidden" : undefined}
        animate={animate ? "visible" : undefined}
      >
        {/* Effet de brillance qui se déplace */}
        {animate && (
          <motion.div
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              left: ["0%", "100%"],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        )}
      </motion.div>

      {/* Point central optionnel */}
      {withDot && (
        <motion.div
          className={`absolute w-3 h-3 rounded-full bg-gradient-to-r from-${from} to-${to} shadow-md`}
          variants={animate ? dotVariants : undefined}
          initial={animate ? "hidden" : undefined}
          animate={animate ? "visible" : undefined}
        />
      )}
    </div>
  );
};

export default Separator;
import React from "react";
import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  description?: string;
  emoji?: string;
  color?: 
    | "text-teal-600" 
    | "text-blue-600" 
    | "text-purple-600" 
    | "text-indigo-600" 
    | "text-rose-600" 
    | "text-orange-600" 
    | "text-gray-800";
  emojiColor?: string;
  align?: "left" | "center" | "right";
  withLine?: boolean;
  withBadge?: boolean;
  className?: string;
  badgeLabel?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  emoji,
  color = "text-teal-600",
  emojiColor = "text-yellow-500",
  align = "center",
  withLine = true,
  withBadge = false,
  className = "",
  badgeLabel
}) => {
  // Déterminez les classes d'alignement
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  // Animations avec des courbes d'accélération Apple-like
  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const descriptionVariants = {
    hidden: { 
      opacity: 0, 
      y: -10 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.15, 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const lineVariants = {
    hidden: { 
      width: 0,
      opacity: 0
    },
    visible: { 
      width: align === 'center' ? "80px" : "100%",
      opacity: 1,
      transition: { 
        delay: 0.3, 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const badgeVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -5
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={`${alignClasses[align]} ${className} relative mb-12`}
    >
      {/* Badge optionnel */}
      {withBadge && badgeLabel && (
        <motion.div
          variants={badgeVariants}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color.replace('text-', 'bg-').replace('-600', '-100')} ${color} mb-3`}
        >
          {badgeLabel}
        </motion.div>
      )}

      {/* Titre principal avec emoji */}
      <motion.h2 
        variants={titleVariants}
        className={`text-3xl md:text-4xl font-bold ${color} tracking-wide flex items-center ${align === 'center' ? 'justify-center' : 'justify-start'} gap-3`}
      >
        {emoji && (
          <motion.span 
            className={`${emojiColor} inline-block`}
            animate={{ 
              rotate: [0, -5, 5, -3, 3, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              ease: "easeInOut", 
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              delay: 0.5,
              repeat: Infinity,
              repeatDelay: 5
            }}
          >
            {emoji}
          </motion.span>
        )}
        <span className="relative">
          {title}
          {withLine && align !== 'center' && (
            <motion.div
              variants={lineVariants}
              className={`absolute -bottom-3 left-0 h-1 rounded-full ${color.replace('text-', 'bg-')}`}
            />
          )}
        </span>
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p 
          variants={descriptionVariants}
          className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto font-normal leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {/* Ligne de séparation centrée avec effet de gradient */}
      {withLine && align === 'center' && (
        <motion.div
          variants={lineVariants}
          className={`h-1.5 rounded-full mx-auto mt-6 bg-gradient-to-r ${
            color === 'text-teal-600' ? 'from-teal-400 to-blue-500' : 
            color === 'text-blue-600' ? 'from-blue-400 to-indigo-500' :
            color === 'text-purple-600' ? 'from-purple-400 to-pink-500' :
            color === 'text-indigo-600' ? 'from-indigo-400 to-purple-500' :
            color === 'text-rose-600' ? 'from-rose-400 to-pink-500' :
            color === 'text-orange-600' ? 'from-orange-400 to-amber-500' :
            'from-gray-400 to-gray-600'
          }`}
        />
      )}
    </motion.div>
  );
};

export default SectionTitle;
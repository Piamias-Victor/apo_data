import React from "react";
import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  description?: string;
  emoji?: string;
  color?: "text-teal-600" | "text-blue-600" | "text-purple-600" | "text-indigo-600" | "text-rose-600" | "text-orange-600" | "text-gray-800";
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

  // Animations
  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
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
        delay: 0.2, 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  };

  const lineVariants = {
    hidden: { 
      width: 0 
    },
    visible: { 
      width: "100%",
      transition: { 
        delay: 0.4, 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={`${alignClasses[align]} ${className} relative mb-8`}
    >
      {/* Badge optionnel */}
      {withBadge && badgeLabel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`px-3 py-1 rounded-full text-xs font-medium ${color.replace('text-', 'bg-').replace('-600', '-100')} ${color} inline-block mb-2`}
        >
          {badgeLabel}
        </motion.div>
      )}

      {/* Titre principal avec emoji */}
      <motion.h2 
        variants={titleVariants}
        className={`text-3xl md:text-4xl font-extrabold ${color} tracking-wide flex items-center ${align === 'center' ? 'justify-center' : 'justify-start'} gap-3`}
      >
        {emoji && <span className={emojiColor}>{emoji}</span>}
        <span className="relative">
          {title}
          {withLine && align !== 'center' && (
            <motion.div
              variants={lineVariants}
              className={`absolute -bottom-2 left-0 h-1 rounded-full ${color.replace('text-', 'bg-')}`}
            />
          )}
        </span>
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p 
          variants={descriptionVariants}
          className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      )}

      {/* Ligne de séparation pour l'alignement au centre */}
      {withLine && align === 'center' && (
        <motion.div
          variants={lineVariants}
          className="h-1 w-24 rounded-full mx-auto mt-4 bg-gradient-to-r from-teal-400 to-blue-500"
        />
      )}
    </motion.div>
  );
};

export default SectionTitle;
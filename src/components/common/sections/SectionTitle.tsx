// components/ui/SectionTitle.tsx
import React from "react";
import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  description: string;
  emoji: string;
  color: string;
  emojiColor?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  description,
  emoji,
  color,
  emojiColor = "text-yellow-500"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center"
    >
      <h2 className={`text-4xl font-extrabold ${color} tracking-wide flex items-center justify-center gap-3`}>
        <span className={emojiColor}>{emoji}</span> {title}
      </h2>
      <p className="text-gray-600 mt-2 text-lg">
        {description}
      </p>
    </motion.div>
  );
};

export default SectionTitle;
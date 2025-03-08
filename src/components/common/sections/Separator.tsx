// components/ui/Separator.tsx
import React from "react";
import { motion } from "framer-motion";

interface SeparatorProps {
  from: string;
  via: string;
  to: string;
}

const Separator: React.FC<SeparatorProps> = ({ from, via, to }) => {
  return (
    <motion.div
      className={`mt-12 border-t-4 border-gradient-to-r from-${from} via-${via} to-${to} mx-auto w-3/4`}
      initial={{ width: 0 }}
      animate={{ width: "75%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
};

export default Separator;
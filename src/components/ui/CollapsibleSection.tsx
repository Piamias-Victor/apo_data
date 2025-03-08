// components/ui/CollapsibleSection.tsx
import React, { useState, ReactNode } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  buttonColorClass?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultCollapsed = true,
  buttonColorClass = "bg-teal-500 hover:bg-teal-600"
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      {/* Bouton de toggle avec animation */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className={`absolute top-4 right-4 ${buttonColorClass} text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition flex items-center gap-2`}
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} 
        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        {icon} <span>{title}</span>
      </h2>

      {/* Contenu animé */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;
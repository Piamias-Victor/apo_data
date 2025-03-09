import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import { tabItems } from "@/components/common/layout/tabItems";
import LabDropdown from "@/components/features/laboratory/overview/LabDropdown";
import SelectedLabsList from "@/components/features/laboratory/overview/SelectedLabsList";
import SegmentationDropdown from "@/components/features/laboratory/overview/LabDropdown";

// Transitions et animations inchangées
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      ease: "easeOut",
      duration: 0.7
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut" 
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 80,
      damping: 12
    }
  }
};

// Composant TabButton inchangé
const TabButton = ({ isActive, onClick, label }) => (
  <motion.button
    onClick={onClick}
    className={`px-5 py-3 relative transition-all rounded-xl text-sm font-medium ${
      isActive 
        ? "text-teal-700 bg-gradient-to-r from-teal-50/80 to-teal-50/50 backdrop-blur-sm" 
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50/50"
    }`}
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
  >
    <span className="relative z-10">{label}</span>
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-50/80 to-teal-50/50 backdrop-blur-sm"
        initial={false}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </motion.button>
);

const LaboratoryPage: React.FC = () => {
  const router = useRouter();
  const { brand } = router.query;
  const { filters, setFilters } = useFilterContext();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animation de chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Applique automatiquement le filtre si un `brand` est présent dans l'URL
  useEffect(() => {
    if (typeof brand === "string" && !filters.brands.includes(brand)) {
      setFilters({ brands: [...filters.brands, brand] });
    }
  }, [brand, setFilters, filters.brands]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-12 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Carte principale avec dropdown et sélection */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60 p-8 mb-6 relative z-10"
        >
          <motion.h1 
            className="text-2xl font-bold mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">
              Tableau de bord laboratoire
            </span>
          </motion.h1>
          
          {/* Conteneur avec position relative pour le dropdown */}
          <div className="mb-8 max-w-3xl mx-auto relative">
            <div className="relative z-50">
              <SegmentationDropdown />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="w-10 h-10 rounded-full border-3 border-teal-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.p 
                    className="mt-4 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Chargement des données...
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-0" // z-index inférieur pour que le dropdown passe au-dessus
              >
                <SelectedLabsList />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section des onglets */}
        <motion.div variants={itemVariants} className="mt-10 relative z-0">
          {/* z-index réduit pour les onglets */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="flex space-x-1 border-b border-gray-200/70 px-4 py-1 bg-gray-50/50">
              {tabItems.map((tab, index) => (
                <TabButton
                  key={index}
                  isActive={activeTabIndex === index}
                  onClick={() => setActiveTabIndex(index)}
                  label={tab.label}
                />
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-4"
              >
                {tabItems[activeTabIndex].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LaboratoryPage;
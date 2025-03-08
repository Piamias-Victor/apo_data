import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import { tabItems } from "@/components/common/layout/tabItems";
import LabDropdown from "@/components/features/laboratory/overview/LabDropdown";
import SelectedLabsList from "@/components/features/laboratory/overview/SelectedLabsList";

// Transitions et animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100 
    }
  }
};

// Composant pour l'onglet actif avec l'indication
const TabButton = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 relative transition-all rounded-lg text-sm font-medium ${
      isActive 
        ? "text-teal-700 bg-teal-50" 
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
    }`}
  >
    {label}
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

const LaboratoryPage: React.FC = () => {
  const router = useRouter();
  const { brand } = router.query;
  const { filters, setFilters } = useFilterContext();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Afficher temporairement un effet de chargement pour améliorer l'UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
      className="min-h-screen bg-gray-50 pt-8 pb-12 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">
              Tableau de bord laboratoire
            </span>
          </h1>
          
          <div className="mb-8 max-w-3xl">
            <LabDropdown />
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
                  <div className="w-10 h-10 border-4 border-teal-500 border-solid rounded-full animate-spin border-t-transparent"></div>
                  <p className="mt-4 text-sm text-gray-500">Chargement des données...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SelectedLabsList />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10">
          {/* Tabs with animation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex space-x-1 border-b border-gray-200 px-4 bg-gray-50/70">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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
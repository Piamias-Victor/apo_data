import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSegmentationContext } from "@/contexts/segmentation/SegmentationContext";
import SegmentationDisplay from "../segmentation/SegmentationDisplay";
import { useFilterContext } from "@/contexts/FilterContext";
import { 
  HiChevronDown, 
  HiChevronUp, 
  HiBeaker, 
  HiArchiveBox,
  HiOutlinePresentationChartBar,
  HiSparkles
} from "react-icons/hi2";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] // Apple-like ease curve
    }
  }),
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  },
  tap: {
    y: -2,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: "auto",
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Couleurs pour les différents labs (cycliques avec gradients)
const COLORS = [
  {
    border: "border-teal-400",
    bg: "from-teal-400/10 to-teal-500/5",
    text: "text-teal-700",
    hover: "hover:bg-teal-50",
    icon: "text-teal-500"
  },
  {
    border: "border-blue-400",
    bg: "from-blue-400/10 to-blue-500/5",
    text: "text-blue-700",
    hover: "hover:bg-blue-50",
    icon: "text-blue-500"
  },
  {
    border: "border-purple-400",
    bg: "from-purple-400/10 to-purple-500/5",
    text: "text-purple-700",
    hover: "hover:bg-purple-50",
    icon: "text-purple-500"
  },
  {
    border: "border-emerald-400",
    bg: "from-emerald-400/10 to-emerald-500/5",
    text: "text-emerald-700",
    hover: "hover:bg-emerald-50",
    icon: "text-emerald-500"
  },
  {
    border: "border-rose-400",
    bg: "from-rose-400/10 to-rose-500/5",
    text: "text-rose-700",
    hover: "hover:bg-rose-50",
    icon: "text-rose-500"
  }
];

const SelectedLabsList: React.FC = () => {
  // Context hooks
  const { filters } = useFilterContext();
  const { distributors } = useSegmentationContext();
  
  // Local state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedLabCards, setExpandedLabCards] = useState<Record<string, boolean>>({});

  // Create a map of selected labs with their brands
  const selectedLabsMap = useMemo(() => {
    const labsMap = new Map<string, string[]>();

    // First, add all selected distributors (labs) with empty brand arrays
    filters.distributors.forEach((lab) => {
      labsMap.set(lab, []);
    });

    // Then, find the parent lab for each selected brand and add it to the appropriate lab
    filters.brands.forEach((brand) => {
      // Find the distributor that contains this brand
      const distributor = distributors.find((d) => 
        d.brands.some((b) => b.brand_lab === brand)
      );
      
      if (distributor) {
        const lab = distributor.lab_distributor;
        
        // If the lab isn't in our map yet, add it
        if (!labsMap.has(lab)) {
          labsMap.set(lab, []);
        }
        
        // Add the brand to its lab's array
        const brandsForLab = labsMap.get(lab);
        if (brandsForLab) {
          brandsForLab.push(brand);
        }
      }
    });

    return labsMap;
  }, [filters.distributors, filters.brands, distributors]);

  // Convert map to array for rendering
  const selectedLabsArray = Array.from(selectedLabsMap.entries());

  // Toggle lab card expansion
  const toggleLabCard = (lab: string) => {
    setExpandedLabCards(prev => ({
      ...prev,
      [lab]: !prev[lab]
    }));
  };

  // Don't render anything if no labs or brands are selected
  if (selectedLabsArray.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Header with title and toggle button */}
      <div className="flex justify-between items-center mb-5">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-bold text-gray-800 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center shadow-sm border border-teal-200/50">
            <HiOutlinePresentationChartBar className="text-teal-600" />
          </span>
          Laboratoires sélectionnés
        </motion.h2>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors shadow-sm border border-teal-200/50"
          aria-expanded={!isCollapsed}
          aria-controls="labs-content"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {isCollapsed ? "Afficher les détails" : "Masquer les détails"}
          {isCollapsed ? <HiChevronDown /> : <HiChevronUp />}
        </motion.button>
      </div>

      {/* Grid of lab cards */}
      <motion.div 
        id="labs-content"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {selectedLabsArray.map(([lab, brands], index) => (
          <motion.div
            key={lab}
            variants={cardVariants}
            custom={index}
            whileHover="hover"
            whileTap="tap"
            className={`bg-gradient-to-br ${COLORS[index % COLORS.length].bg} rounded-xl shadow-sm border-l-4 ${COLORS[index % COLORS.length].border} overflow-hidden`}
          >
            {/* Lab header with toggle */}
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer ${COLORS[index % COLORS.length].hover} transition-colors`}
              onClick={() => toggleLabCard(lab)}
            >
              <div className="flex items-center">
                <span className={`w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-100 ${COLORS[index % COLORS.length].icon}`}>
                  <HiBeaker className="w-5 h-5" />
                </span>
                <div className="ml-3">
                  <h3 className={`font-semibold ${COLORS[index % COLORS.length].text}`}>{lab}</h3>
                  {brands.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {brands.length} marque{brands.length > 1 ? 's' : ''} associée{brands.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: expandedLabCards[lab] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-100 text-gray-500"
              >
                <HiChevronDown />
              </motion.div>
            </div>
            
            {/* Brands list */}
            {brands.length > 0 && (
              <div className="px-4 pb-3">
                <ul className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <li key={brand} className="inline-flex items-center px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full shadow-sm text-xs font-medium text-blue-700 border border-blue-100">
                      <HiArchiveBox className="mr-1.5 text-blue-500" />
                      {brand}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Segmentation details (animated on expand/collapse) */}
            <AnimatePresence>
              {!isCollapsed && expandedLabCards[lab] && (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <HiSparkles className="text-yellow-500" />
                      Détails de segmentation
                    </div>
                    <SegmentationDisplay lab={lab} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SelectedLabsList;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  colorScheme?: "teal" | "blue" | "purple" | "indigo" | "rose" | "orange";
  variant?: "default" | "pills" | "underline";
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultIndex = 0,
  colorScheme = "teal",
  variant = "default"
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const [fadeDirection, setFadeDirection] = useState<"right" | "left">("right");

  // Définir les couleurs en fonction du schéma choisi
  const colorClasses = {
    teal: {
      active: "text-teal-700 border-teal-500 bg-teal-50",
      inactive: "text-gray-600 hover:text-teal-600",
      pill: "bg-teal-500 text-white",
      hover: "hover:bg-teal-50 hover:text-teal-600",
      border: "border-teal-500",
    },
    blue: {
      active: "text-blue-700 border-blue-500 bg-blue-50",
      inactive: "text-gray-600 hover:text-blue-600",
      pill: "bg-blue-500 text-white",
      hover: "hover:bg-blue-50 hover:text-blue-600",
      border: "border-blue-500",
    },
    purple: {
      active: "text-purple-700 border-purple-500 bg-purple-50",
      inactive: "text-gray-600 hover:text-purple-600",
      pill: "bg-purple-500 text-white",
      hover: "hover:bg-purple-50 hover:text-purple-600",
      border: "border-purple-500",
    },
    indigo: {
      active: "text-indigo-700 border-indigo-500 bg-indigo-50",
      inactive: "text-gray-600 hover:text-indigo-600",
      pill: "bg-indigo-500 text-white",
      hover: "hover:bg-indigo-50 hover:text-indigo-600",
      border: "border-indigo-500",
    },
    rose: {
      active: "text-rose-700 border-rose-500 bg-rose-50",
      inactive: "text-gray-600 hover:text-rose-600",
      pill: "bg-rose-500 text-white",
      hover: "hover:bg-rose-50 hover:text-rose-600",
      border: "border-rose-500",
    },
    orange: {
      active: "text-orange-700 border-orange-500 bg-orange-50",
      inactive: "text-gray-600 hover:text-orange-600",
      pill: "bg-orange-500 text-white",
      hover: "hover:bg-orange-50 hover:text-orange-600",
      border: "border-orange-500",
    },
  };

  // Définir les classes CSS en fonction des variantes et des couleurs
  const getTabClasses = (index: number) => {
    const isActive = index === activeIndex;
    const colors = colorClasses[colorScheme];
    
    switch(variant) {
      case "pills":
        return `rounded-full px-5 py-2 text-sm font-medium transition-all ${
          isActive 
            ? colors.pill
            : `text-gray-600 ${colors.hover}`
        }`;
      case "underline":
        return `px-5 py-3 text-sm font-medium transition-all border-b-2 ${
          isActive 
            ? `border-b-2 ${colors.border} text-gray-900`
            : `border-transparent ${colors.inactive}`
        }`;
      default:
        return `px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
          isActive 
            ? colors.active
            : `${colors.inactive} ${colors.hover}`
        }`;
    }
  };

  // Mettre à jour la hauteur du contenu pour une transition fluide
  useEffect(() => {
    setContentHeight("auto");
  }, [activeIndex]);

  // Déterminer la direction de transition
  const handleTabClick = (index: number) => {
    setFadeDirection(index > activeIndex ? "right" : "left");
    setActiveIndex(index);
  };

  // Variantes d'animation pour le contenu des onglets
  const contentVariants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -20 : 20,
      opacity: 0
    })
  };

  return (
    <div className="w-full">
      {/* Barre d'onglets avec différentes variantes */}
      {variant === "pills" ? (
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-full mb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={getTabClasses(index)}
            >
              <div className="flex items-center gap-1.5">
                {tab.icon && <span className="text-current">{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      ) : variant === "underline" ? (
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={getTabClasses(index)}
            >
              <div className="flex items-center gap-1.5">
                {tab.icon && <span className="text-current">{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleTabClick(index)}
                className={getTabClasses(index)}
              >
                <div className="flex items-center gap-1.5">
                  {tab.icon && <span className="text-current">{tab.icon}</span>}
                  <span>{tab.label}</span>
                </div>
              </button>
              {index === activeIndex && (
                <motion.div 
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${colorClasses[colorScheme].border}`}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contenu de l'onglet actif avec animation */}
      <div className="mt-4 relative overflow-hidden" style={{ minHeight: contentHeight !== "auto" ? contentHeight : undefined }}>
        <AnimatePresence custom={fadeDirection} mode="wait">
          <motion.div
            key={activeIndex}
            custom={fadeDirection}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onAnimationStart={() => {
              if (contentHeight === "auto") {
                const element = document.getElementById(`tab-content-${activeIndex}`);
                if (element) {
                  setContentHeight(element.offsetHeight);
                }
              }
            }}
          >
            <div id={`tab-content-${activeIndex}`}>
              {tabs[activeIndex].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
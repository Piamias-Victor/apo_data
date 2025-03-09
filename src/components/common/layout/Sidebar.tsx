import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiHome, 
  HiBeaker, 
  HiChartBar, 
  HiOutlineShoppingBag,
  HiTruck,
  HiArrowsRightLeft,
  HiChartPie,
  HiChevronRight,
  HiChevronLeft
} from "react-icons/hi2";

// Configuration des sections de navigation
const sections = [
  {
    name: "Accueil",
    link: "/",
    icon: <HiHome className="w-5 h-5" />,
    activeColor: "text-teal-500",
    activeBg: "bg-teal-50",
    hoverColor: "hover:text-teal-500",
    hoverBg: "hover:bg-teal-50/60",
  },
  {
    name: "Laboratoire",
    link: "/laboratory",
    icon: <HiBeaker className="w-5 h-5" />,
    activeColor: "text-teal-500",
    activeBg: "bg-teal-50",
    hoverColor: "hover:text-teal-500",
    hoverBg: "hover:bg-teal-50/60",
  },
  {
    name: "Marché",
    link: "/segmentation",
    icon: <HiChartBar className="w-5 h-5" />,
    activeColor: "text-blue-500",
    activeBg: "bg-blue-50",
    hoverColor: "hover:text-blue-500",
    hoverBg: "hover:bg-blue-50/60",
  },
  {
    name: "Générique",
    link: "/generic",
    icon: <HiOutlineShoppingBag className="w-5 h-5" />,
    activeColor: "text-purple-500",
    activeBg: "bg-purple-50",
    hoverColor: "hover:text-purple-500",
    hoverBg: "hover:bg-purple-50/60",
  },
  {
    name: "Grossiste",
    link: "/wholesaler",
    icon: <HiTruck className="w-5 h-5" />,
    activeColor: "text-orange-500",
    activeBg: "bg-orange-50",
    hoverColor: "hover:text-orange-500",
    hoverBg: "hover:bg-orange-50/60",
  },
  // Sections supplémentaires
  {
    name: "Échanges",
    link: "/exchanges",
    icon: <HiArrowsRightLeft className="w-5 h-5" />,
    activeColor: "text-indigo-500",
    activeBg: "bg-indigo-50",
    hoverColor: "hover:text-indigo-500",
    hoverBg: "hover:bg-indigo-50/60",
  },
  {
    name: "Rapports",
    link: "/reports",
    icon: <HiChartPie className="w-5 h-5" />,
    activeColor: "text-rose-500",
    activeBg: "bg-rose-50",
    hoverColor: "hover:text-rose-500",
    hoverBg: "hover:bg-rose-50/60",
  },
];


const Sidebar = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Détermine si la sidebar est actuellement étendue
  const isExpanded = !collapsed || isHovering;

  return (
    <>
      {/* Backdrop pour mobile */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden ${collapsed ? 'hidden' : 'block'}`}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar principale avec largeur fixe pour prévenir le décalage */}
      <motion.div
        initial={false}
        animate={{ 
          width: isExpanded ? 240 : 76,
          transition: { duration: 0.2, ease: "easeInOut" }
        }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className="fixed left-0 top-0 h-full z-30 bg-white/95 backdrop-blur-sm border-r border-gray-100 shadow-md"
      >
        <div className="flex flex-col h-full">
          {/* En-tête avec logo */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-400 text-white rounded-xl shadow-md">
                <span className="font-bold">A</span>
              </div>
              
              {/* Container de largeur fixe pour le texte du logo */}
              <div className="w-[140px] overflow-hidden">
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-semibold text-gray-800 whitespace-nowrap"
                  >
                    ApoData
                  </motion.span>
                )}
              </div>
            </Link>
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isExpanded ? <HiChevronLeft className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-grow">
            <div className="space-y-1.5">
              {sections.map((section, index) => {
                const isActive = router.pathname === section.link || router.pathname.startsWith(section.link + "/");
                
                return (
                  <div key={section.name} className="relative">
                    <Link
                      href={section.link}
                      className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? `${section.activeColor} ${section.activeBg} font-medium shadow-sm`
                          : `text-gray-500 ${section.hoverColor} ${section.hoverBg}`
                      }`}
                    >
                      {/* Conteneur fixe pour l'icône */}
                      <div className={`${isActive ? section.activeColor : 'text-gray-400'} w-5 flex justify-center`}>
                        {section.icon}
                      </div>
                      
                      {/* Conteneur fixe pour le texte */}
                      <div className="w-[160px] ml-3 overflow-hidden">
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {section.name}
                          </motion.span>
                        )}
                      </div>
                      
                      {/* Indicateur actif */}
                      {isExpanded && isActive && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Pied de page */}
          <div className="p-4 mt-auto border-t border-gray-100">
            {isExpanded ? (
              <div>
                <p className="text-xs font-medium text-gray-600">ApoData Analytics</p>
                <p className="text-xs text-gray-400">Version 3.2.0</p>
              </div>
            ) : (
              <div className="text-xs font-medium text-gray-400 text-center">
                v3.2
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Espace réservé pour maintenir la mise en page */}
      <div className={`transition-all duration-200 ${isExpanded ? 'w-[240px]' : 'w-[76px]'}`} />
    </>
  );
};

export default Sidebar;
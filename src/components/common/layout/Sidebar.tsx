import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { 
  FaFlask, 
  FaChartLine, 
  FaPills, 
  FaTruck,
  FaExchangeAlt,
  FaChartBar,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";

// Configuration des sections de navigation
const sections = [
  {
    name: "Laboratoire",
    link: "/laboratory",
    icon: <FaFlask className="text-xl" />,
    activeColor: "text-teal-500",
    activeBg: "bg-teal-50",
    hoverColor: "hover:text-teal-500",
    hoverBg: "hover:bg-teal-50/60",
    defaultColor: "text-gray-500",
  },
  {
    name: "Marché",
    link: "/segmentation",
    icon: <FaChartLine className="text-xl" />,
    activeColor: "text-blue-500",
    activeBg: "bg-blue-50",
    hoverColor: "hover:text-blue-500",
    hoverBg: "hover:bg-blue-50/60",
    defaultColor: "text-gray-500",
  },
  {
    name: "Générique",
    link: "/generic",
    icon: <FaPills className="text-xl" />,
    activeColor: "text-purple-500",
    activeBg: "bg-purple-50",
    hoverColor: "hover:text-purple-500",
    hoverBg: "hover:bg-purple-50/60",
    defaultColor: "text-gray-500",
  },
  {
    name: "Grossiste",
    link: "/wholesaler",
    icon: <FaTruck className="text-xl" />,
    activeColor: "text-orange-500",
    activeBg: "bg-orange-50",
    hoverColor: "hover:text-orange-500",
    hoverBg: "hover:bg-orange-50/60",
    defaultColor: "text-gray-500",
  },
  // Sections supplémentaires
  {
    name: "Échanges",
    link: "/exchanges",
    icon: <FaExchangeAlt className="text-xl" />,
    activeColor: "text-indigo-500",
    activeBg: "bg-indigo-50",
    hoverColor: "hover:text-indigo-500",
    hoverBg: "hover:bg-indigo-50/60",
    defaultColor: "text-gray-500",
  },
  {
    name: "Rapports",
    link: "/reports",
    icon: <FaChartBar className="text-xl" />,
    activeColor: "text-rose-500",
    activeBg: "bg-rose-50",
    hoverColor: "hover:text-rose-500",
    hoverBg: "hover:bg-rose-50/60",
    defaultColor: "text-gray-500",
  },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Variantes d'animation pour les sections
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <>
      {/* Backdrop pour mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${collapsed ? 'hidden' : 'block'}`}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar principale */}
      <motion.div
        initial={false}
        animate={{ 
          width: collapsed ? 76 : 240,
          transition: { duration: 0.2, ease: "easeInOut" }
        }}
        className={`fixed left-0 top-0 h-full z-30 bg-white border-r border-gray-200 transition-shadow ${
          collapsed ? "shadow-sm" : "shadow-md"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête avec logo */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg">
                <span className="font-bold">A</span>
              </div>
              {!collapsed && <span className="font-semibold text-gray-900">ApoData</span>}
            </Link>
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-grow">
            <div className="space-y-2">
              {sections.map((section, index) => {
                const isActive = router.pathname.startsWith(section.link);
                
                return (
                  <motion.div
                    key={section.name}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={section.link}
                      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? `${section.activeColor} ${section.activeBg} font-medium`
                          : `${section.defaultColor} ${section.hoverColor} ${section.hoverBg}`
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${isActive ? section.activeColor : section.defaultColor}`}>
                          {section.icon}
                        </div>
                        {!collapsed && <span>{section.name}</span>}
                      </div>
                      
                      {!collapsed && isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1.5 h-1.5 rounded-full bg-current"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Pied de page */}
          <div className={`p-4 mt-auto border-t border-gray-200 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? (
              <div className="text-xs font-medium text-gray-500">v3.1</div>
            ) : (
              <div>
                <p className="text-xs font-medium text-gray-700">ApoData Analytics</p>
                <p className="text-xs text-gray-500">Version 3.1.2</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Espace réservé pour maintenir la mise en page */}
      <div className={`transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-[240px]'}`} />
    </>
  );
};

export default Sidebar;
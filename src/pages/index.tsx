import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFlask, FaChartLine, FaPills, FaTruck } from "react-icons/fa";

// Animation variants pour améliorer l'interface utilisateur
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Cartes avec données des sections
const sections = [
  {
    name: "Laboratoire",
    description: "Suivi des laboratoires et analyse des performances.",
    icon: <FaFlask className="text-5xl" />,
    link: "/laboratory",
    color: "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:from-teal-100 hover:to-teal-200",
    iconColor: "text-teal-500",
  },
  {
    name: "Marché",
    description: "Segmentation des produits et tendances du marché.",
    icon: <FaChartLine className="text-5xl" />,
    link: "/segmentation",
    color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200",
    iconColor: "text-blue-500",
  },
  {
    name: "Générique",
    description: "Gestion et suivi des médicaments génériques.",
    icon: <FaPills className="text-5xl" />,
    link: "/generic",
    color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200",
    iconColor: "text-purple-500",
  },
  {
    name: "Grossiste",
    description: "Suivi des commandes et des stocks fournisseurs.",
    icon: <FaTruck className="text-5xl" />,
    link: "/wholesaler",
    color: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200",
    iconColor: "text-orange-500",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-500">
            ApoData
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plateforme analytique pour optimiser vos performances pharmaceutiques
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {sections.map((section) => (
          <motion.div
            key={section.name}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`rounded-2xl shadow-sm border p-8 ${section.color} transition-all duration-300 transform hover:shadow-lg`}
          >
            <Link href={section.link} className="flex flex-col h-full">
              <div className={`${section.iconColor} mb-6 flex justify-center`}>
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.name}</h2>
              <p className="text-gray-600 text-sm flex-grow">{section.description}</p>
              <div className="mt-6 flex justify-center">
                <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${section.iconColor} bg-white/60 backdrop-blur-sm`}>
                  Explorer
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Bannière d'aide en bas de page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="max-w-5xl mx-auto mt-16 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-medium text-gray-900">Besoin d'aide pour vos analyses ?</h3>
            <p className="text-gray-500 text-sm mt-1">
              Notre équipe est disponible pour vous guider dans l'utilisation de la plateforme.
            </p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-full font-medium shadow-sm hover:shadow transition-all">
            Contacter le support
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
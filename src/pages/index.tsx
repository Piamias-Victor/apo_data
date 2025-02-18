import React from "react";
import Link from "next/link";
import { FaFlask, FaChartLine, FaPills, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

const sections = [
  {
    name: "Laboratoire",
    description: "Suivi des laboratoires et analyse des performances.",
    icon: <FaFlask className="text-teal-500 text-5xl" />,
    link: "/laboratory",
    bg: "bg-teal-100",
  },
  {
    name: "Marché",
    description: "Segmentation des produits et tendances du marché.",
    icon: <FaChartLine className="text-blue-500 text-5xl" />,
    link: "/segmentation",
    bg: "bg-blue-100",
  },
  {
    name: "Générique",
    description: "Gestion et suivi des médicaments génériques.",
    icon: <FaPills className="text-purple-500 text-5xl" />,
    link: "/generic",
    bg: "bg-purple-100",
  },
  {
    name: "Grossiste",
    description: "Suivi des commandes et des stocks fournisseurs.",
    icon: <FaTruck className="text-orange-500 text-5xl" />,
    link: "/wholesaler",
    bg: "bg-orange-100",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* 🔹 Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 text-center"
      >
        📊 Tableau de Bord ApoData
      </motion.h1>

      <p className="text-center text-gray-600 mt-2">
        Analysez les ventes, performances et tendances du marché pharmaceutique.
      </p>

      {/* 🔹 Grille des sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 rounded-xl shadow-lg border border-gray-300 hover:shadow-xl transition-all cursor-pointer ${section.bg}`}
          >
            <Link href={section.link} className="flex items-center space-x-4">
              {section.icon}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{section.name}</h2>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FaFlask, 
  FaChartLine, 
  FaPills, 
  FaTruck, 
  FaArrowRight
} from "react-icons/fa";

// Animation variants for container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

// Animation variants for individual elements
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 15
    }
  }
};

// Card hover animation
const cardHoverAnimation = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: { 
      type: "spring", 
      stiffness: 300,
      damping: 20
    }
  }
};

// Button hover animation
const buttonHoverAnimation = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 10
    }
  }
};

// Cards with section data
const sections = [
  {
    name: "Laboratoire",
    description: "Analyse des performances et suivi des laboratoires pharmaceutiques.",
    icon: <FaFlask className="text-5xl" />,
    link: "/laboratory",
    color: "from-teal-50 to-cyan-100",
    accent: "teal",
    bg: "bg-gradient-to-br from-teal-50 to-cyan-100",
    iconColor: "text-teal-500",
  },
  {
    name: "Marché",
    description: "Tendances du marché et segmentation avancée des produits.",
    icon: <FaChartLine className="text-5xl" />,
    link: "/segmentation",
    color: "from-blue-50 to-indigo-100",
    accent: "blue",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
    iconColor: "text-blue-500",
  },
  {
    name: "Générique",
    description: "Suivi et gestion des médicaments génériques et spécialités.",
    icon: <FaPills className="text-5xl" />,
    link: "/generic",
    color: "from-purple-50 to-fuchsia-100",
    accent: "purple",
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
    iconColor: "text-purple-500",
  },
  {
    name: "Grossiste",
    description: "Gestion des stocks fournisseurs et suivi des commandes.",
    icon: <FaTruck className="text-5xl" />,
    link: "/wholesaler",
    color: "from-amber-50 to-orange-100",
    accent: "amber",
    bg: "bg-gradient-to-br from-amber-50 to-orange-100",
    iconColor: "text-amber-500",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-6">
      {/* Decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-teal-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-80 h-80 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-7xl font-black tracking-tight text-gray-900 mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
              ApoData
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Plateforme analytique intelligente pour optimiser 
            les performances de vos activités pharmaceutiques.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              variants={buttonHoverAnimation}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full font-medium shadow-lg shadow-blue-200/50 flex items-center gap-2"
            >
              Explorer la plateforme
              <FaArrowRight />
            </motion.button>
            
            <motion.button
              variants={buttonHoverAnimation}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-white text-gray-800 rounded-full font-medium shadow-lg shadow-gray-100"
            >
              Voir la démo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Main Sections Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {sections.map((section) => (
            <motion.div
              key={section.name}
              variants={itemVariants}
              whileHover="hover"
              initial="rest"
              variants={cardHoverAnimation}
              className={`rounded-2xl shadow-xl border border-${section.accent}-100 ${section.bg} p-8 backdrop-blur-sm transition-all duration-300 flex flex-col h-full`}
            >
              <Link href={section.link} className="flex flex-col h-full">
                <div className={`${section.iconColor} mb-6 flex justify-center`}>
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.name}</h2>
                <p className="text-gray-600 text-base flex-grow">{section.description}</p>
                <div className="mt-8 flex justify-between items-center">
                  <span className={`text-${section.accent}-500 font-medium text-sm`}>
                    Explorer
                  </span>
                  <span className={`flex justify-center items-center w-8 h-8 rounded-full bg-${section.accent}-500 bg-opacity-10 text-${section.accent}-500`}>
                    <FaArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-32 max-w-5xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Exploitez toute la puissance de vos données</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-xl bg-white shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyses prédictives</h3>
              <p className="text-gray-600">Anticipez les tendances du marché et optimisez vos stocks</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-xl bg-white shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance en temps réel</h3>
              <p className="text-gray-600">Suivez et analysez vos données commerciales en direct</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-xl bg-white shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité des données</h3>
              <p className="text-gray-600">Protection des informations sensibles et conformité RGPD</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-32 p-10 bg-gradient-to-br from-blue-500/5 to-teal-500/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Prêt à optimiser votre pharmacie?
              </h2>
              <p className="text-gray-600 md:text-lg">
                Notre équipe d'experts est disponible pour vous accompagner dans l'analyse de vos données.
              </p>
            </div>
            
            <motion.button
              variants={buttonHoverAnimation}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium shadow-lg shadow-blue-200/30 flex items-center gap-2 whitespace-nowrap"
            >
              Démarrer maintenant
              <FaArrowRight />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
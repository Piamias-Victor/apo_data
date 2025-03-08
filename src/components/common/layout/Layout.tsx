import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Effet pour détecter quand le scroll vers le haut est nécessaire
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    setPageLoaded(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fonction pour revenir en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50/80 backdrop-blur-sm font-sans">
      {/* Sidebar à gauche avec effet de glassmorphism */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6 max-w-screen-2xl">
          <AnimatePresence mode="wait">
            {pageLoaded && (
              <motion.div
                key="page-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.22, 1, 0.36, 1] // Courbe d'accélération style Apple
                }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Pied de page avec glassmorphism */}
        <footer className="py-4 px-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-screen-2xl">
            <div className="text-sm text-gray-500 mb-3 md:mb-0">
              &copy; 2025 ApoData. Tous droits réservés.
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Conditions
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Bouton retour en haut de page */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-white/90 backdrop-blur-md shadow-lg rounded-full 
                      border border-gray-200/50 text-gray-500 hover:text-teal-500 
                      focus:outline-none hover:shadow-xl transition-all duration-300 z-50"
            aria-label="Retour en haut"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiXMark, HiCheck, HiInformationCircle, HiClipboard, HiTag, HiArchiveBox
} from "react-icons/hi2";
import ActionButton from "../buttons/ActionButton";
import BaseDrawer from "../sections/BaseDrawer";
import { useFilterContext } from "@/contexts/FilterContext";

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters } = useFilterContext();
  const [ean13Input, setEan13Input] = useState("");
  const [formattedEan13Count, setFormattedEan13Count] = useState(0);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Animation pour les notifications
  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Synchroniser l'état local avec les filtres globaux
  useEffect(() => {
    if (isOpen && filters.ean13Products?.length) {
      setEan13Input(filters.ean13Products.join("\n"));
      setFormattedEan13Count(filters.ean13Products.length);
      
      // Focus sur le textarea lors de l'ouverture
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else if (isOpen) {
      setEan13Input("");
      setFormattedEan13Count(0);
      
      // Focus sur le textarea vide
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, filters.ean13Products]);

  // Mettre à jour le compteur d'EAN13 valides lors de la saisie
  useEffect(() => {
    const formattedCodes = formatEan13(ean13Input);
    setFormattedEan13Count(formattedCodes.length);
  }, [ean13Input]);

  // Réinitialiser la notification de copie
  useEffect(() => {
    if (copiedToClipboard) {
      const timer = setTimeout(() => setCopiedToClipboard(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedToClipboard]);

  // Réinitialiser la sélection
  const handleClearSelection = () => {
    setEan13Input("");
    setFormattedEan13Count(0);
    
    // Focus sur le textarea après effacement
    textareaRef.current?.focus();
  };

  // Fonction pour formater les EAN13
  const formatEan13 = (input: string): string[] => {
    const potential = input.split(/[\s,;]+/).filter(Boolean);
    
    return potential
      .map(item => item.replace(/\D+/g, ""))
      .filter(item => item.length === 13);
  };

  // Appliquer le filtre au contexte global
  const applyFilter = () => {
    const validEan13 = formatEan13(ean13Input);
    
    setFilters({
      ...filters,
      ean13Products: validEan13,
    });

    onClose();
  };

  // Fonction pour copier les codes dans le presse-papier
  const copyToClipboard = () => {
    const codes = formatEan13(ean13Input);
    if (codes.length > 0) {
      navigator.clipboard.writeText(codes.join("\n"))
        .then(() => setCopiedToClipboard(true))
        .catch(err => console.error("Erreur lors de la copie:", err));
    }
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Sélection de produits par code EAN13"
      width="w-96"
      footer={
        <div className="flex justify-between w-full">
          <ActionButton
            onClick={handleClearSelection}
            icon={<HiXMark />}
            variant="danger"
          >
            Réinitialiser
          </ActionButton>
          
          <ActionButton
            onClick={applyFilter}
            icon={<HiCheck />}
            variant="success"
            disabled={formattedEan13Count === 0}
          >
            Appliquer ({formattedEan13Count})
          </ActionButton>
        </div>
      }
    >
      <div className="p-4 space-y-5">
        {/* Instruction et compteur */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <HiInformationCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Collez une liste de codes EAN13, séparés par des espaces, retours à la ligne, virgules ou points-virgules.
            </p>
          </div>
        </div>
        
        {/* Badge de comptage */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/60">
          <div className="flex items-center">
            <HiTag className="text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Codes EAN13</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            formattedEan13Count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}>
            {formattedEan13Count} code(s) valide(s)
          </span>
        </div>
      
        {/* Zone de saisie */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={ean13Input}
            onChange={(e) => setEan13Input(e.target.value)}
            placeholder="Ex: 3400936564725 3400939076178 3401561160675..."
            className="w-full h-48 p-4 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 resize-none transition-all duration-300"
            spellCheck={false}
          ></textarea>
          
          {ean13Input && (
            <button
              onClick={handleClearSelection}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              title="Effacer"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Aperçu des codes identifiés */}
        {formattedEan13Count > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <HiArchiveBox className="mr-2 text-gray-500" />
                Aperçu des codes identifiés
              </h4>
              
              <button
                onClick={copyToClipboard}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                title="Copier tous les codes"
              >
                <HiClipboard className="w-3.5 h-3.5" />
                Copier
              </button>
            </div>
            
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {formatEan13(ean13Input).slice(0, 20).map((ean, index) => (
                  <div key={index} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs border border-blue-100">
                    {ean}
                  </div>
                ))}
                {formattedEan13Count > 20 && (
                  <div className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                    +{formattedEan13Count - 20} autres
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Notification de copie */}
        <AnimatePresence>
          {copiedToClipboard && (
            <motion.div
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[10000]"
            >
              Codes copiés dans le presse-papier!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseDrawer>
  );
};

export default ProductDrawer;
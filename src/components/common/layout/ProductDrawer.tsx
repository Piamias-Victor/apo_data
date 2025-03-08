import { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaInfoCircle } from "react-icons/fa";
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

  // Synchroniser l'état local avec les filtres globaux
  useEffect(() => {
    if (isOpen && filters.ean13Products?.length) {
      setEan13Input(filters.ean13Products.join("\n"));
      setFormattedEan13Count(filters.ean13Products.length);
    }
  }, [isOpen, filters.ean13Products]);

  // Mettre à jour le compteur d'EAN13 valides lors de la saisie
  useEffect(() => {
    setFormattedEan13Count(formatEan13(ean13Input).length);
  }, [ean13Input]);

  // Réinitialiser la sélection
  const handleClearSelection = () => {
    setEan13Input("");
    setFormattedEan13Count(0);
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

  const footerContent = (
    <div className="flex justify-between">
      <ActionButton
        onClick={handleClearSelection}
        icon={<FaTimes />}
        variant="danger"
      >
        Réinitialiser
      </ActionButton>

      <ActionButton
        onClick={applyFilter}
        icon={<FaCheck />}
        variant="success"
      >
        Appliquer
      </ActionButton>
    </div>
  );

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtres Produits"
      width="w-96"
      footer={footerContent}
    >
      <div className="space-y-6">
        {/* Saisie des Codes EAN13 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600 text-sm">Coller des codes EAN13 :</p>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {formattedEan13Count} code(s) valide(s)
            </span>
          </div>
          
          <textarea
            value={ean13Input}
            onChange={(e) => setEan13Input(e.target.value)}
            placeholder="Collez ici une liste de codes EAN13, peu importe le format..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-700 bg-white shadow-md focus:border-teal-500 focus:ring-2 focus:ring-teal-400 transition-all duration-300"
            rows={10}
          ></textarea>
          
          <div className="mt-2 flex items-start text-xs text-gray-500">
            <FaInfoCircle className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
            <p>
              Les codes sont automatiquement extraits et formatés. Vous pouvez coller des codes séparés 
              par des espaces, des retours à la ligne, des virgules ou des points-virgules.
            </p>
          </div>
        </div>
        
        {/* Aperçu des codes EAN identifiés */}
        {formattedEan13Count > 0 && (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <p className="text-xs font-medium text-gray-700 mb-2">Aperçu des codes identifiés :</p>
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {formatEan13(ean13Input).slice(0, 20).map((ean, index) => (
                  <span key={index} className="bg-white text-xs px-2 py-1 rounded border border-gray-300">
                    {ean}
                  </span>
                ))}
                {formattedEan13Count > 20 && (
                  <span className="bg-gray-100 text-xs px-2 py-1 rounded border border-gray-300">
                    +{formattedEan13Count - 20} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};

export default ProductDrawer;
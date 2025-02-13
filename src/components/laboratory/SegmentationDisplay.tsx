import { useState, useEffect } from "react";
import { FilterState, useFilterContext } from "@/contexts/FilterContext";
import { FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Segmentation {
  universe: string;
  category: string;
  sub_category: string;
  family: string;
  sub_family: string;
  specificity: string;
  ranges: string[]; // 🔹 Ajout des gammes dans l'objet segmentation
}

const SegmentationDisplay: React.FC = () => {
  const { filters, setFilters } = useFilterContext();
  const [segmentation, setSegmentation] = useState<Segmentation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  // États locaux pour stocker la sélection avant application
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    universes: filters.universes || [],
    categories: filters.categories || [],
    subCategories: filters.subCategories || [],
    families: filters.families || [],
    subFamilies: filters.subFamilies || [],
    specificities: filters.specificities || [],
    ranges: filters.ranges || [],
    pharmacies: filters.pharmacies,
    distributors: filters.distributors,
    brands: filters.brands,
    dateRange: filters.dateRange,
    type: filters.type,
  });

  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;
  
  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchSegmentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getLaboratorySegmentation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erreur de récupération des données");
        }

        setSegmentation(data.segmentation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentation();
  }, [filters, hasSelectedLabs]);

  if (!hasSelectedLabs) {
    return null;
  }

  // 📌 Définition des filtres et labels
  const segmentationFilters = [
    { key: "ranges", dataKey: "ranges", label: "📊 Gammes" },
    { key: "universes", dataKey: "universe", label: "🌍 Univers" },
    { key: "categories", dataKey: "category", label: "📂 Catégories" },
    { key: "subCategories", dataKey: "sub_category", label: "📑 Sous-Catégories" },
    { key: "families", dataKey: "family", label: "🏠 Familles" },
    { key: "subFamilies", dataKey: "sub_family", label: "🔹 Sous-Familles" },
    { key: "specificities", dataKey: "specificity", label: "🔬 Spécificités" },
  ];

  // 🔹 Fonction pour extraire les valeurs uniques et éviter les doublons
  const getUniqueValues = (key: keyof Segmentation) => {
    if (key === "ranges") {
      return Array.from(new Set(segmentation.flatMap((item) => item.ranges).filter(Boolean)));
    }
    return Array.from(new Set(segmentation.map((item) => item[key]).filter(Boolean)));
  };

  // 🔹 Gérer la sélection d'un élément dans un filtre local
  const handleSelectSegmentation = (filterKey: keyof FilterState, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterKey] as string[];
      return {
        ...prev,
        [filterKey]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  // 🔹 Appliquer la sélection locale dans le contexte global
  const handleApplySegmentationFilters = () => {
    setFilters(selectedFilters);
    setIsApplied(true);
    setTimeout(() => {
      setIsApplied(false);
    }, 1000);
  };

  // 🔹 Réinitialiser les filtres locaux
  const handleClearSegmentationFilters = () => {
    setSelectedFilters({
      universes: [],
      categories: [],
      subCategories: [],
      families: [],
      subFamilies: [],
      specificities: [],
      ranges: [],
      pharmacies: filters.pharmacies,
      distributors: filters.distributors,
      brands: filters.brands,
      dateRange: filters.dateRange,
      type: filters.type,
    });
    setFilters({
      universes: [],
      categories: [],
      subCategories: [],
      families: [],
      subFamilies: [],
      specificities: [],
      ranges: [],
    });
  };

  return (
    <div className="mt-4 w-full">
      {loading && <p className="text-blue-500 text-center">Chargement des données...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && segmentation.length > 0 && (
          <>
            {segmentationFilters.map(({ key, dataKey, label }) => {
              const values = getUniqueValues(dataKey as keyof Segmentation);
              if (values.length === 0) return null; // 🔹 Masquer les sections vides

              return (
                <div key={key} className="mt-4 w-full">
                  <h3 className="text-md font-semibold text-teal-700">{label}</h3>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden flex flex-wrap gap-2 mt-2"
                  >
                    {values.map((value, idx) => (
                      <button
                        key={`${key}-${idx}`}
                        className={`px-3 py-1 rounded-md text-sm border ${
                          selectedFilters[key as keyof FilterState].includes(value)
                            ? "bg-teal-600 text-white"
                            : "bg-white text-teal-600 border-teal-600 hover:bg-teal-100"
                        }`}
                        onClick={() => handleSelectSegmentation(key as keyof FilterState, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </motion.div>
                </div>
              );
            })}

            {/* Boutons Appliquer & Effacer */}
            <div className="flex justify-between items-center gap-3 p-3 m-2 border-t border-gray-200 w-full">
              <button
                onClick={handleClearSegmentationFilters}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-red-100 border border-red-500 transition"
              >
                <FaTimes />
                Effacer
              </button>
              <motion.button
                onClick={handleApplySegmentationFilters}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm shadow-sm transition border ${
                  isApplied
                    ? "bg-green-50 text-green-600 border-green-500 animate-pulse"
                    : "bg-blue-50 text-blue-600 border-blue-500 hover:bg-blue-100"
                }`}
              >
                <FaCheck />
                {isApplied ? "Filtres appliqués !" : "Appliquer"}
              </motion.button>
            </div>
          </>
        )}
    </div>
  );
};

export default SegmentationDisplay;
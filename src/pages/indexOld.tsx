// src/pages/index.tsx

import React from 'react';
import { useFilterContext } from '@/contexts/filtersContext'; // Importez le contexte des filtres
import { SalesFilters } from '@/types/Filter'; // Importez l'interface des filtres
import { FaTimes } from 'react-icons/fa'; // Pour l'icône de suppression
import SalesTable from './components/SalesTable';
import { usePharmaciesContext } from '@/contexts/pharmaciesContext';
import { useSalesContext } from '@/contexts/salesContext';
import TopCategoriesChart from './components/charts/TopCategoriesChart';
import TopUniversesChart from './components/charts/TopUniversesChart';
import TopLabDistributorsChart from './components/charts/TopLabDistributorsChart';
import TopProductsChart from './components/charts/TopProductsChart';
import TVADistributionChart from './components/charts/TVADistributionChart';
import SalesByPharmacyChart from './components/charts/SalesByPharmacyChart';
import DailySalesChart from './components/charts/DailySalesChart';
import PriceDistributionChart from './components/charts/PriceDistributionChart';
import NegativeMarginChart from './components/charts/NegativeMarginChart';
import StockoutUniversChart from './components/charts/StockoutUniversChart';

/**
 * Composant pour afficher les filtres actifs sous forme de badges.
 */
// src/pages/index.tsx

/**
 * Composant pour afficher les filtres actifs sous forme de badges.
 */
const ActiveFilters: React.FC = () => {
  const { filters, setFilters, handleClearAllFilters } = useFilterContext();
  const { pharmacies } = usePharmaciesContext();

  // Fonction pour supprimer un filtre spécifique
  const removeFilter = (key: keyof SalesFilters) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key];
    setFilters(updatedFilters);
  };

  // Fonction utilitaire pour capitaliser la première lettre d'une chaîne

  // Fonction pour obtenir le nom lisible d'un filtre
  const getFilterDisplayName = (key: keyof SalesFilters, value: string): string => {
    switch (key) {
      case 'pharmacy':
        return pharmacies.find((p) => p.id === value)?.name || value;
      case 'category':
      case 'subCategory':
      case 'labDistributor':
      case 'brandLab':
      case 'rangeName':
        return value; // Vous pouvez ajouter des mappings supplémentaires si nécessaire
      default:
        return value;
    }
  };

  // Liste des filtres actifs (clé et valeur)
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  if (activeFilters.length === 0) {
    return null; // Ne rien afficher si aucun filtre n'est actif
  }

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-700">Filtres Actifs :</h2>
      <div className="flex flex-wrap mt-2 gap-2">
        {activeFilters.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center bg-primary text-white text-sm font-medium px-3 py-1 rounded-full border border-primary-dark transition duration-200 hover:bg-primary-dark"
          >
            <span className="mr-2">
              {`${getFilterDisplayName(key as keyof SalesFilters, value as string)}`}
            </span>
            <button
              onClick={() => removeFilter(key as keyof SalesFilters)}
              className="text-white hover:text-gray-200 focus:outline-none transition duration-200"
              aria-label={`Remove filter ${key}`}
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={handleClearAllFilters}
          className="flex items-center bg-secondary text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-secondary-dark transition duration-200"
        >
          Effacer Tous les Filtres
        </button>
      </div>
    </div>
  );
};

/**
 * Page d'accueil de l'application.
 * 
 * Affiche un rappel des filtres actifs et la liste des ventes.
 * 
 * @returns Un élément JSX représentant la page d'accueil avec les filtres et les ventes.
 */
export default function Home() {

  const { groupedSales } = useSalesContext();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800">Bienvenue sur Apo Data</h1>
      <p className="text-gray-600 mt-2">Votre solution d analyse pour les pharmacies.</p>
      
      {/* Affichage des filtres actifs */}
      <ActiveFilters />

      {/* Tableau des ventes */}
      <SalesTable groupedSales={groupedSales}/>

      <TopUniversesChart groupedSales={groupedSales} />

      <TopCategoriesChart groupedSales={groupedSales} />

      <TopLabDistributorsChart groupedSales={groupedSales} />

      <TopProductsChart groupedSales={groupedSales} />

      <TVADistributionChart groupedSales={groupedSales} />

      <SalesByPharmacyChart />

      <DailySalesChart />

      <PriceDistributionChart />

      <NegativeMarginChart />

      <StockoutUniversChart/>

      {/* <StockEvolutionChart /> */}
    </div>
  );
}

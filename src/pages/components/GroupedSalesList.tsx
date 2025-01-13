// src/components/GroupedSalesList.tsx

import React from 'react';
import { useSalesContext } from '@/contexts/salesContext';

/**
 * Composant pour afficher la liste des ventes groupées par code_13_ref avec agrégations.
 * 
 * Récupère les ventes groupées depuis le contexte et les affiche dans une table.
 * Fournit des contrôles de pagination et de tri pour naviguer et trier les données.
 * 
 * @returns Un élément JSX affichant les ventes groupées, les contrôles de pagination et de tri.
 */
const GroupedSalesList: React.FC = () => {
  const { groupedSales, loadingGroupedSales, errorGroupedSales, page, totalPages, setPage, sortBy, setSortBy, sortOrder, setSortOrder } = useSalesContext();

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Inverser l'ordre si le même champ est cliqué
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Réinitialiser à la première page lors du tri
  };

  if (loadingGroupedSales) return <p>Chargement des ventes groupées...</p>;
  if (errorGroupedSales) return <p>{errorGroupedSales}</p>;

  const getSortIndicator = (field: string) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div>
      <table className="min-w-full bg-white mb-4">
        <thead>
          <tr>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('code_13_ref')}>
              Code 13 Ref {getSortIndicator('code_13_ref')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('universe')}>
              Univers {getSortIndicator('universe')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('category')}>
              Catégorie {getSortIndicator('category')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('sub_category')}>
              Sous-Catégorie {getSortIndicator('sub_category')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('brand_lab')}>
              Marque Lab {getSortIndicator('brand_lab')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('lab_distributor')}>
              Distributeur Lab {getSortIndicator('lab_distributor')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('range_name')}>
              Gamme {getSortIndicator('range_name')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('family')}>
              Famille {getSortIndicator('family')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('sub_family')}>
              Sous-Famille {getSortIndicator('sub_family')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('specificity')}>
              Spécificité {getSortIndicator('specificity')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('name')}>
              Nom Produit {getSortIndicator('name')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('total_quantity')}>
              Quantité Totale {getSortIndicator('total_quantity')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('avg_price_with_tax')}>
              Prix TTC Moyenne {getSortIndicator('avg_price_with_tax')}
            </th>
            <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('avg_weighted_average_price')}>
              Prix Moyen Pondéré {getSortIndicator('avg_weighted_average_price')}
            </th>
          </tr>
        </thead>
        <tbody>
          {groupedSales.map((sale, index) => (
            <tr key={`${sale.code_13_ref}-${index}`}>
              <td className="py-2 px-4 border">{sale.code_13_ref}</td>
              <td className="py-2 px-4 border">{sale.universe}</td>
              <td className="py-2 px-4 border">{sale.category}</td>
              <td className="py-2 px-4 border">{sale.sub_category}</td>
              <td className="py-2 px-4 border">{sale.brand_lab}</td>
              <td className="py-2 px-4 border">{sale.lab_distributor}</td>
              <td className="py-2 px-4 border">{sale.range_name}</td>
              <td className="py-2 px-4 border">{sale.family}</td>
              <td className="py-2 px-4 border">{sale.sub_family}</td>
              <td className="py-2 px-4 border">{sale.specificity}</td>
              <td className="py-2 px-4 border">{sale.name}</td>
              <td className="py-2 px-4 border">{sale.total_quantity}</td>
              <td className="py-2 px-4 border">{sale.avg_price_with_tax}</td>
              <td className="py-2 px-4 border">{sale.avg_weighted_average_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={page <= 1}
          className="btn btn-secondary"
        >
          Précédent
        </button>
        <span>
          Page {page} sur {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          className="btn btn-secondary"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default GroupedSalesList;

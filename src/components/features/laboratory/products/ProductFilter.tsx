import ActionButton from '@/components/common/buttons/ActionButton';
import FilterButton from '@/components/common/buttons/FilterButton';
import PercentageControl from '@/components/common/inputs/PercentageControl';
import { ProductFilterProps } from '@/types/types';
import React, { useState } from 'react';
import { FaChartPie, FaSort, FaFilter } from 'react-icons/fa';


/**
 * Composant de filtres pour le tableau des produits
 */
const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  currentFilters,
  categories = [],
  suppliers = [],
  stockOptions = [
    { label: 'Tous les produits', value: 'all' },
    { label: 'En stock uniquement', value: 'inStock' },
    { label: 'Rupture de stock', value: 'outOfStock' }
  ]
}) => {
  // États locaux
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showSupplierFilter, setShowSupplierFilter] = useState(false);
  const [minMarginPercent, setMinMarginPercent] = useState(currentFilters.minMarginPercent || 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories || []);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(currentFilters.suppliers || []);
  const [stockStatus, setStockStatus] = useState(currentFilters.stockStatus || 'all');

  // Application des filtres
  const applyFilters = () => {
    onFilterChange({
      ...currentFilters,
      categories: selectedCategories,
      suppliers: selectedSuppliers,
      stockStatus,
      minMarginPercent
    });
  };

  // Gestion des catégories
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Gestion des fournisseurs
  const toggleSupplier = (supplier: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplier) 
        ? prev.filter(s => s !== supplier) 
        : [...prev, supplier]
    );
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedSuppliers([]);
    setStockStatus('all');
    setMinMarginPercent(0);
    onFilterChange({
      ...currentFilters,
      categories: [],
      suppliers: [],
      stockStatus: 'all',
      minMarginPercent: 0
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          {/* Filtre par catégorie */}
          <div className="relative">
            <FilterButton
              icon={<FaChartPie />}
              label="Catégories"
              count={selectedCategories.length}
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            />
            
            {showCategoryFilter && (
              <div className="absolute z-10 mt-2 bg-white rounded-md shadow-lg p-3 w-56">
                <h4 className="font-medium text-gray-700 mb-2">Catégories</h4>
                <div className="max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category}`} className="text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <button
                    onClick={() => {
                      applyFilters();
                      setShowCategoryFilter(false);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtre par fournisseur */}
          <div className="relative">
            <FilterButton
              icon={<FaSort />}
              label="Fournisseurs"
              count={selectedSuppliers.length}
              onClick={() => setShowSupplierFilter(!showSupplierFilter)}
            />
            
            {showSupplierFilter && (
              <div className="absolute z-10 mt-2 bg-white rounded-md shadow-lg p-3 w-56">
                <h4 className="font-medium text-gray-700 mb-2">Fournisseurs</h4>
                <div className="max-h-60 overflow-y-auto">
                  {suppliers.map(supplier => (
                    <div key={supplier} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`supplier-${supplier}`}
                        checked={selectedSuppliers.includes(supplier)}
                        onChange={() => toggleSupplier(supplier)}
                        className="mr-2"
                      />
                      <label htmlFor={`supplier-${supplier}`} className="text-sm text-gray-700">
                        {supplier}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <button
                    onClick={() => {
                      applyFilters();
                      setShowSupplierFilter(false);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtre par état du stock */}
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              onFilterChange({
                ...currentFilters,
                stockStatus: e.target.value
              });
            }}
            className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-100 transition text-gray-700 text-sm"
          >
            {stockOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Filtre de marge minimale */}
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-700 font-medium">Marge min:</span>
            <PercentageControl
              value={minMarginPercent}
              onChange={(value) => {
                setMinMarginPercent(value);
                onFilterChange({
                  ...currentFilters,
                  minMarginPercent: value
                });
              }}
              min={-100}
              max={100}
              accentColor="text-blue-600"
            />
          </div>
        </div>

        {/* Bouton de réinitialisation */}
        <ActionButton
          onClick={resetFilters}
          icon={<FaFilter />}
          variant="secondary"
        >
          Réinitialiser les filtres
        </ActionButton>
      </div>
    </div>
  );
};

export default ProductFilter;
// src/pages/sell-out.tsx

import React from "react";
import { FaGlobe, FaPills, FaSoap } from "react-icons/fa";

import { useFilterContext } from "@/contexts/global/filtersContext";
import { useFinancialContext } from "@/contexts/global/FinancialContext";
import { useStockContext } from "@/contexts/global/StockContext";
import { useSalesByMonthContext } from "@/contexts/sell-out/SalesByMonthContext";
import { useSalesByUniverseContext } from "@/contexts/sell-out/SalesByUniverseContext";
import { useSalesByCategoryContext } from "@/contexts/sell-out/SalesByCategoryContext";
import { useSalesByLabDistributorsContext } from "@/contexts/sell-out/SalesByLabDistributorsContext";
import { useTopProductsContext } from "@/contexts/sell-out/TopProductsContext";
import { useGrowthProductsContext } from "@/contexts/sell-out/GrowthProductsContext";
import { useRegressionProductsContext } from "@/contexts/sell-out/RegressionProductsContext";
import { useBestLabsGrowthContext } from "@/contexts/sell-out/BestLabsGrowthContext";
import { useWorstLabsRegressionContext } from "@/contexts/sell-out/WorstLabsRegressionContext";
import { useBestCategoriesGrowthContext } from "@/contexts/sell-out/BestCategoriesGrowthContext";
import { useWorstCategoriesRegressionContext } from "@/contexts/sell-out/WorstCategoriesRegressionContext";
import { useBestUniversesGrowthContext } from "@/contexts/sell-out/BestUniversesGrowthContext";
import { useWorstUniversesRegressionContext } from "@/contexts/sell-out/WorstUniversesRegressionContext";
import { usePeakSalesContext } from "@/contexts/sell-out/PeakSalesContext";

// Import de vos composants
import StatsCards from "@/components/global/StatsCards";
import SalesByMonthChart from "@/components/sell-out/global/SalesByMonthChart";
import SalesByUniverseChart from "@/components/sell-out/univers/SalesByUniverseChart";
import SalesByCategoryChart from "@/components/sell-out/categories/SalesByCategoryChart";
import SalesByLabDistributorsChart from "@/components/sell-out/labs/SalesByLabDistributorsChart";
import TopCategoriesList from "@/components/sell-out/categories/TopCategoriesList";
import TopLabDistributorsList from "@/components/sell-out/labs/TopLabDistributorsList";
import TopProductsList from "@/components/sell-out/products/topProductsDisplay";
import FlopCategoriesList from "@/components/sell-out/categories/FlopCategoriesList";
import FlopLabDistributorsList from "@/components/sell-out/labs/FlopLabDistributorsList";
import FlopProductsList from "@/components/sell-out/products/flopProductsDisplay";
import LowSalesProductsChart from "@/components/sell-out/products/LowSalesProductsChart";
import PeakSalesBubbleChart from "@/components/sell-out/products/PeakSalesHeatmap";
import GrowingUniversesList from "@/components/sell-out/univers/GrowingUniversesList";
import DecreasingUniversesList from "@/components/sell-out/univers/DecreasingUniversesList";
import GrowingCategoriesList from "@/components/sell-out/categories/GrowingCategoriesList";
import DecreasingCategoriesList from "@/components/sell-out/categories/DecreasingCategoriesList";
import GrowingLabsList from "@/components/sell-out/labs/GrowingLabsList";
import DecreasingLabsList from "@/components/sell-out/labs/DecreasingLabsList";
import GrowingProductsList from "@/components/sell-out/products/GrowingProductsList";
import DecreasingProductsList from "@/components/sell-out/products/DecreasingProductsList";

import Tabs from "@/components/ui/Tabs";
import SalesByPharmacyChart from "@/components/sell-out/pharmacies/SalesByPharmacyChart";
import { useSalesByPharmacyContext } from "@/contexts/sell-out/SalesByPharmacyContext";

// Import du nouveau composant et du provider
import NegativeMarginSalesList from "@/components/sell-out/products/NegativeMarginSalesList";
import { SellOutProviders } from "@/contexts/SellOutProviders";
import PurchasesByMonthChart from "@/components/sell-in/global/PurchasesByMonthChart";
import PurchasesByUniverseChart from "@/components/sell-in/universes/PurchasesByUniverseChart";
import PurchasesByCategoryChart from "@/components/sell-in/categories/PurchasesByCategoryChart";
import PurchasesByLabDistributorsChart from "@/components/sell-in/labs/PurchasesByLabDistributorsChart";
import PurchasesByPharmacyChart from "@/components/sell-in/pharmacies/PurchasesByPharmacyChart";

const Dashboard: React.FC = () => {
  // -- Récupération des filtres & data context
  const { filters, setFilters } = useFilterContext();

  const {
    totalRevenue,
    totalPurchase,
    totalMargin,
    totalQuantity,
    averageSellingPrice,
    averagePurchasePrice,
    marginPercentage,
    loading: financialLoading,
    error: financialError,
  } = useFinancialContext();

  const {
    stockValue,
    soldReferencesCount,
    loading: stockLoading,
    error: stockError,
  } = useStockContext();

  // -- Vérification d'erreurs globales
  if (
    financialError ||
    stockError
  ) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">
          Erreur :{" "}
          {financialError ||
            stockError }
        </p>
      </div>
    );
  }

  // -- Handler pour les filtres par catégorie
  const handleButtonClick = (cat: "global" | "medicaments" | "parapharmacie") => {
    setFilters({ ...filters, selectedCategory: cat });
  };

  // -- Section "Filtres + Stats" (qu'on veut afficher dans le 1er onglet)
  const renderGlobalSection = () => (
    <div>
      {/* Filtres par catégorie */}
      <div className="flex justify-center gap-4 mb-8">
        {/* Boutons */}
        <button
          className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-md transition flex-1 ${
            filters.selectedCategory === "global"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-lg"
          }`}
          onClick={() => handleButtonClick("global")}
        >
          <FaGlobe
            className={`h-6 w-6 ${
              filters.selectedCategory === "global" ? "text-white" : "text-blue-500"
            }`}
          />
          <span className="font-bold text-lg">Global</span>
        </button>

        <button
          className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-md transition flex-1 ${
            filters.selectedCategory === "medicaments"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-lg"
          }`}
          onClick={() => handleButtonClick("medicaments")}
        >
          <FaPills
            className={`h-6 w-6 ${
              filters.selectedCategory === "medicaments" ? "text-white" : "text-green-500"
            }`}
          />
          <span className="font-bold text-lg">Médicaments</span>
        </button>

        <button
          className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-md transition flex-1 ${
            filters.selectedCategory === "parapharmacie"
              ? "bg-purple-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-lg"
          }`}
          onClick={() => handleButtonClick("parapharmacie")}
        >
          <FaSoap
            className={`h-6 w-6 ${
              filters.selectedCategory === "parapharmacie" ? "text-white" : "text-purple-500"
            }`}
          />
          <span className="font-bold text-lg">Parapharmacie</span>
        </button>
      </div>

      {/* Statistiques globales */}
      <StatsCards
        totalCA={totalRevenue}
        totalPurchase={totalPurchase}
        totalMargin={totalMargin}
        totalQuantity={totalQuantity}
        averageSellingPrice={averageSellingPrice}
        averagePurchasePrice={averagePurchasePrice}
        marginPercentage={marginPercentage}
        stockValue={stockValue}
        soldReferencesCount={soldReferencesCount}
        financialLoading={financialLoading}
        stockLoading={stockLoading}
      />
    </div>
  );

  // -- Section "Graphiques"
  const renderSalesSection = () => (
    <div>
      <div className="mt-8 flex flex-row gap-4 h-[550px]">
        <div className="w-full lg:w-8/12 flex flex-col h-full">
          <PurchasesByMonthChart/>
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <PurchasesByUniverseChart />
        </div>
      </div>

      <div className="mt-8 flex flex-row gap-4 h-[550px]">
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <PurchasesByCategoryChart />
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <PurchasesByLabDistributorsChart/>
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <PurchasesByPharmacyChart/>
        </div>
      </div>
    </div>
  );

  // -- Tabs configuration
  const tabItems = [
    {
      label: "Global Stats",
      content: renderGlobalSection(),
    },
    {
      label: "Achats",
      content: renderSalesSection(),
    },
    {
      label: "Tops & Flops",
      content: renderSalesSection(),
    },
    {
      label: "Prix",
      content: renderSalesSection(),
    },
    {
      label: "Livraison",
      content: renderSalesSection(),
    },
    {
      label: "Details",
      content: renderSalesSection(),
    }
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Envelopper les contextes nécessaires */}
            {/* Ajoutez d'autres providers si vous avez plus de graphiques d'anomalies */}
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord - Sell-In</h1>
              <Tabs tabs={tabItems} defaultIndex={0} />            
    </div>
  );
};

export default Dashboard;
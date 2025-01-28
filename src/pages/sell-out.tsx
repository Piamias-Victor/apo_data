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
import { NegativeMarginSalesProvider } from "@/contexts/sell-out/NegativeMarginSalesContext";
import { PharmaciesProvider } from "@/contexts/segmentation/pharmaciesContext";
import { SalesByPharmacyProvider } from "@/contexts/sell-out/SalesByPharmacyContext";
import NegativeMarginSalesList from "@/components/sell-out/products/NegativeMarginSalesList";
import PriceAnomaliesList from "@/components/sell-out/products/PriceAnomaliesList";

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

  const {
    months,
    quantities,
    revenues,
    margins,
    loading: salesLoading,
    error: salesError,
  } = useSalesByMonthContext();

  const {
    universes,
    loading: universeLoading,
    error: universeError,
  } = useSalesByUniverseContext();

  const {
    categories,
    loading: categoryLoading,
    error: categoryError,
  } = useSalesByCategoryContext();

  const {
    labDistributors,
    loading: labDistributorLoading,
    error: labDistributorError,
  } = useSalesByLabDistributorsContext();

  const {
    topProducts,
    flopProducts,
    loading: topProductsLoading,
    error: topProductsError,
  } = useTopProductsContext();

  const {
    growthProducts,
    loading: growthLoading,
  } = useGrowthProductsContext();

  const {
    regressionProducts,
    loading: regressionLoading,
  } = useRegressionProductsContext();

  const {
    labs: growthLabs,
    loading: growthLabsLoading,
  } = useBestLabsGrowthContext();

  const {
    labs: regressionLabs,
    loading: regressionLabsLoading,
  } = useWorstLabsRegressionContext();

  const {
    categories: growthCategories,
    loading: growthCategoriesLoading,
  } = useBestCategoriesGrowthContext();

  const {
    categories: regressionCategories,
    loading: regressionCategoriesLoading,
  } = useWorstCategoriesRegressionContext();

  const {
    universes: growthUniverses,
    loading: growthUniversesLoading,
  } = useBestUniversesGrowthContext();

  const {
    universes: regressionUniverses,
    loading: regressionUniversesLoading,
  } = useWorstUniversesRegressionContext();

  const { pharmacies, 
    loading: pharmacyLoading,
    error: pharmacyError, } = useSalesByPharmacyContext();

  const { peakSales, loading: peakLoading } = usePeakSalesContext();

  // -- Vérification d'erreurs globales
  if (
    financialError ||
    stockError ||
    salesError ||
    universeError ||
    categoryError ||
    labDistributorError ||
    topProductsError ||
    pharmacyError // Ajout de l'erreur de pharmacie
  ) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">
          Erreur :{" "}
          {financialError ||
            stockError ||
            salesError ||
            universeError ||
            categoryError ||
            labDistributorError ||
            topProductsError ||
            pharmacyError}
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
          <SalesByMonthChart
            months={months}
            quantities={quantities}
            revenues={revenues}
            margins={margins}
            loading={salesLoading}
          />
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <SalesByUniverseChart universes={universes} loading={universeLoading} />
        </div>
      </div>

      <div className="mt-8 flex flex-row gap-4 h-[550px]">
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <SalesByCategoryChart categories={categories} loading={categoryLoading} />
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <SalesByLabDistributorsChart
            labDistributors={labDistributors}
            loading={labDistributorLoading}
          />
        </div>
        <div className="w-full lg:w-4/12 flex flex-col h-full">
          <SalesByPharmacyChart
            pharmacies={pharmacies}
            loading={pharmacyLoading}
          />
        </div>
      </div>
    </div>
  );

  // -- Section "Tops & Flops"
  const renderTopFlopSection = () => (
    <div>
      {/* Tops */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <TopCategoriesList categories={categories} loading={categoryLoading} />
          </div>
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <TopLabDistributorsList distributors={labDistributors} loading={labDistributorLoading} />
          </div>
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <TopProductsList products={topProducts} loading={topProductsLoading} />
          </div>
        </div>
      </div>

      {/* Flops */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <FlopCategoriesList categories={categories} loading={categoryLoading} />
          </div>
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <FlopLabDistributorsList distributors={labDistributors} loading={labDistributorLoading} />
          </div>
          <div className="w-full lg:w-4/12 flex flex-col h-[450px]">
            <FlopProductsList products={flopProducts} loading={topProductsLoading} />
          </div>
        </div>
      </div>
    </div>
  );

  // -- Section "Croissance & Régression"
  const renderGrowthRegressionSection = () => (
    <div>
      {/* Univers */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-6/12 h-[450px]">
            <GrowingUniversesList
              loading={growthUniversesLoading}
              universes={growthUniverses.map((u) => ({
                universe: u.universe,
                previousQuantity: u.previousQuantity,
                currentQuantity: u.currentQuantity,
                growthRate: u.growthRate,
                totalRevenue: u.totalRevenue,
              }))}
            />
          </div>
          <div className="w-full lg:w-6/12 h-[450px]">
            <DecreasingUniversesList
              universes={regressionUniverses.map((u) => ({
                universe: u.universe,
                previousQuantity: u.previousQuantity,
                currentQuantity: u.currentQuantity,
                regressionRate: u.regressionRate,
                totalRevenue: u.totalRevenue,
              }))}
              loading={regressionUniversesLoading}
            />
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-6/12 h-[450px]">
            <GrowingCategoriesList
              categories={growthCategories.map((cat) => ({
                category: cat.category,
                previousQuantity: cat.previousQuantity,
                currentQuantity: cat.currentQuantity,
                growthRate: cat.growthRate,
                totalRevenue: cat.totalRevenue,
              }))}
              loading={growthCategoriesLoading}
            />
          </div>
          <div className="w-full lg:w-6/12 h-[450px]">
            <DecreasingCategoriesList
              categories={regressionCategories.map((cat) => ({
                category: cat.category,
                previousQuantity: cat.previousQuantity,
                currentQuantity: cat.currentQuantity,
                regressionRate: cat.regressionRate,
                totalRevenue: cat.totalRevenue,
              }))}
              loading={regressionCategoriesLoading}
            />
          </div>
        </div>
      </div>

      {/* Labs */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-6/12 h-[450px]">
            <GrowingLabsList
              labs={growthLabs.map((lab) => ({
                lab: lab.lab,
                previousQuantity: lab.previousQuantity,
                currentQuantity: lab.currentQuantity,
                growthRate: lab.growthRate,
                totalRevenue: lab.totalRevenue,
              }))}
              loading={growthLabsLoading}
            />
          </div>
          <div className="w-full lg:w-6/12 h-[450px]">
            <DecreasingLabsList
              labs={regressionLabs.map((lab) => ({
                lab: lab.lab,
                previousQuantity: lab.previousQuantity,
                currentQuantity: lab.currentQuantity,
                regressionRate: lab.regressionRate,
                totalRevenue: lab.totalRevenue,
              }))}
              loading={regressionLabsLoading}
            />
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="mt-12">
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-6/12 h-[450px]">
            <GrowingProductsList
              products={growthProducts.map((p) => ({
                name: p.product,
                code: p.code,
                previousQuantity: p.previousQuantity,
                currentQuantity: p.currentQuantity,
                growthRate: p.growthRate,
              }))}
              loading={growthLoading}
            />
          </div>
          <div className="w-full lg:w-6/12 h-[450px]">
            <DecreasingProductsList
              products={regressionProducts.map((p) => ({
                name: p.product,
                code: p.code,
                previousQuantity: p.previousQuantity,
                currentQuantity: p.currentQuantity,
                growthRate: p.regressionRate,
              }))}
              loading={regressionLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // -- Section "Anomalies"
  const renderAnomaliesSection = () => (
    <>
    <div className="mt-12 grid grid-cols-1 gap-8">
      {/* Graphique des Produits avec Marges Négatives */}
      <NegativeMarginSalesList />
      {/* Vous pouvez ajouter d'autres graphiques d'anomalies ici */}
      {/* Exemple : */}
      {/* <SalesSuddenDropChart /> */}
      {/* <ReturnRateAnomaliesChart /> */}
      {/* <DiscountRateAnomaliesChart /> */}
    </div>
    <div className="mt-12 grid grid-cols-1 gap-8">
      {/* Graphique des Produits avec Marges Négatives */}
      <PriceAnomaliesList />
      {/* Vous pouvez ajouter d'autres graphiques d'anomalies ici */}
      {/* Exemple : */}
      {/* <SalesSuddenDropChart /> */}
      {/* <ReturnRateAnomaliesChart /> */}
      {/* <DiscountRateAnomaliesChart /> */}
    </div>
    </>
    
  );

  // -- Section "Autres" (LowSales, PeakSales)
  const renderOthersSection = () => (
    <>
      <div className="mt-12">
        <PeakSalesBubbleChart data={peakSales} />
      </div>
      <div className="mt-12">
        <LowSalesProductsChart />
      </div>
    </>
  );

  // -- Tabs configuration
  const tabItems = [
    {
      label: "Global Stats",
      content: renderGlobalSection(),
    },
    {
      label: "Ventes",
      content: renderSalesSection(),
    },
    {
      label: "Tops & Flops",
      content: renderTopFlopSection(),
    },
    {
      label: "Croissance/Régression",
      content: renderGrowthRegressionSection(),
    },
    {
      label: "Anomalies",
      content: renderAnomaliesSection(), // Mise à jour ici
    },
    {
      label: "Details",
      content: renderOthersSection(),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Envelopper les contextes nécessaires */}
            {/* Ajoutez d'autres providers si vous avez plus de graphiques d'anomalies */}
            <Tabs tabs={tabItems} defaultIndex={0} />
    </div>
  );
};

export default Dashboard;
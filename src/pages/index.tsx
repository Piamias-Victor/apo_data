import React from "react";
import { useFilterContext } from "@/contexts/filtersContext";
import { useFinancialContext } from "@/contexts/FinancialContext";
import { useSalesByMonthContext } from "@/contexts/SalesByMonthContext";
import { useSalesByUniverseContext } from "@/contexts/SalesByUniverseContext";
import { useSalesByCategoryContext } from "@/contexts/SalesByCategoryContext";
import { useSalesByLabDistributorsContext } from "@/contexts/SalesByLabDistributorsContext";
import { useTopProductsContext } from "@/contexts/TopProductsContext"; // Import du contexte TopProducts
import { useStockContext } from "@/contexts/StockContext";
import { FaGlobe, FaPills, FaSoap } from "react-icons/fa";
import SalesByMonthChart from "./components/SalesByMonthChart";
import SalesByUniverseChart from "./components/SalesByUniverseChart";
import SalesByCategoryChart from "./components/SalesByCategoryChart";
import SalesByLabDistributorsChart from "./components/SalesByLabDistributorsChart";
import StatsCards from "./components/StatsCards";
import TopProductsChart from "./components/topProductsDisplay";

const Dashboard = () => {
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
    products: topProducts,
    loading: topProductsLoading,
    error: topProductsError,
  } = useTopProductsContext(); // Utilisation du contexte TopProducts

  const { filters, setFilters } = useFilterContext();

  const handleButtonClick = (category: "global" | "medicaments" | "parapharmacie") => {
    setFilters({ ...filters, selectedCategory: category });
  };

  if (
    financialError ||
    stockError ||
    salesError ||
    universeError ||
    categoryError ||
    labDistributorError ||
    topProductsError
  ) {
    return (
      <p className="text-red-500">
        Erreur :{" "}
        {financialError ||
          stockError ||
          salesError ||
          universeError ||
          categoryError ||
          labDistributorError ||
          topProductsError}
      </p>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Filtres par catégorie */}
      <div className="flex justify-center gap-4 mb-8">
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

      {/* Statistiques */}
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
        loading={financialLoading || stockLoading}
      />

      {/* Première ligne de graphiques */}
      <div className="mt-8 flex flex-row gap-4 h-[550px]">
        <div className="w-full lg:w-6/12 flex flex-col h-full">
          <SalesByMonthChart
            months={months}
            quantities={quantities}
            revenues={revenues}
            margins={margins}
            loading={salesLoading}
          />
        </div>
        <div className="w-full lg:w-6/12 flex flex-col h-full">
          <SalesByUniverseChart universes={universes} loading={universeLoading} />
        </div>
      </div>

      {/* Deuxième ligne avec trois graphiques */}
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
          <TopProductsChart products={topProducts} loading={topProductsLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

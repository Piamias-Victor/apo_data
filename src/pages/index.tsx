import React from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { useFinancialContext } from "@/contexts/global/FinancialContext";
import { useSalesByMonthContext } from "@/contexts/sell-out/SalesByMonthContext";
import { useSalesByUniverseContext } from "@/contexts/sell-out/SalesByUniverseContext";
import { useSalesByCategoryContext } from "@/contexts/sell-out/SalesByCategoryContext";
import { useSalesByLabDistributorsContext } from "@/contexts/sell-out/SalesByLabDistributorsContext";
import { useTopProductsContext } from "@/contexts/sell-out/TopProductsContext";
import { useStockContext } from "@/contexts/global/StockContext";
import { FaGlobe, FaPills, FaSoap } from "react-icons/fa";
import SalesByMonthChart from "../components/sell-out/global/SalesByMonthChart";
import SalesByUniverseChart from "../components/sell-out/univers/SalesByUniverseChart";
import SalesByCategoryChart from "../components/sell-out/categories/SalesByCategoryChart";
import SalesByLabDistributorsChart from "../components/sell-out/labs/SalesByLabDistributorsChart";
import StatsCards from "../components/global/StatsCards";
import TopProductsList from "../components/sell-out/products/topProductsDisplay";

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
      topProducts,
      loading: topProductsLoading,
      error: topProductsError,
    } = useTopProductsContext();

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
        financialLoading={financialLoading}
        stockLoading={stockLoading}
      />

      {/* Graphiques */}
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
          <TopProductsList products={topProducts} loading={topProductsLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
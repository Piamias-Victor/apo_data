import React from "react";
import StatsCards from "./components/StatsCards";
import { useFinancialContext } from "@/contexts/FinancialContext";

const Dashboard = () => {
  const { totalRevenue, totalPurchase, totalMargin, totalQuantity, averageSellingPrice, averagePurchasePrice, marginPercentage, loading, error } = useFinancialContext();

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erreur : {error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tableau de bord</h1>
      <StatsCards
        totalCA={totalRevenue}
        totalPurchase={totalPurchase}
        totalMargin={totalMargin}
        totalQuantity={totalQuantity}
        averageSellingPrice={averageSellingPrice}
        averagePurchasePrice={averagePurchasePrice}
        marginPercentage={marginPercentage}
      />
    </div>
  );
};

export default Dashboard;

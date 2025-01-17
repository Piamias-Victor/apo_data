import React from "react";
import { useRevenueContext } from "@/contexts/FinancialContext";
import StatsCards from "./components/StatsCards";

const Dashboard = () => {
  const { totalRevenue, loading, error } = useRevenueContext();

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erreur : {error}</p>;
  }

  // Pour cet exemple, on met des valeurs fictives pour les autres métriques
  const totalPurchase = 500000; // À remplacer par une vraie valeur ou contexte
  const totalMargin = 100000; // À remplacer par une vraie valeur ou contexte

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tableau de bord</h1>
      <StatsCards
        totalCA={totalRevenue || 0}
        totalPurchase={totalPurchase}
        totalMargin={totalMargin}
      />
    </div>
  );
};

export default Dashboard;

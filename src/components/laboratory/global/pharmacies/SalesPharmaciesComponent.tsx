// SalesPharmaciesComponent.tsx
import React from "react";
import Loader from "@/components/ui/Loader";
import SalesDataByPharmacy from "./SalesDataByPharmacy";
import { usePharmacySalesData } from "@/hooks/usePharmacySalesData";
import TopPharmaciesCard from "./SalesSummaryCard";

const SalesPharmaciesComponent: React.FC = () => {
  // Récupération des données de ventes par pharmacie
  const { 
    salesData, 
    loading, 
    error, 
    hasSelectedData,
    topPharmacies 
  } = usePharmacySalesData();

  // Afficher différents états selon les données
  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!salesData || salesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      {/* Affichage des meilleures pharmacies */}
      <TopPharmaciesCard 
        topRevenue={topPharmacies.topRevenue}
        topMargin={topPharmacies.topMargin}
        topGrowth={topPharmacies.topGrowth}
        loading={loading}
        error={error}
      />

      {/* Tableau détaillé des ventes par pharmacie */}
      <SalesDataByPharmacy 
        salesData={salesData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default SalesPharmaciesComponent;
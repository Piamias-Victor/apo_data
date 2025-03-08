import Loader from "@/components/ui/Loader";
import { useProductsData } from "@/hooks/useProductsData";
import ProductTable from "./ProductTable";
import TopProductsCard from "./TopProductsCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Separator from "@/components/ui/Separator";
import SalesPharmaciesComponent from "../global/pharmacies/SalesPharmaciesComponent";


const ProductsDashboard: React.FC = () => {
  const { products, loading, error, topProducts } = useProductsData();

  // Animations réutilisables
  const titleAnimation = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  if (loading) return <Loader text="Chargement des données produits..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!products || products.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      {/* Titre principal */}
      <SectionTitle 
        title="Performances des Produits"
        description="Analyse des ventes, marges et évolutions des produits 📈"
        emoji="📊"
        color="text-teal-600"
      />

      {/* Top Produits */}
      <TopProductsCard 
        topRevenue={topProducts.topRevenue}
        topMargin={topProducts.topMargin}
        topGrowth={topProducts.topGrowth}
      />

      {/* Séparateur */}
      <Separator from="indigo-400" via="blue-400" to="teal-400" />

      {/* Titre secondaire */}
      <SectionTitle 
        title="Détail des Ventes Produits"
        description="Vue détaillée des performances par produit 📊"
        emoji="📋"
        color="text-blue-600"
        emojiColor="text-green-500"
      />

      {/* Tableau des produits */}
      <ProductTable products={products} />

      <SalesPharmaciesComponent/>
    </div>
  );
};

export default ProductsDashboard;
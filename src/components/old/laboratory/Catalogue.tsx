import { useEffect, useState } from "react";

interface Product {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  avg_price_with_tax: number | null;
  avg_weighted_price: number | null;
  min_price_with_tax: number | null;
  max_price_with_tax: number | null;
  total_sales_quantity: number | null;
  total_revenue: number | null;
  total_purchase_amount: number | null;
  total_margin: number | null;
}

const CatalogProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/segmentation/getCatalogue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filters: {
              distributors: [],
              ranges: [],
              universes: [],
              categories: [],
              subCategories: [],
              brands: [],
              families: [],
              subFamilies: [],
              specificities: [],
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur inconnue");
        }

        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Liste des Produits</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Code 13</th>
              <th className="border p-2">Nom</th>
              <th className="border p-2">TVA (%)</th>
              <th className="border p-2">Prix Moyen TTC</th>
              <th className="border p-2">Prix Min - Max</th>
              <th className="border p-2">Quantité Vendue</th>
              <th className="border p-2">CA Total</th>
              <th className="border p-2">Montant Achat</th>
              <th className="border p-2">Marge Totale</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.code_13_ref} className="text-center">
                <td className="border p-2">{product.code_13_ref}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.tva_percentage}%</td>
                <td className="border p-2">{product.avg_price_with_tax ?? "N/A"} €</td>
                <td className="border p-2">
                  {product.min_price_with_tax ?? "N/A"} - {product.max_price_with_tax ?? "N/A"} €
                </td>
                <td className="border p-2">{product.total_sales_quantity ?? 0}</td>
                <td className="border p-2 font-bold">{product.total_revenue ?? 0} €</td>
                <td className="border p-2 font-bold">{product.total_purchase_amount ?? 0} €</td>
                <td
                  className={`border p-2 font-bold ${
                    product.total_margin && product.total_margin > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.total_margin ?? 0} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CatalogProducts;
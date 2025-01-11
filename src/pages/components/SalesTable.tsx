// /components/SalesTable.tsx
import React from "react";
import { useSalesContext } from "@/contexts/salesContext";

const SalesTable: React.FC = () => {
  const { groupedSales, total, loading, error } = useSalesContext();

  if (loading) return <p>Chargement des ventes...</p>;
  if (error) return <p>Erreur: {error}</p>;

  // 1) Convertir / s'assurer que ce sont des nombres
  //    (Si déjà number, pas besoin de parseFloat)
  const salesData = groupedSales.map(sale => ({
    ...sale,
    total_quantity: Number(sale.total_quantity),
    avg_price_with_tax: Number(sale.avg_price_with_tax),
    avg_weighted_average_price: Number(sale.avg_weighted_average_price),
  }));

  // 2) Calculer les agrégats
  const nbProducts = salesData.length;

  // Somme des quantités
  const sumQuantity = salesData.reduce(
    (acc, sale) => acc + sale.total_quantity,
    0
  );

  // Moyenne des avg_price_with_tax
  const meanAvgPriceWithTax =
    nbProducts > 0
      ? salesData.reduce((acc, sale) => acc + sale.avg_price_with_tax, 0) /
        nbProducts
      : 0;

  // Moyenne des avg_weighted_average_price
  const meanWeightedAvgPrice =
    nbProducts > 0
      ? salesData.reduce(
          (acc, sale) => acc + sale.avg_weighted_average_price,
          0
        ) / nbProducts
      : 0;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Ventes du dernier mois</h2>
      <p>Total groupements: {total}</p>

      <div className="max-h-96 overflow-y-auto mt-2 border border-gray-300">
        <table className="table-auto w-full">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1">Code 13</th>
              <th className="px-2 py-1">Nom</th>
              <th className="px-2 py-1 text-right">Qté totale</th>
              <th className="px-2 py-1 text-right">Prix moyen TTC</th>
              <th className="px-2 py-1 text-right">Prix moyen pondéré</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.code_13_ref} className="border-t border-gray-200">
                <td className="px-2 py-1">{sale.code_13_ref}</td>
                <td className="px-2 py-1">{sale.name}</td>
                <td className="px-2 py-1 text-right">
                  {sale.total_quantity.toLocaleString()} 
                </td>
                <td className="px-2 py-1 text-right">
                  {sale.avg_price_with_tax.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">
                  {sale.avg_weighted_average_price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 sticky bottom-0">
            <tr className="border-t border-gray-300 font-semibold">
              <td className="px-2 py-1" colSpan={2}>
                {nbProducts} produit(s)
              </td>
              <td className="px-2 py-1 text-right">
                {/* Somme des quantités */}
                {sumQuantity.toLocaleString()}
              </td>
              <td className="px-2 py-1 text-right">
                {/* Moy. des prix moyen TTC */}
                {meanAvgPriceWithTax.toFixed(2)}
              </td>
              <td className="px-2 py-1 text-right">
                {/* Moy. des prix d'achat pondéré */}
                {meanWeightedAvgPrice.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;

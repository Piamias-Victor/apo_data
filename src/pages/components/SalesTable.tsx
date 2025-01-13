// /components/SalesTable.tsx

import React from "react";
import { useSalesContext } from "@/contexts/salesContext";
import { FaDollarSign, FaShoppingCart, FaChartLine } from "react-icons/fa"; // Import des icônes depuis react-icons
import { GroupedSale } from "@/types/Sale";

type SalesTableProps = {
  groupedSales: GroupedSale[];
};


const SalesTable: React.FC<SalesTableProps> = ({ groupedSales }) => {
  const { loading, error } = useSalesContext();

  if (loading) return <p className="text-center text-gray-500">Chargement des ventes...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  // 1) Convertir / s'assurer que ce sont des nombres et calculer la marge et le pourcentage de marge
  const salesData = groupedSales.map(sale => {
    const tvaDecimal = sale.tva / 100; // Conversion de la TVA en décimal (ex: 20 -> 0.20)
    const priceHT = sale.avg_price_with_tax / (1 + tvaDecimal); // Prix de vente HT
    const margin = priceHT - sale.avg_weighted_average_price; // Marge
    const marginPercent = priceHT > 0 ? (margin / priceHT) * 100 : 0; // Pourcentage de marge

    const total_sales = sale.avg_price_with_tax * sale.total_quantity; // CA Total TTC
    const total_purchase = sale.avg_weighted_average_price * sale.total_quantity; // Montant d'Achat Total HT
    const total_margin = margin * sale.total_quantity; // Marge Totale

    return {
      ...sale,
      total_quantity: Number(sale.total_quantity),
      avg_price_with_tax: Number(sale.avg_price_with_tax),
      avg_weighted_average_price: Number(sale.avg_weighted_average_price),
      tva: Number(sale.tva), // TVA en pourcentage (ex: 20)
      margin: Number(margin.toFixed(2)), // Marge arrondie à deux décimales
      margin_percent: Number(marginPercent.toFixed(2)), // Pourcentage de marge arrondi à deux décimales
      total_sales: Number(total_sales.toFixed(2)), // CA Total TTC
      total_purchase: Number(total_purchase.toFixed(2)), // Montant d'Achat Total HT
      total_margin: Number(total_margin.toFixed(2)), // Marge Totale
    };
  });

  // 2) Calculer les agrégats
  const nbProducts = salesData.length;

  // Somme des quantités
  const sumQuantity = salesData.reduce(
    (acc, sale) => acc + sale.total_quantity,
    0
  );

  // Moyenne des prix moyen TTC
  const meanAvgPriceWithTax =
    nbProducts > 0
      ? salesData.reduce((acc, sale) => acc + sale.avg_price_with_tax, 0) /
        nbProducts
      : 0;

  // Moyenne des prix moyen pondéré
  const meanWeightedAvgPrice =
    nbProducts > 0
      ? salesData.reduce(
          (acc, sale) => acc + sale.avg_weighted_average_price,
          0
        ) / nbProducts
      : 0;

  // Moyenne de la Marge
  const meanMargin =
    nbProducts > 0
      ? salesData.reduce((acc, sale) => acc + sale.margin, 0) / nbProducts
      : 0;

  // Moyenne du Pourcentage de Marge
  const meanMarginPercent =
    nbProducts > 0
      ? salesData.reduce((acc, sale) => acc + sale.margin_percent, 0) / nbProducts
      : 0;

  // Calcul des Totaux
  const totalCA = salesData.reduce((acc, sale) => acc + sale.total_sales, 0);
  const totalPurchase = salesData.reduce((acc, sale) => acc + sale.total_purchase, 0);
  const totalMargin = salesData.reduce((acc, sale) => acc + sale.total_margin, 0);

  // Fonction utilitaire pour formater les nombres en euros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Fonction utilitaire pour formater les pourcentages
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Ventes du dernier mois</h2>

        {/* Cards pour les Totaux */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* CA Total */}
          <div className="flex-1 bg-primary bg-opacity-10 shadow rounded-lg p-6 flex items-center">
            <FaDollarSign className="h-12 w-12 text-primary mr-4" />
            <div>
              <p className="text-sm font-medium text-primary">Chiffre d Affaires Total</p>
              <p className="mt-2 text-3xl font-bold text-primary">{formatCurrency(totalCA)}</p>
            </div>
          </div>

          {/* Montant d'Achat Total */}
          <div className="flex-1 bg-secondary bg-opacity-10 shadow rounded-lg p-6 flex items-center">
            <FaShoppingCart className="h-12 w-12 text-secondary mr-4" />
            <div>
              <p className="text-sm font-medium text-secondary">Montant d Achat Total</p>
              <p className="mt-2 text-3xl font-bold text-secondary">{formatCurrency(totalPurchase)}</p>
            </div>
          </div>

          {/* Marge Totale */}
          <div className="flex-1 bg-light shadow rounded-lg p-6 flex items-center">
            <FaChartLine className="h-12 w-12 text-primary mr-4" />
            <div>
              <p className="text-sm font-medium text-primary">Marge Totale</p>
              <p className="mt-2 text-3xl font-bold text-primary">{formatCurrency(totalMargin)}</p>
            </div>
          </div>
        </div>

        {/* Tableau des Ventes */}
        <div className="relative h-96 overflow-y-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-light sticky top-0 z-10">
              <tr>
                <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Ean13
                </th>
                <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Nom
                </th>
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Qté
                </th>
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Prix TTC
                </th>
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Prix MP
                </th>
                {/* Suppression de la colonne TVA */}
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Marge
                </th>
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Marge %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map((sale, index) => (
                <tr key={sale.code_13_ref} className={index % 2 === 0 ? 'bg-background' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {sale.code_13_ref}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary truncate min-w-0 max-w-xs" title={sale.name}>
                    {sale.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary">
                    {sale.total_quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary">
                    {formatCurrency(sale.avg_price_with_tax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary">
                    {formatCurrency(sale.avg_weighted_average_price)}
                  </td>
                  {/* Suppression de la cellule TVA */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary">
                    {formatCurrency(sale.margin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary">
                    {formatPercentage(sale.margin_percent)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-light sticky bottom-0 z-10">
              <tr className="font-semibold text-primary">
                <td className="px-6 py-3" colSpan={2}>
                  {nbProducts} produit(s)
                </td>
                <td className="px-6 py-3 text-right">
                  {sumQuantity.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right">
                  {formatCurrency(meanAvgPriceWithTax)}
                </td>
                <td className="px-6 py-3 text-right">
                  {formatCurrency(meanWeightedAvgPrice)}
                </td>
                {/* Suppression de la cellule TVA */}
                <td className="px-6 py-3 text-right">
                  {formatCurrency(meanMargin)}
                </td>
                <td className="px-6 py-3 text-right">
                  {formatPercentage(meanMarginPercent)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;

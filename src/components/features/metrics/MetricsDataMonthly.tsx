import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { MetricsData } from "@/hooks/data/useMetricsData";
import { formatLargeNumber } from "@/libs/formatUtils";
import { useState, useMemo } from "react";


interface MetricsDataMonthlyProps {
  metricsData: MetricsData[];
  loading: boolean;
  error: string | null;
}

// Configuration des colonnes
const tableColumns = [
  { key: "month", label: "Mois" },
  { key: "avg_sale_price", label: "Prix Vente Moyen (€)" },
  { key: "avg_purchase_price", label: "Prix Achat Moyen (€)" },
  { key: "avg_margin", label: "Marge (€)" },
  { key: "unique_products_sold", label: "Références Vendues" },
  { key: "unique_selling_pharmacies", label: "Pharmacies" },
];

const MetricsDataMonthly: React.FC<MetricsDataMonthlyProps> = ({ metricsData, loading, error }) => {
  const [sortColumn, setSortColumn] = useState<keyof MetricsData>("avg_sale_price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof MetricsData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...metricsData].sort((a, b) => {
      if (sortColumn === "month") {
        return sortOrder === "asc"
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      }
      return sortOrder === "asc" 
        ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) 
        : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
    });
  }, [metricsData, sortColumn, sortOrder]);

  const renderTableContent = () => {
    if (loading) return <p className="text-gray-500 text-center">Chargement des données...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!metricsData || metricsData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
        <table className="w-full border-collapse">
          <SortableTableHeader<MetricsData>
            columns={tableColumns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={toggleSort}
            headerBgColor="bg-violet-500"
            headerHoverColor="hover:bg-violet-600"
          />

          <tbody>
            {sortedData.map((data, index) => (
              <tr key={index} className="border-b hover:bg-violet-50 transition text-center">
                <td className="p-5">{data.month}</td>
                <td className="p-5">{formatLargeNumber(data.avg_sale_price, true)}</td>
                <td className="p-5">{formatLargeNumber(data.avg_purchase_price, true)}</td>
                <td className="p-5">{formatLargeNumber(data.avg_margin, true)}</td>
                <td className="p-5">{formatLargeNumber(data.unique_products_sold, false)}</td>
                <td className="p-5">{formatLargeNumber(data.unique_selling_pharmacies, false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CollapsibleSection 
      title="Indicateurs Mensuels" 
      icon="📅"
      buttonColorClass="bg-violet-500 hover:bg-violet-600"
    >
      {renderTableContent()}
    </CollapsibleSection>
  );
};

export default MetricsDataMonthly;
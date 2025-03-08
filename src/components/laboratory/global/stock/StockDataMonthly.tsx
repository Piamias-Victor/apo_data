// StockDataMonthly.tsx
import React, { useState, useMemo } from "react";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import SortableTableHeader from "@/components/ui/SortableTableHeader";

interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
}

interface StockDataMonthlyProps {
  stockData: StockSalesData[];
  loading: boolean;
  error: string | null;
}

// Configuration des colonnes
const tableColumns = [
  { key: "month", label: "Mois" },
  { key: "total_avg_stock", label: "Stock Moyen" },
  { key: "total_stock_value", label: "Valeur du Stock (€)" },
  { key: "total_quantity", label: "Quantité Vendue" },
  { key: "total_revenue", label: "Chiffre d'Affaires (€)" },
];

const StockDataMonthly: React.FC<StockDataMonthlyProps> = ({ stockData, loading, error }) => {
  const [sortColumn, setSortColumn] = useState<keyof StockSalesData>("total_revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof StockSalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...stockData].sort((a, b) => {
      if (sortColumn === "month") {
        return sortOrder === "asc"
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      }
      return sortOrder === "asc" 
        ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) 
        : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
    });
  }, [stockData, sortColumn, sortOrder]);

  const renderTableContent = () => {
    if (loading) return <p className="text-gray-500 text-center">Chargement des données...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!stockData || stockData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
        <table className="w-full border-collapse">
          <SortableTableHeader<StockSalesData>
            columns={tableColumns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={toggleSort}
            headerBgColor="bg-indigo-500"
            headerHoverColor="hover:bg-indigo-600"
          />

          <tbody>
            {sortedData.map((data, index) => (
              <tr key={index} className="border-b hover:bg-indigo-50 transition text-center">
                <td className="p-5">{data.month}</td>
                <td className="p-5">{formatLargeNumber(data.total_avg_stock, false)}</td>
                <td className="p-5">{formatLargeNumber(data.total_stock_value, true)}</td>
                <td className="p-5">{formatLargeNumber(data.total_quantity, false)}</td>
                <td className="p-5">{formatLargeNumber(data.total_revenue, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CollapsibleSection 
      title="Indicateurs Mensuels du Stock" 
      icon="📊"
      buttonColorClass="bg-indigo-500 hover:bg-indigo-600"
    >
      {renderTableContent()}
    </CollapsibleSection>
  );
};

export default StockDataMonthly;
// StockBreakDataMonthly.tsx
import React, { useState, useMemo } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import SortableTableHeader from "@/components/ui/SortableTableHeader";

interface StockBreakData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

interface StockBreakDataMonthlyProps {
  stockBreakData: StockBreakData[];
  loading: boolean;
  error: string | null;
}

// Configuration des colonnes
const tableColumns = [
  { key: "month", label: "Mois" },
  { key: "total_products_ordered", label: "Produits Commandés" },
  { key: "stock_break_products", label: "Produits en Rupture" },
  { key: "stock_break_rate", label: "Taux de Rupture (%)" },
  { key: "stock_break_amount", label: "Montant des Ruptures (€)" },
];

const StockBreakDataMonthly: React.FC<StockBreakDataMonthlyProps> = ({ stockBreakData, loading, error }) => {
  const [sortColumn, setSortColumn] = useState<keyof StockBreakData>("stock_break_amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof StockBreakData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...stockBreakData].sort((a, b) => {
      if (sortColumn === "month") {
        return sortOrder === "asc"
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      }
      return sortOrder === "asc" 
        ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) 
        : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
    });
  }, [stockBreakData, sortColumn, sortOrder]);

  const renderTableContent = () => {
    if (loading) return <p className="text-gray-500 text-center">Chargement des données...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!stockBreakData || stockBreakData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
        <table className="w-full border-collapse">
          <SortableTableHeader<StockBreakData>
            columns={tableColumns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={toggleSort}
            headerBgColor="bg-red-500"
            headerHoverColor="hover:bg-red-600"
          />

          <tbody>
            {sortedData.map((data, index) => (
              <tr key={index} className="border-b hover:bg-red-50 transition text-center">
                <td className="p-5">{data.month}</td>
                <td className="p-5">{formatLargeNumber(data.total_products_ordered, false)}</td>
                <td className="p-5">{formatLargeNumber(data.stock_break_products, false)}</td>
                <td className="p-5">{formatLargeNumber(data.stock_break_rate, false)}%</td>
                <td className="p-5">{formatLargeNumber(data.stock_break_amount, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CollapsibleSection 
      title="Suivi des Ruptures de Stock" 
      icon="🚨"
      buttonColorClass="bg-red-500 hover:bg-red-600"
    >
      {renderTableContent()}
    </CollapsibleSection>
  );
};

export default StockBreakDataMonthly;
import Loader from "@/components/common/feedback/Loader";
import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { formatLargeNumber } from "@/libs/formatUtils";
import { useState, useMemo } from "react";


interface SalesData {
  month: string;
  total_quantity: number;
  revenue?: number;
  margin?: number;
  purchase_quantity?: number;
  purchase_amount?: number;
}

interface SalesDataMonthlyProps {
  salesData: SalesData[];
  loading: boolean;
  error: string | null;
}

// Configuration des colonnes
const tableColumns = [
  { key: "month", label: "Mois" },
  { key: "total_quantity", label: "Quantité Vendue" },
  { key: "revenue", label: "Chiffre d'Affaires (€)" },
  { key: "margin", label: "Marge (€)" },
  { key: "purchase_quantity", label: "Achats" },
  { key: "purchase_amount", label: "Montant Achats (€)" },
];

const SalesDataMonthly: React.FC<SalesDataMonthlyProps> = ({ salesData, loading, error }) => {
  const [sortColumn, setSortColumn] = useState<keyof SalesData>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof SalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...salesData].sort((a, b) => {
      if (sortColumn === "month") {
        return sortOrder === "asc"
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      }
      return sortOrder === "asc" 
        ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) 
        : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
    });
  }, [salesData, sortColumn, sortOrder]);

  const renderTableContent = () => {
    if (loading) return <Loader text="Chargement des données..." />;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!salesData || salesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
        <table className="w-full border-collapse">
          <SortableTableHeader<SalesData>
            columns={tableColumns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={toggleSort}
          />

          <tbody>
            {sortedData.map((data, index) => (
              <tr key={index} className="border-b hover:bg-teal-50 transition text-center">
                <td className="p-5">{data.month}</td>
                <td className="p-5">{formatLargeNumber(data.total_quantity, false)}</td>
                <td className="p-5">{data.revenue ? formatLargeNumber(data.revenue) : "N/A"}</td>
                <td className="p-5">{data.margin ? formatLargeNumber(data.margin) : "N/A"}</td>
                <td className="p-5">
                  {data.purchase_quantity ? formatLargeNumber(data.purchase_quantity, false) : "N/A"}
                </td>
                <td className="p-5">
                  {data.purchase_amount ? formatLargeNumber(data.purchase_amount) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CollapsibleSection title="Analyse des Ventes Mensuelles" icon="📊">
      {renderTableContent()}
    </CollapsibleSection>
  );
};

export default SalesDataMonthly;
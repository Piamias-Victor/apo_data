import SearchInput from "@/components/common/inputs/SearchInput";
import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import { PharmacySalesWithEvolution } from "@/hooks/api/usePharmacySalesData";
import { formatLargeNumber } from "@/libs/formatUtils";
import { useState, useMemo } from "react";
import { FaArrowUp, FaArrowDown, FaSortUp, FaSortDown, FaSort } from "react-icons/fa";

interface SalesDataByPharmacyProps {
  salesData: PharmacySalesWithEvolution[];
  loading: boolean;
  error: string | null;
}

const SalesDataByPharmacy: React.FC<SalesDataByPharmacyProps> = ({ salesData, loading, error }) => {
  const [sortColumn, setSortColumn] = useState<keyof PharmacySalesWithEvolution>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSort = (column: keyof PharmacySalesWithEvolution) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  const renderEvolution = (value: number) => {
    if (value > 0)
      return <span className="text-green-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowUp className="ml-1" /></span>;
    if (value < 0)
      return <span className="text-red-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowDown className="ml-1" /></span>;
    return <span className="text-gray-400 text-xs flex justify-center mt-1">0%</span>;
  };

  const sortedData = useMemo(() => {
    return [...salesData]
      .filter((data) => 
        data.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortColumn === "pharmacy_name") {
          return sortOrder === "asc"
            ? a.pharmacy_name.localeCompare(b.pharmacy_name)
            : b.pharmacy_name.localeCompare(a.pharmacy_name);
        }
        return sortOrder === "asc" 
          ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) 
          : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
      });
  }, [salesData, sortColumn, sortOrder, searchTerm]);

  const renderTableContent = () => {
    // Barre de recherche fixe (toujours visible)
    const searchBar = (
      <div className="mb-4">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Rechercher une pharmacie..."
        />
      </div>
    );

    if (loading) return (
      <>
        {searchBar}
        <p className="text-gray-500 text-center">Chargement des données...</p>
      </>
    );

    if (error) return (
      <>
        {searchBar}
        <p className="text-red-500 text-center">{error}</p>
      </>
    );

    if (!sortedData || sortedData.length === 0) return (
      <>
        {searchBar}
        <p className="text-center text-gray-500">Aucune pharmacie trouvée.</p>
      </>
    );

    return (
      <>
        {searchBar}
        <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
          <table className="w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-pink-500 text-white text-md rounded-lg">
                {["#", "pharmacy_name", "total_quantity", "revenue", "margin", "purchase_quantity", "purchase_amount"].map((col, index) => (
                  <th
                    key={index}
                    className="p-4 cursor-pointer transition hover:bg-pink-600"
                    onClick={() => col !== "#" && toggleSort(col as keyof PharmacySalesWithEvolution)}
                  >
                    <div className="flex justify-center items-center gap-2">
                      {col === "#" && "#"}
                      {col === "pharmacy_name" && "Pharmacie"}
                      {col === "total_quantity" && "Qté Vendue"}
                      {col === "revenue" && "CA (€)"}
                      {col === "margin" && "Marge (€)"}
                      {col === "purchase_quantity" && "Qté Achetée"}
                      {col === "purchase_amount" && "Montant Achats (€)"}
                      {col !== "#" && (sortColumn === col ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((data, index) => (
                <tr key={data.pharmacy_id} className="border-b hover:bg-gray-100 transition text-center">
                  <td className="p-5 font-bold">{index + 1}</td>
                  <td className="p-5">{data.pharmacy_name}</td>
                  <td className="p-5">{formatLargeNumber(data.total_quantity, false)}{renderEvolution(data.evolution.total_quantity)}</td>
                  <td className="p-5">{formatLargeNumber(data.revenue)}{renderEvolution(data.evolution.revenue)}</td>
                  <td className="p-5">{formatLargeNumber(data.margin)}{renderEvolution(data.evolution.margin)}</td>
                  <td className="p-5">{formatLargeNumber(data.purchase_quantity, false)}{renderEvolution(data.evolution.purchase_quantity)}</td>
                  <td className="p-5">{formatLargeNumber(data.purchase_amount)}{renderEvolution(data.evolution.purchase_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <CollapsibleSection 
      title="Ventes par Pharmacie" 
      icon="🏥"
      buttonColorClass="bg-pink-500 hover:bg-pink-600"
    >
      {renderTableContent()}
    </CollapsibleSection>
  );
};

export default SalesDataByPharmacy;
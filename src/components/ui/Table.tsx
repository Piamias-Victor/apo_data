import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface TableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  defaultSortKey?: keyof T;
  defaultSortOrder?: "asc" | "desc";
  highlightTopRows?: number;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  defaultSortKey,
  defaultSortOrder = "desc",
  highlightTopRows = 3,
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  const toggleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
  
    const valA = a[sortColumn];
    const valB = b[sortColumn];
  
    // 🔹 Vérification et conversion des valeurs pour éviter les erreurs
    const isStringA = typeof valA === "string";
    const isStringB = typeof valB === "string";
    const isNumberA = typeof valA === "number";
    const isNumberB = typeof valB === "number";
  
    // 🔸 Cas où les deux valeurs sont des chaînes de caractères
    if (isStringA && isStringB) {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  
    // 🔸 Cas où les deux valeurs sont des nombres
    if (isNumberA && isNumberB) {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  
    // 🔹 Si l'un est une string et l'autre un nombre (cas rare), on considère que la string est plus grande
    if (isStringA && isNumberB) return 1;
    if (isNumberA && isStringB) return -1;
  
    return 0; // 🔹 Sécurité en cas de valeurs nulles ou indéterminées
  });

  const renderEvolution = (value: number) => {
    if (value > 0)
      return <span className="text-green-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowUp className="ml-1" /></span>;
    if (value < 0)
      return <span className="text-red-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowDown className="ml-1" /></span>;
    return <span className="text-gray-400 text-xs flex justify-center mt-1">0%</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 shadow-sm">
        {/* 🔹 En-tête du tableau */}
        <thead>
          <tr className="bg-blue-500 text-white text-md">
            {columns.map(({ key, label }) => (
              <th
                key={key as string}
                className="p-4 cursor-pointer w-1/6"
                onClick={() => toggleSort(key)}
              >
                <div className="flex justify-center items-center gap-2">
                  {label}
                  {sortColumn === key ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* 🔹 Contenu du tableau */}
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={`border-b text-center ${
                index < highlightTopRows ? "bg-yellow-50 hover:bg-yellow-100 font-semibold" : "hover:bg-gray-100"
              } transition`}
            >
              {columns.map(({ key }) => (
                <td key={key as string} className="p-4">
                  {typeof row[key] === "number"
                    ? formatLargeNumber(row[key])
                    : row[key]}
                  {row.evolution && row.evolution[key] !== undefined && renderEvolution(row.evolution[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
import { formatLargeNumber } from "@/libs/formatUtils";
import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
  
    // Vérification et conversion des valeurs pour éviter les erreurs
    const isStringA = typeof valA === "string";
    const isStringB = typeof valB === "string";
    const isNumberA = typeof valA === "number";
    const isNumberB = typeof valB === "number";
  
    // Cas où les deux valeurs sont des chaînes de caractères
    if (isStringA && isStringB) {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  
    // Cas où les deux valeurs sont des nombres
    if (isNumberA && isNumberB) {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  
    // Si l'un est une string et l'autre un nombre, on considère que la string est plus grande
    if (isStringA && isNumberB) return 1;
    if (isNumberA && isStringB) return -1;
  
    return 0; // Sécurité en cas de valeurs nulles ou indéterminées
  });

  const renderEvolution = (value: number) => {
    if (value > 0)
      return (
        <motion.span 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-500 text-xs flex items-center justify-center mt-1 font-medium bg-green-50 px-2 py-0.5 rounded-full"
        >
          +{value.toFixed(1)}% <FaArrowUp className="ml-1" />
        </motion.span>
      );
    if (value < 0)
      return (
        <motion.span 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs flex items-center justify-center mt-1 font-medium bg-red-50 px-2 py-0.5 rounded-full"
        >
          {value.toFixed(1)}% <FaArrowDown className="ml-1" />
        </motion.span>
      );
    return (
      <motion.span 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400 text-xs flex justify-center mt-1 bg-gray-50 px-2 py-0.5 rounded-full"
      >
        0%
      </motion.span>
    );
  };

  return (
    <motion.div 
      className="overflow-x-auto rounded-xl shadow-lg bg-white border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <table className="w-full border-collapse">
        {/* En-tête du tableau */}
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-md">
            {columns.map(({ key, label }, index) => (
              <th
                key={key as string}
                className={`p-4 cursor-pointer transition-all duration-300 hover:bg-blue-600/80 ${
                  index === 0 ? "rounded-tl-xl" : ""
                } ${index === columns.length - 1 ? "rounded-tr-xl" : ""}`}
                onClick={() => toggleSort(key)}
              >
                <motion.div 
                  className="flex justify-center items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                  <AnimatePresence mode="wait">
                    {sortColumn === key ? (
                      <motion.div
                        key={sortOrder}
                        initial={{ opacity: 0, y: sortOrder === "asc" ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: sortOrder === "asc" ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="unsorted"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaSort />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Contenu du tableau */}
        <tbody>
          {sortedData.map((row, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: index * 0.05,
                  duration: 0.3
                }
              }}
              whileHover={{ 
                backgroundColor: index < highlightTopRows 
                  ? "rgba(254, 240, 138, 0.5)" 
                  : "rgba(243, 244, 246, 0.5)" 
              }}
              className={`relative text-center transition-all duration-300 ${
                index < highlightTopRows 
                  ? "bg-yellow-50 hover:bg-yellow-50/80 font-medium border-b border-yellow-100" 
                  : "hover:bg-gray-50/80 border-b border-gray-100"
              }`}
            >
              {columns.map(({ key }, colIndex) => (
                <td key={key as string} className={`p-4 ${colIndex % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className="text-gray-800">
                      {typeof row[key] === "number"
                        ? formatLargeNumber(row[key])
                        : row[key]}
                    </div>
                    {row.evolution && row.evolution[key] !== undefined && renderEvolution(row.evolution[key])}
                  </div>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default Table;
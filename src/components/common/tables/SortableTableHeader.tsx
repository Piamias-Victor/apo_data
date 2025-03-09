import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface SortableTableHeaderProps<T> {
  columns: Column<T>[];
  sortColumn: keyof T;
  sortOrder: "asc" | "desc";
  onSort: (column: keyof T) => void;
  headerBgColor?: string;
  headerHoverColor?: string;
}

function SortableTableHeader<T>({ 
  columns, 
  sortColumn, 
  sortOrder, 
  onSort,
  headerBgColor = "bg-gradient-to-r from-teal-400 to-teal-500",
  headerHoverColor = "hover:bg-teal-500/90"
}: SortableTableHeaderProps<T>) {
  return (
    <thead>
      <tr className={`${headerBgColor} text-white text-md shadow-md`}>
        {columns.map(({ key, label }, index) => (
          <th
            key={key as string}
            className={`relative p-4 cursor-pointer transition-all duration-300 ${headerHoverColor} backdrop-blur-sm ${
              index === 0 ? "rounded-tl-xl" : ""
            } ${index === columns.length - 1 ? "rounded-tr-xl" : ""}`}
            onClick={() => onSort(key)}
          >
            <motion.div 
              className="flex justify-center items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {label}
              <AnimatePresence mode="wait">
                {sortColumn === key ? (
                  <motion.div
                    key={sortOrder}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 25 
                    }}
                  >
                    {sortOrder === "asc" ? (
                      <FaSortUp className="text-white" />
                    ) : (
                      <FaSortDown className="text-white" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="unsorted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaSort className="text-white/60" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Underline indicator for active sort column */}
            {sortColumn === key && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-t-md"
                layoutId="activeSort"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default SortableTableHeader;
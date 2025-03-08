// components/table/SortableTableHeader.tsx
import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface SortableTableHeaderProps<T> {
  columns: Column<T>[];
  sortColumn: keyof T;
  sortOrder: "asc" | "desc";
  onSort: (column: keyof T) => void;
}

function SortableTableHeader<T>({ 
  columns, 
  sortColumn, 
  sortOrder, 
  onSort 
}: SortableTableHeaderProps<T>) {
  return (
    <thead>
      <tr className="bg-teal-500 text-white text-md">
        {columns.map(({ key, label }) => (
          <th
            key={key as string}
            className="p-4 cursor-pointer w-1/6 transition hover:bg-teal-600"
            onClick={() => onSort(key)}
          >
            <div className="flex justify-center items-center gap-2">
              {label}
              {sortColumn === key 
                ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) 
                : <FaSort />}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default SortableTableHeader;
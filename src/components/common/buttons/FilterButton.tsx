// src/components/ui/buttons/FilterButton.tsx
import React, { ReactNode } from "react";

interface FilterButtonProps {
  icon: ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 transition"
    >
      {icon}
      <span className="text-gray-700 text-sm">
        {count && count > 0 ? `${count} sélectionné(s)` : label}
      </span>
    </button>
  );
};

export default FilterButton;
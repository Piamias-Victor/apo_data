// src/components/LaboratorySelector.tsx
import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";

interface Props {
  distributors: { lab_distributor: string }[];
  selectedLabs: string[];
  setSelectedLabs: React.Dispatch<React.SetStateAction<string[]>>;
  handleApplyFilters: () => void;
  handleClearSelection: () => void;
}

const LaboratorySelector: React.FC<Props> = ({
  distributors,
  selectedLabs,
  setSelectedLabs,
  handleApplyFilters,
  handleClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredLabs = distributors
    .map((lab) => lab.lab_distributor)
    .filter((lab) => lab.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleSelectLab = (lab: string) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((selected) => selected !== lab) : [...prev, lab]
    );
  };

  return (
    <div className="relative max-w-lg mx-auto">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-4 py-3 shadow-md hover:bg-gray-100 transition"
      >
        <span className="text-gray-700 text-sm truncate">
          {selectedLabs.length > 0 ? `${selectedLabs.length} laboratoire(s) sélectionné(s)` : "Choisir un laboratoire"}
        </span>
        <FaChevronDown className="text-gray-500" />
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 z-50">
          <div className="p-3 border-b border-gray-200 flex items-center bg-gray-100 rounded-t-md">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Rechercher un laboratoire..."
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredLabs.map((lab, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-teal-50 flex items-center gap-3 ${
                  selectedLabs.includes(lab) ? "bg-teal-100" : ""
                }`}
                onClick={() => handleSelectLab(lab)}
              >
                <span className="text-sm text-gray-700 flex-1">{lab}</span>
                {selectedLabs.includes(lab) && <FaCheck className="text-teal-500" />}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center gap-3 p-3 border-t border-gray-200">
            <button
              onClick={handleClearSelection}
              className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition"
            >
              <FaTimes /> Effacer
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition"
            >
              <FaCheck /> Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratorySelector;
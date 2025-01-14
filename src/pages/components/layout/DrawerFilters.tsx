import React from "react";
import Dropdown from "./Dropdown";
import { usePharmaciesContext } from "@/contexts/pharmaciesContext";
import { useUniversesContext } from "@/contexts/universesContext";
import { useLabDistributorsContext } from "@/contexts/brandsContext";
import { useFilterContext } from "@/contexts/filtersContext";

type DrawerFiltersProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DrawerFilters: React.FC<DrawerFiltersProps> = ({ isOpen, onClose }) => {
  const { pharmacies } = usePharmaciesContext();
  const { universes } = useUniversesContext();
  const { labDistributors } = useLabDistributorsContext();
  const { setFilters, handleClearAllFilters } = useFilterContext();

  const handleApplyFilters = () => {
    setFilters({});
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={onClose}>
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-lg p-4 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-primary">Filtres</h2>

        <Dropdown label="Pharmacie" items={pharmacies.map(p => p.name)} onSelect={() => {}} onClear={() => {}} />
        <Dropdown label="Univers" items={universes.map(u => u.universe)} onSelect={() => {}} onClear={() => {}} />
        <Dropdown label="Distributeur" items={labDistributors.map(ld => ld.lab_distributor)} onSelect={() => {}} onClear={() => {}} />

        <button className="btn bg-primary text-white w-full mt-4" onClick={handleApplyFilters}>Appliquer</button>
      </div>
    </div>
  );
};

export default DrawerFilters;

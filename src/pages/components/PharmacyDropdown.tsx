import React, { useState } from 'react';
import { usePharmaciesContext } from '@/contexts/pharmaciesContext';
import { FaClinicMedical } from 'react-icons/fa'; // Icône

const PharmacyDropdown: React.FC = () => {
  const { pharmacies, loading, error } = usePharmaciesContext();
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);

  if (loading) return <p>Chargement des pharmacies...</p>;
  if (error) return <p>{error}</p>;

  const handleSelectPharmacy = (pharmacyId: string | null) => {
    setSelectedPharmacy(pharmacyId);
  };

  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn m-1 flex items-center ">
        <FaClinicMedical className="mr-2" />
        {selectedPharmacy ? pharmacies.find(p => p.id === selectedPharmacy)?.name : "Sélectionnez une pharmacie"}
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow border-2 bg-base-100 rounded-box w-52">
        <li
          className="bg-primary text-white hover:bg-secondary cursor-pointer"
          onClick={() => handleSelectPharmacy(null)}
        >
          <a>Toutes les pharmacies </a>
        </li>
        {pharmacies.map((pharmacy, index) => (
          <li
            key={pharmacy.id}
            className={`hover:bg-secondary hover:text-white cursor-pointer ${
              index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
            }`}
            onClick={() => handleSelectPharmacy(pharmacy.id)}
          >
            <a>{pharmacy.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PharmacyDropdown;
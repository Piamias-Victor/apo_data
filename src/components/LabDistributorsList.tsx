// src/components/LabDistributorsList.tsx

import React from 'react';
import { useLabDistributorsContext } from '@/contexts/labDistributors';

/**
 * Composant pour afficher la liste des `lab_distributors` avec leurs `brand_labs` et `range_names`.
 */
export const LabDistributorsList = () => {
  const { labDistributors, loading, error } = useLabDistributorsContext();

  if (loading) {
    return <div>Loading lab distributors...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (labDistributors.length === 0) {
    return <div>No lab distributors available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Lab Distributor</th>
            <th className="py-2 px-4 border-b">Brand Labs</th>
            <th className="py-2 px-4 border-b">Range Names</th>
          </tr>
        </thead>
        <tbody>
          {labDistributors.map((labDistributor) => (
            <tr key={labDistributor.lab_distributor}> {/* Clé unique basée sur `lab_distributor` */}
              <td className="py-2 px-4 border-b">{labDistributor.lab_distributor}</td>
              <td className="py-2 px-4 border-b">
                <ul>
                  {labDistributor.brand_labs.map((brandLab) => (
                    <li key={`${brandLab.brand_lab}-${labDistributor.lab_distributor}`}>
                      <strong>{brandLab.brand_lab}</strong>
                      {brandLab.range_names.length > 0 ? (
                        <ul className="ml-4 list-disc">
                          {brandLab.range_names.map((range) => (
                            <li key={`${range.range_name}-${brandLab.brand_lab}-${labDistributor.lab_distributor}`}>
                              {range.range_name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> (No Range Names)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="py-2 px-4 border-b">
                {labDistributor.brand_labs.flatMap(bl => bl.range_names).length > 0 ? (
                  <ul>
                    {labDistributor.brand_labs.flatMap(bl => bl.range_names).map(range => (
                      <li key={`${range.range_name}-${labDistributor.lab_distributor}`}>{range.range_name}</li>
                    ))}
                  </ul>
                ) : (
                  <span>No Range Names</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

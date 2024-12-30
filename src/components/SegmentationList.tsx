// src/components/SegmentationList.tsx

import React from 'react';
import { useSegmentationContext } from '@/contexts/segmentation';

/**
 * Composant pour afficher la liste des segmentations uniques avec leurs catégories et sous-catégories.
 */
export const SegmentationList = () => {
  const { segmentations, loading, error } = useSegmentationContext();

  if (loading) {
    return <div>Chargement des segmentations et catégories...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  if (segmentations.length === 0) {
    return <div>Aucune segmentation et catégories disponibles.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Univers</th>
            <th className="py-2 px-4 border-b">Catégories</th>
          </tr>
        </thead>
        <tbody>
          {segmentations.map((segmentation) => (
            <tr key={segmentation.universe}> {/* Clé unique basée sur l'univers */}
              <td className="py-2 px-4 border-b">{segmentation.universe}</td>
              <td className="py-2 px-4 border-b">
                <ul>
                  {segmentation.categories.map((category) => (
                    <li key={category.category}>
                      <strong>{category.category}</strong>
                      <ul className="ml-4 list-disc">
                        {category.sub_categories.map((sub) => (
                          <li key={sub.sub_category}>{sub.sub_category}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

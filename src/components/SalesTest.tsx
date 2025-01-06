import { useState, useEffect } from "react";
import { Sale } from "@/types/Sale";

/**
 * Composant pour afficher les ventes.
 */
const SalesComponent = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("/api/data_sales");
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status} ${response.statusText}`);
        }
        const data: Sale[] = await response.json();
        setSales(data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des ventes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <p>Chargement des ventes...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div>
      <h1>Ventes</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Quantité</th>
            <th>Date</th>
            <th>Produit ID</th>
            {/* Ajoutez d'autres en-têtes de colonnes selon votre type Sale */}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{sale.quantity}</td>
              <td>{new Date(sale.date).toLocaleDateString()}</td>
              <td>{sale.product_id}</td>
              {/* Ajoutez d'autres cellules selon votre type Sale */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesComponent;

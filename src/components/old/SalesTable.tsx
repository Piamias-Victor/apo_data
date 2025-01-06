import React, { useState } from "react";
import { useSales } from "@/hooks/useSales";

export const SalesTable = () => {
  const [page, setPage] = useState(1);
  const limit = 100;

  const { sales, total, loading, error } = useSales(page, limit);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div>Loading sales...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (sales.length === 0) {
    return <div>No sales available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Code 13 Ref</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Universe</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Sub-Category</th>
            <th className="py-2 px-4 border-b">Brand</th>
            <th className="py-2 px-4 border-b">Total Quantity</th>
            <th className="py-2 px-4 border-b">Avg Price with Tax</th>
            <th className="py-2 px-4 border-b">Avg Weighted Price</th>
            <th className="py-2 px-4 border-b">Last Sale Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.code13_ref}>
              <td className="py-2 px-4 border-b">{sale.code13_ref}</td>
              <td className="py-2 px-4 border-b">{sale.name ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.universe ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.category ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.sub_category ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.brand_lab ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.total_quantity}</td>
              <td className="py-2 px-4 border-b">{sale.avg_price_with_tax}</td>
              <td className="py-2 px-4 border-b">{sale.avg_weighted_average_price}</td>
              <td className="py-2 px-4 border-b">
                {sale.last_sale_date ? new Date(sale.last_sale_date).toLocaleString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

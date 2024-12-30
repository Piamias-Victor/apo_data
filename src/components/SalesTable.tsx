import React, { useState } from "react";
import { useSales } from "@/hooks/useSales";

export const SalesTable = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("stock");
  const [order, setOrder] = useState<string>("desc");
  const limit = 100;

  const { sales, total, loading, error } = useSales(page, limit, sortBy, order);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (column: string) => {
    setSortBy(column);
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

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
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("id")}>ID</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("created_at")}>Created At</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("updated_at")}>Updated At</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("quantity")}>Quantity</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("time")}>Time</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("operator_code")}>Operator Code</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("product_id")}>Product ID</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("stock")}>Stock</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("price_with_tax")}>Price with Tax</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("weighted_average_price")}>Weighted Average Price</button>
            </th>
            <th className="py-2 px-4 border-b">
              <button onClick={() => handleSort("code13_ref")}>Code 13 Ref</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="py-2 px-4 border-b">{sale.id}</td>
              <td className="py-2 px-4 border-b">{new Date(sale.created_at).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{new Date(sale.updated_at).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{sale.quantity}</td>
              <td className="py-2 px-4 border-b">{new Date(sale.time).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{sale.operator_code}</td>
              <td className="py-2 px-4 border-b">{sale.product_id}</td>
              <td className="py-2 px-4 border-b">{sale.stock ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.price_with_tax ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.weighted_average_price ?? "N/A"}</td>
              <td className="py-2 px-4 border-b">{sale.code13_ref ?? "N/A"}</td>
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

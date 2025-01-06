/**
 * Type définissant une pharmacie.
 */
export type Pharmacy = {
    id: string;
    created_at: string;
    updated_at: string;
    name: string | null;
    ca: number | null;
    area: string | null;
    employees_count: number | null;
    address: string | null;
    id_nat: string | null;
  };
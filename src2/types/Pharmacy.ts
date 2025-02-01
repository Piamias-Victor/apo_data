// src/types/Pharmacy.ts

export interface Pharmacy {
    id: string; // UUID
    created_at: string; // ISO string
    updated_at: string; // ISO string
    id_nat?: string;
    name?: string;
    ca?: number;
    area?: string;
    employees_count?: number;
    address?: string;
  }
  
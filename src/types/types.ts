export interface ProductSalesData {
  code_13_ref: string;
  product_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  avg_selling_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  part_ca_labo: number; // Part du produit sur le CA du labo
  part_marge_labo: number; // Part du produit sur la Marge du labo
  indice_rentabilite: number; // Indice de rentabilité
  type: "current" | "comparison";
  previous?: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
    avg_selling_price: number;
    avg_purchase_price: number;
    avg_margin: number;
    part_ca_labo: number;
    part_marge_labo: number;
    indice_rentabilite: number;
  };
}

export interface ProductSalesStockData {
  date: string;
  sales: number;
  stock: number;
  // Ajoutez d'autres champs selon vos besoins
}

export interface ProductTableProps {
  title?: string;
  icon?: React.ReactNode;
  colorTheme?: {
    primary: string;
    secondary: string;
    hover: string;
  };
  defaultCollapsed?: boolean;
  showQuantityComparison?: boolean;
}

export interface ProductFilterProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
  categories?: string[];
  suppliers?: string[];
  stockOptions?: { label: string; value: string }[];
}
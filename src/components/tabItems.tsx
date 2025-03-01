// src/config/tabItems.ts

import ProductStockBreakTable from "@/components/laboratory/break/ProductStockBreakTable";
import LaboratoryDashboardGlobal from "@/components/laboratory/global/Dashboard";
import ProductTable from "@/components/laboratory/product/ProductTable";
import LabRevenueDashboard from "@/components/laboratory/segment/LabRevenueDashboard";
import ProductsDashboard from "./laboratory/product/ProductsDashboard";
import StockBreakDashboard from "./laboratory/break/StockBreakDashboard";

export const tabItems = [
  {
    label: "📊 Global",
    content: <LaboratoryDashboardGlobal/>,
  },
  {
    label: "⭐ Produits",
    content: <ProductsDashboard/>,
  },
  {
    label: "🚨 Rupture",
    content: <StockBreakDashboard/>,
  },
  {
    label: "🔍 Segmentation",
    content: <LabRevenueDashboard/>,
  },
];
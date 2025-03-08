// src/config/tabItems.ts


import StockBreakDashboard from "../../features/laboratory/stock-breaks/StockBreakDashboard";
import SegmentationOverview from "../../features/laboratory/segmentation/SegmentationOverview";
import LaboratoryDashboardGlobal from "@/components/features/laboratory/overview/LaboratoryDashboardGlobal";
import ProductsDashboard from "@/components/features/laboratory/products/ProductsDashboard";

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
    content: <SegmentationOverview/>,
  },
];
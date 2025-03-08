// src/config/tabItems.ts

import LaboratoryDashboardGlobal from "@/components/laboratory/global/LaboratoryDashboardGlobal";
import ProductsDashboard from "./laboratory/product/ProductsDashboard";
import StockBreakDashboard from "./laboratory/break/StockBreakDashboard";
import SegmentationOverview from "./laboratory/segmentation/SegmentationOverview";

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
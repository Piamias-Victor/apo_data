// src/config/tabItems.ts

import ProductStockBreakTable from "@/components/laboratory/break/ProductStockBreakTable";
import ProductTable from "@/components/laboratory/product/ProductTable";
import LabRevenueDashboard from "@/components/laboratory/segment/LabRevenueDashboard";
import BrandStockBreakTable from "@/components/laboratory/segmentation/brands/BrandStockBreakTable";
import BrandTable from "@/components/laboratory/segmentation/brands/BrandTable";
import SegmentationDashboardGlobal from "@/components/segmentation/global/SegmentationDashboardGlobal";

export const tabItemsSegmentation = [
  {
    label: "📊 Global",
    content: <SegmentationDashboardGlobal/>,
  },
  {
    label: "🏭 Laboratoires",
    content: <BrandTable/>,
  },
  {
    label: "⭐ Produits",
    content: <ProductTable/>,
  },
  {
    label: "🏭🚨 Rupture Labos",
    content: <BrandStockBreakTable/>,
  },
  {
    label: "🚨 Rupture",
    content: <ProductStockBreakTable/>,
  }
];
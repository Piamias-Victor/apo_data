// src/config/tabItems.ts

import SalesDataRaw from "@/components/JSON";
import LaboratoryDashboardGlobal from "@/components/laboratory/global/Dashboard";
import ProductTable from "@/components/laboratory/product/ProductTable";
import LabRevenueDashboard from "@/components/laboratory/segment/LabRevenueDashboard";
import TopLabs from "@/components/TopLabs";

export const tabItems = [
  {
    label: "📊 Global",
    content: <LaboratoryDashboardGlobal/>,
  },
  {
    label: "⭐ Produits",
    content: <ProductTable/>,
  },
  {
    label: "🏥 Pharmacies",
    content: 'test',
  },
  {
    label: "🚨 Rupture",
    content: 'test',
  },
  {
    label: "🔍 Segmentation",
    content: <LabRevenueDashboard/>,
  },
  {
    label: "📖 Catalogue",
    content: <TopLabs/>,
  },
  {
    label: "📖 Test",
    content: <SalesDataRaw/>,
  },
];
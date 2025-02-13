// src/config/tabItems.ts

import SalesDataRaw from "@/components/JSON";
import LaboratoryDashboardGlobal from "@/components/laboratory/global/Dashboard";

export const tabItems = [
  {
    label: "📊 Global",
    content: <LaboratoryDashboardGlobal/>,
  },
  {
    label: "⭐ Produits",
    content: 'test',
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
    content: 'test',
  },
  {
    label: "📖 Catalogue",
    content: 'test',
  },
  {
    label: "📖 Test",
    content: <SalesDataRaw/>,
  },
];
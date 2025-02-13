import React, { useState } from "react";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number; // l'onglet initial actif
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className="w-full">
      {/* Barre d'onglets */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 text-sm transition
              ${
                index === activeIndex
                  ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="mt-4">{tabs[activeIndex].content}</div>
    </div>
  );
};

export default Tabs;
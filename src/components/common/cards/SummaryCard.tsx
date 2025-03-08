// components/ui/SummaryCard.tsx
import React, { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  iconColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, icon, children, iconColor = "text-teal-600" }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
      <h3 className={`text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 ${iconColor}`}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
};

export default SummaryCard;
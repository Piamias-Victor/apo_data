import React, { ReactNode } from "react";

interface ActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  variant: "primary" | "secondary" | "danger" | "success" | "warning";
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, children, variant }) => {
  const variantClasses = {
    primary: "bg-blue-50 text-blue-600 border-blue-500 hover:bg-blue-100",
    secondary: "bg-gray-50 text-gray-600 border-gray-500 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 border-red-500 hover:bg-red-100",
    success: "bg-teal-50 text-teal-600 border-teal-500 hover:bg-teal-100",
    warning: "bg-orange-50 text-orange-600 border-orange-500 hover:bg-orange-100"
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${variantClasses[variant]} px-4 py-2 rounded-md text-sm shadow-sm border transition`}
    >
      {icon}
      {children}
    </button>
  );
};

export default ActionButton;
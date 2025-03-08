import React, { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string; // par exemple "w-80" ou "w-96"
  footer?: ReactNode;
}

const BaseDrawer: React.FC<BaseDrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = "w-80", 
  footer 
}) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
      
      <div
        className={`fixed top-0 right-0 ${width} h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        
        {/* Footer (optionnel) */}
        {footer && <div className="border-t p-4">{footer}</div>}
      </div>
    </>
  );
};

export default BaseDrawer;
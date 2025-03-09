import React, { ReactNode, useEffect } from "react";
import { HiXMark } from "react-icons/hi2";

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
  footer?: ReactNode;
  position?: "right" | "left";
}

const BaseDrawer: React.FC<BaseDrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = "w-96", 
  footer,
  position = "right"
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Drawer container - fixed height with scroll */}
      <div 
        className={`absolute top-0 ${position === "right" ? "right-0" : "left-0"} ${width} h-full bg-white shadow-lg`}
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header - fixed */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <HiXMark className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
        
        {/* Footer - fixed at bottom if provided */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseDrawer;
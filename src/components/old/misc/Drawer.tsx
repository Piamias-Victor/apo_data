import React from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Drawer Content */}
      <motion.div
        className="w-80 bg-white h-full shadow-xl p-5 relative flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur le drawer
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Contenu du Drawer */}
        <div className="flex-1 overflow-y-auto mt-4">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default Drawer;
import React from "react";
import Link from "next/link";

type DrawerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg p-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="menu text-base-content">
          <li><Link href="/" onClick={onClose}>Accueil</Link></li>
          <li><Link href="/ventes" onClick={onClose}>Ventes</Link></li>
          <li><Link href="/pharmacies" onClick={onClose}>Pharmacies</Link></li>
          <li><Link href="/contact" onClick={onClose}>Contact</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default DrawerMenu;

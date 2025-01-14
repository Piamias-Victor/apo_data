import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaFilter } from "react-icons/fa";
import DrawerMenu from "./DrawerMenu";
import DrawerFilters from "./DrawerFilters";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="navbar-start">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="btn btn-ghost btn-circle hover:bg-gray-200 transition"
          >
            <FaBars className="h-5 w-5 text-primary" />
          </button>
        </div>
        <div className="navbar-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={35}
              height={35}
              className="w-9 h-9"
              priority
            />
            <span className="text-lg font-semibold text-primary">Apo Data</span>
          </Link>
        </div>
        <div className="navbar-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn btn-ghost btn-circle hover:bg-gray-200 transition"
          >
            <FaFilter className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* DRAWERS */}
      <DrawerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <DrawerFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
};

export default Header;

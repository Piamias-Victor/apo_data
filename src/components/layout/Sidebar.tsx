import React from "react";
import Link from "next/link";
import { FaFlask, FaChartLine, FaPills, FaTruck } from "react-icons/fa";

const sections = [
  {
    name: "Laboratoire",
    link: "/laboratory",
    icon: <FaFlask className="text-teal-500 text-2xl" />,
  },
  {
    name: "Marché",
    link: "/segmentation",
    icon: <FaChartLine className="text-blue-500 text-2xl" />,
  },
  {
    name: "Générique",
    link: "/generic",
    icon: <FaPills className="text-purple-500 text-2xl" />,
  },
  {
    name: "Grossiste",
    link: "/wholesaler",
    icon: <FaTruck className="text-orange-500 text-2xl" />,
  },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-20 h-screen bg-white shadow-md flex flex-col items-center py-6 fixed left-0 top-0 z-50">
      {/* ✅ Logo */}
      <Link href="/" className="mb-6">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
      </Link>

      {/* ✅ Navigation */}
      <nav className="flex flex-col space-y-6">
        {sections.map((section, index) => (
          <Link
            key={index}
            href={section.link}
            className="flex flex-col items-center text-gray-700 hover:text-gray-900 transition"
          >
            {section.icon}
            <span className="text-xs mt-2">{section.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
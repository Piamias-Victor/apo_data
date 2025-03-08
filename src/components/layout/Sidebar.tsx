import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaFlask, FaChartLine, FaPills, FaTruck } from "react-icons/fa";

const sections = [
  {
    name: "Laboratoire",
    link: "/laboratory",
    icon: <FaFlask className="text-2xl" />,
    activeColor: "text-teal-500",
    defaultColor: "text-gray-500",
  },
  {
    name: "Marché",
    link: "/segmentation",
    icon: <FaChartLine className="text-2xl" />,
    activeColor: "text-blue-500",
    defaultColor: "text-gray-500",
  },
  {
    name: "Générique",
    link: "/generic",
    icon: <FaPills className="text-2xl" />,
    activeColor: "text-purple-500",
    defaultColor: "text-gray-500",
  },
  {
    name: "Grossiste",
    link: "/wholesaler",
    icon: <FaTruck className="text-2xl" />,
    activeColor: "text-orange-500",
    defaultColor: "text-gray-500",
  },
];

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-20 h-screen bg-white shadow-md flex flex-col items-center py-6 fixed left-0 top-0 z-40">
      {/* Logo */}
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col space-y-8">
        {sections.map((section) => {
          const isActive = router.pathname.startsWith(section.link);
          
          return (
            <Link
              key={section.name}
              href={section.link}
              className={`flex flex-col items-center group transition-all ${
                isActive ? "scale-110" : "hover:scale-105"
              }`}
            >
              <div className={`${isActive ? section.activeColor : section.defaultColor} group-hover:${section.activeColor} transition-colors`}>
                {section.icon}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                isActive ? section.activeColor : "text-gray-600"
              } group-hover:${section.activeColor}`}>
                {section.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
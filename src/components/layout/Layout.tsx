import React, { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar"; // ✅ Import de la Sidebar

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex">
      {/* ✅ Sidebar à gauche */}
      <Sidebar />

      {/* ✅ Contenu principal */}
      <div className="flex-1 min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
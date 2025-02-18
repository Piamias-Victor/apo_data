import React, { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
};

export default Layout;

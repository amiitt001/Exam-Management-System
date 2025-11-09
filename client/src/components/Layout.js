import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <Sidebar isOpen={isOpen} />
      
      <div className="flex flex-col flex-1 lg:ml-64">
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />
        <div className="p-3 sm:p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

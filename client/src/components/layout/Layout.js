import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
               <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children} 
        </main>
      </div>
    </div>
  );
};

export default Layout;
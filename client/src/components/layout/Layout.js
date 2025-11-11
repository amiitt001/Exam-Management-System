import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// 'children' will be the page component (e.g., <Dashboard />)
const Layout = ({ children }) => {
  return (
    // Using Tailwind classes from your screenshot (sm:p-6, etc.)
    // You may need to adjust this to match your layout's CSS
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children} 
        </main>
      </div>
    </div>
  );
};

export default Layout;
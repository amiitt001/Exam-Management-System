import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import PublicNavbar from './PublicNavbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  // Define public routes where App Sidebar/Navbar should NOT appear
  const publicRoutes = ['/', '/about', '/contact', '/features'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <PublicNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  // App Layout
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => { }} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
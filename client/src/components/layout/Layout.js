import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import PublicNavbar from './PublicNavbar';
import ThreeBackground from '../ThreeBackground';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  // Define public routes where App Sidebar/Navbar should NOT appear
  const publicRoutes = ['/', '/about', '/contact', '/features'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent relative overflow-x-hidden">
        {/* Global Background Elements */}
        <div className="bg-canvas"></div>
        <div className="bg-grid"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <ThreeBackground />

        <PublicNavbar />
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>
      </div>
    );
  }

  // App Layout
  return (
    <div className="flex h-screen bg-void font-sans text-slate-200 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Global Background Elements for App Area */}
        <div className="bg-canvas opacity-50"></div>
        <div className="bg-grid"></div>

        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
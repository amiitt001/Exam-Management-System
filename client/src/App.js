import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import styles
import './styles/App.css';

// 2. Import Layout
import Layout from './components/layout/Layout';

// 3. Import Pages
import Dashboard from './pages/Dashboard';
import ExamPaperGenerator from './pages/ExamPaperGenerator';
import SeatingArrangement from './pages/SeatingArrangement';
import InvigilatorAllocation from './pages/InvigilatorAllocation';
import ExamSchedule from './pages/ExamSchedule';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate-paper" element={<ExamPaperGenerator />} />
          <Route path="/seating" element={<SeatingArrangement />} />
          <Route path="/invigilator" element={<InvigilatorAllocation />} />
          <Route path="/schedule" element={<ExamSchedule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
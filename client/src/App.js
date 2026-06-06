import React, { useEffect } from 'react';
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
import { Demo } from './components/Demo';


function App() {
  useEffect(() => {
    const wakeUpBackend = async () => {
      const endpoints = [
        `${(process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/$/, '')}/health`,
        'https://exam-management-system-api.onrender.com/health'
      ];
      endpoints.forEach(url => {
        console.log(`[Waking up backend] Ping: ${url}`);
        fetch(url, { mode: 'no-cors' }).catch(() => {});
      });
    };
    wakeUpBackend();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/demo" element={<Demo />} />

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
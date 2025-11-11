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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
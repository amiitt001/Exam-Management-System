import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";



import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ExamPaperGenerator from "./components/ExamPaperGenerator";
import SeatingArrangement from "./components/SeatingArrangement";
import InvigilatorAllocation from "./components/InvigilatorAllocation";
import ExamSchedule from "./components/ExamSchedule";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generator" element={<ExamPaperGenerator />} />
          <Route path="/seating" element={<SeatingArrangement />} />
          <Route path="/invigilation" element={<InvigilatorAllocation />} />
          <Route path="/schedule" element={<ExamSchedule />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- CORRECTED IMPORTS ---
import SeatingPlanner from '../components/seating/SeatingPlanner';
import '../styles/Seating.css'; 

function SeatingArrangement() {
  const [existingPlans, setExistingPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/seating-plans');
      setExistingPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDownload = async (planId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/seating-plan-pdf/${planId}`,
        { responseType: 'blob' }
      );
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Seating_Plan_${planId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="seating-page-container">
      
      <div className="create-plan-section">
        <h2>Create New Seating Plan</h2>
        <SeatingPlanner onPlanCreated={fetchPlans} />
      </div>

      <div className="view-plans-section">
        <h2>Generated Plans</h2>
        <div className="plans-list">
          {loading && <p>Loading plans...</p>}
          
          {existingPlans.length === 0 && !loading ? (
            <div className="empty-state">
              <p>No seating data found.</p>
              <p>Use the form to create a new seating plan.</p>
            </div>
          ) : (
            existingPlans.map((plan) => (
              <div key={plan._id} className="plan-item">
                <div>
                  <strong>{plan.planName}</strong>
                  <p>{plan.studentCount} Students in {plan.roomList.length} Rooms</p>
                  <small>Created on: {new Date(plan.createdAt).toLocaleString()}</small>
                </div>
                <button onClick={() => handleDownload(plan._id)} className="download-btn">
                  Download PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SeatingArrangement;
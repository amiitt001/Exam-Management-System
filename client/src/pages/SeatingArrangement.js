import React from 'react';
import SeatingPlanner from '../components/seating/SeatingPlanner';
import '../styles/Seating.css'; 

function SeatingArrangement() {
  return (
    <div className="seating-page-container">
      {/* This layout no longer needs two columns */}
      <div className="create-plan-section">
        {/* We pass 'onPlanCreated' so the form can refresh the list */}
        <SeatingPlanner />
      </div>
    </div>
  );
}

export default SeatingArrangement;
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/App.css'; // Assuming styles are here

function SeatingPlanner({ onPlanCreated }) { 
  const [studentFile, setStudentFile] = useState(null); 
  // --- STATE IS BACK TO 'capacity' ---
  const [rooms, setRooms] = useState([
    { name: 'D-007', capacity: 30 },
    { name: 'D-008', capacity: 30 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- UPDATED to handle 'capacity' ---
  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    // Add a new room with default 'capacity'
    setRooms([...rooms, { name: '', capacity: 30 }]);
  };

  const removeRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };
  
  const handleFileChange = (e) => {
    setStudentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      setError("Please upload a student file.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('studentFile', studentFile);
    
    // --- UPDATED to send 'capacity' ---
    const validRooms = rooms.filter(room => room.name.trim() !== '' && room.capacity > 0);
    formData.append('roomList', JSON.stringify(validRooms));

    try {
      const response = await axios.post(
        'http://localhost:5000/api/generate-seating',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success && onPlanCreated) {
        onPlanCreated(); 
      }
      
      setStudentFile(null); 
      e.target.reset(); 

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to generate plan.");
      } else {
        setError("Failed to generate plan. Check server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-form"> 
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Student File (CSV or PDF)</label>
          <input
            type="file"
            accept=".csv, .pdf"
            onChange={handleFileChange}
            required
            className="file-input"
          />
          <small>File must have 'rollNumber', 'branch', and 'year'/'semester' columns.</small>
        </div>

        <div className="form-group">
          <label>Available Rooms</label>
          {rooms.map((room, index) => (
            // --- UPDATED room inputs ---
            <div key={index} className="room-input">
              <input
                type="text"
                placeholder="Room Name (e.g., D-007)"
                value={room.name}
                onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Capacity (Total Seats)"
                value={room.capacity}
                onChange={(e) => handleRoomChange(index, 'capacity', e.target.value)}
                min="1"
                required
              />
              <button type="button" onClick={() => removeRoom(index)} className="remove-btn">
                X
              </button>
            </div>
          ))}
          <button type="button" onClick={addRoom} className="add-btn">
            + Add Room
          </button>
        </div>

        <button type="submit" disabled={loading} style={{marginTop: '1rem'}}>
          {loading ? 'Generating...' : 'Generate Seating Plan'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default SeatingPlanner;
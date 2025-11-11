import React, { useState } from 'react';
import axios from 'axios';

// --- CORRECTED IMPORT ---
// Assuming this form uses styles from your main App.css
import '../../styles/App.css'; 

function SeatingPlanner({ onPlanCreated }) { 
  const [studentList, setStudentList] = useState("R001\nR002\nR003");
  const [rooms, setRooms] = useState([
    { name: 'Room 101', capacity: 2 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, { name: '', capacity: 10 }]);
  };

  const removeRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const students = studentList.split('\n').filter(student => student.trim() !== '');
    const validRooms = rooms.filter(room => room.name.trim() !== '' && room.capacity > 0);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/generate-seating',
        { studentList: students, roomList: validRooms }
      );
      
      if (response.data.success && onPlanCreated) {
        onPlanCreated(); // Refresh the list on the parent page
      }
      
      setStudentList("");
      setRooms([{ name: '', capacity: 10 }]);

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

  // --- JSX REMAINS THE SAME ---
  return (
    <div className="exam-form"> 
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student Roll Numbers (one per line)</label>
          <textarea
            value={studentList}
            onChange={(e) => setStudentList(e.target.value)}
            rows={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Available Rooms</label>
          {rooms.map((room, index) => (
            <div key={index} className="room-input">
              <input
                type="text"
                placeholder="Room Name (e.g., 101)"
                value={room.name}
                onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
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
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>🏥 Hospital</h2>

      
      <Link to="/appointment">📅 Appointments</Link><br></br>
      <Link to="/department">🏢 Departments</Link><br></br>
      <Link to="/bloodbank">🩸Blood Bank</Link><br></br>
      <Link to="/ambulance">🚑 Ambulance</Link><br></br>
      <Link to="/organdonor">🫀Organ Donor</Link><br></br>
      <Link to="/patient-details">👤 Patient Details</Link><br></br>
      <Link to="/medicine">💊 Medicine</Link><br></br>
      <Link to="/Lab">🧪 Lab</Link><br></br>

      
      
    </div>
  );
}

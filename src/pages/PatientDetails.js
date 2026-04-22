import { useState, useEffect } from "react";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { auth, database } from "../firebase"; // Aapka existing firebase config
import { useNavigate } from "react-router-dom";
import "./PatientDetails.css"; // Nayi CSS file for styling

export default function PatientDetails() {
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "A+",
    contact: "",
    address: "",
    condition: "",
    bedNumber: "",
    wardType: "General",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Input handling
  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  // 🏥 Admit Patient Function
  const admitPatient = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Simple Validation
    if (!patientData.name || !patientData.bedNumber) {
      setError("Please fill all required fields (Name & Bed Number).");
      return;
    }

    try {
      // Firebase mein 'patients' node banayenge
      const patientsRef = ref(database, "patients");
      const newPatientRef = push(patientsRef); // Unique ID generate karega

      await set(newPatientRef, {
        ...patientData,
        admittedBy: auth.currentUser?.email || "Admin",
        admittedAt: serverTimestamp(),
        status: "Admitted",
      });

      setSuccess(`Patient ${patientData.name} admitted successfully to Bed ${patientData.bedNumber}!`);
      
      // Form reset
      setPatientData({
        name: "", age: "", gender: "Male", bloodGroup: "A+",
        contact: "", address: "", condition: "", bedNumber: "", wardType: "General"
      });

      // 2 seconds baad dashboard par redirect kar sakte hain
      setTimeout(() => navigate("/dashboard"), 2500);

    } catch (err) {
      setError("Failed to admit patient: " + err.message);
    }
  };

  return (
    <div className="admission-page">
      <div className="admission-card">
        <h2>Patient Admission Form</h2>
        <p className="sub-text">Fill details to allot a bed and admit patient</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={admitPatient} className="patient-form">
          <div className="form-grid">
            {/* Personal Info */}
            <div className="input-group">
              <label>Patient Full Name *</label>
              <input type="text" name="name" value={patientData.name} onChange={handleChange} placeholder="Enter name" required />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Age</label>
                <input type="number" name="age" value={patientData.age} onChange={handleChange} placeholder="Age" />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" value={patientData.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Contact Number</label>
              <input type="text" name="contact" value={patientData.contact} onChange={handleChange} placeholder="Phone number" />
            </div>

            <div className="input-group">
              <label>Medical Condition / Reason</label>
              <textarea name="condition" value={patientData.condition} onChange={handleChange} placeholder="Brief about illness" rows="2"></textarea>
            </div>

            {/* Bed Allotment Section */}
            <hr className="form-divider" />
            <h3 className="section-title">Bed Allotment</h3>

            <div className="form-row">
              <div className="input-group">
                <label>Ward Type</label>
                <select name="wardType" value={patientData.wardType} onChange={handleChange}>
                  <option>General</option>
                  <option>ICU</option>
                  <option>Emergency</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="input-group">
                <label>Bed Number *</label>
                <input type="text" name="bedNumber" value={patientData.bedNumber} onChange={handleChange} placeholder="e.g. B-102" required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-admit">Confirm Admission & Allot Bed</button>
          <button type="button" className="btn-back" onClick={() => navigate("/dashboard")}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
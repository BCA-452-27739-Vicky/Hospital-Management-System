import React, { useState } from "react";
import jsPDF from "jspdf";
import "./BloodBank.css";

const BloodBank = () => {
  // States
  const [bloodData, setBloodData] = useState([
    { group: "A+", status: "available", units: 10 },
    { group: "A-", status: "out", units: 0 },
    { group: "B+", status: "available", units: 5 },
    { group: "B-", status: "unavailable", units: 0 },
    { group: "AB+", status: "available", units: 8 },
    { group: "AB-", status: "out", units: 0 },
    { group: "O+", status: "available", units: 15 },
    { group: "O-", status: "unavailable", units: 0 }
  ]);
  
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    contact: "",
    age: "",
    gender: "",
    requirement: ""
  });
  
  const [admin, setAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newGroup, setNewGroup] = useState({ group: "", units: 0 });
  
  // New state for blood requests from cards
  const [bloodRequests, setBloodRequests] = useState([]);

  // Admin Login
  const handleAdminLogin = () => {
    if (adminPass === "admin123") {
      setIsAdmin(true);
      setAdminPass("");
      alert("Admin Login Successful!");
    } else {
      alert("Wrong Password!");
    }
  };

  // Add new blood group
  const addBloodGroup = () => {
    if (!newGroup.group) return;
    setBloodData([...bloodData, { ...newGroup, status: newGroup.units > 0 ? "available" : "out" }]);
    setNewGroup({ group: "", units: 0 });
  };

  // Update blood stock
  const updateStock = (index, units) => {
    const updated = [...bloodData];
    updated[index].units += units;
    updated[index].status = updated[index].units > 0 ? "available" : "out";
    setBloodData(updated);
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Blood Bank Receipt", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Name: ${form.name}`, 20, 40);
    doc.text(`Blood Group: ${form.bloodGroup}`, 20, 50);
    doc.text(`Contact: ${form.contact}`, 20, 60);
    doc.text(`Age: ${form.age}`, 20, 70);
    doc.text(`Gender: ${form.gender}`, 20, 80);
    doc.save(`${form.name}_blood_request.pdf`);
  };

  // Submit request from form
  const submitRequest = () => {
    if (!form.name || !form.bloodGroup || !form.contact || !form.age || !form.gender) {
      alert("Please fill all required fields");
      return;
    }
    generatePDF();
    alert("Request submitted! PDF downloaded.");
    setForm({ name: "", bloodGroup: "", contact: "", age: "", gender: "", requirement: "" });
  };

  // Handle blood request from card
  const handleCardRequest = (bloodGroup) => {
    const patientName = prompt("Enter your name:");
    if (!patientName) return;
    
    const contact = prompt("Enter your contact number:");
    if (!contact) return;
    
    const newRequest = {
      id: Date.now(),
      patientName,
      bloodGroup,
      contact,
      status: "pending",
      timestamp: new Date().toLocaleString()
    };
    
    setBloodRequests([...bloodRequests, newRequest]);
    alert(`Blood request for ${bloodGroup} sent to admin!`);
  };

  // Approve blood request
  const approveRequest = (requestId) => {
    const request = bloodRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // Find and update blood stock
    const bloodIndex = bloodData.findIndex(b => b.group === request.bloodGroup);
    if (bloodIndex !== -1 && bloodData[bloodIndex].units > 0) {
      const updated = [...bloodData];
      updated[bloodIndex].units -= 1;
      updated[bloodIndex].status = updated[bloodIndex].units > 0 ? "available" : "out";
      setBloodData(updated);
      
      // Remove the request
      setBloodRequests(bloodRequests.filter(req => req.id !== requestId));
      alert(`Request approved for ${request.patientName}`);
    } else {
      alert("Blood not available in stock!");
    }
  };

  // Reject blood request
  const rejectRequest = (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      setBloodRequests(bloodRequests.filter(req => req.id !== requestId));
      alert("Request rejected");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bb-header">
        <h1>🩸 Blood Bank</h1>
        <p>Safe Blood Saves Lives</p>
        
        {/* Admin Login */}
        <div className="admin-controls">
          {!isAdmin ? (
            <>
              <button onClick={() => setAdmin(!admin)}>
                {admin ? "Cancel Admin" : "Admin Login"}
              </button>
              {admin && (
                <div className="login-form">
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                  <button onClick={handleAdminLogin}>Login</button>
                  <small>Password: admin123</small>
                </div>
              )}
            </>
          ) : (
            <div className="admin-buttons">
              <button onClick={() => setIsAdmin(false)}>Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Admin Panel - Blood Requests */}
      {isAdmin && (
        <section className="admin-requests-panel">
          <h2>📋 Pending Blood Requests</h2>
          {bloodRequests.length === 0 ? (
            <p className="no-requests">No pending requests</p>
          ) : (
            <div className="requests-container">
              {bloodRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <span className="request-blood-group">{request.bloodGroup}</span>
                    <span className="request-status">{request.status}</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Patient:</strong> {request.patientName}</p>
                    <p><strong>Contact:</strong> {request.contact}</p>
                    <p><strong>Time:</strong> {request.timestamp}</p>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => approveRequest(request.id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => rejectRequest(request.id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add Blood Group Form */}
      {isAdmin && admin && (
        <div className="add-blood-form">
          <h3>➕ Add New Blood Group</h3>
          <input
            placeholder="Blood Group (e.g., A+1, B+2)"
            value={newGroup.group}
            onChange={(e) => setNewGroup({...newGroup, group: e.target.value})}
          />
          <input
            type="number"
            placeholder="Units"
            value={newGroup.units}
            onChange={(e) => setNewGroup({...newGroup, units: parseInt(e.target.value) || 0})}
          />
          <button onClick={addBloodGroup}>Add Group</button>
        </div>
      )}

      {/* Blood Inventory */}
      <section className="blood-container">
        {bloodData.map((b, i) => (
          <div className="blood-card" key={i}>
            <div className="blood-group">{b.group}</div>
            <div className={`status ${b.status}`}>
              {b.status === "available" ? "Available" : 
               b.status === "out" ? "Out of Stock" : "Unavailable"}
            </div>
            <div className="units">Units: {b.units}</div>
            
            {isAdmin ? (
              <div className="admin-actions">
                <button onClick={() => updateStock(i, 1)}>+1</button>
                <button onClick={() => updateStock(i, -1)}>-1</button>
                <button onClick={() => updateStock(i, 5)}>+5</button>
                <button onClick={() => updateStock(i, -5)}>-5</button>
              </div>
            ) : (
              <button 
                className="request-btn"
                onClick={() => {
                  if (b.status === "available") {
                    handleCardRequest(b.group);
                  } else {
                    alert(`${b.group} is ${b.status}`);
                  }
                }}
              >
                Request Blood
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Request Form */}
      <section className="request-form">
        <h2>🧾 Blood Request Form</h2>
        <input name="name" placeholder="Patient Name" value={form.name} onChange={handleChange} />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
          <option value="">Blood Group</option>
          {bloodData.map(bg => (
            <option key={bg.group}>{bg.group}</option>
          ))}
        </select>
        <textarea 
          name="requirement" 
          placeholder="Requirements (Optional)" 
          value={form.requirement} 
          onChange={handleChange}
        />
        <button onClick={submitRequest}>Submit & Download PDF 📄</button>
      </section>

      {/* Footer */}
      <footer>
        <p>© {new Date().getFullYear()} Hospital Blood Bank | Emergency: 108</p>
      </footer>
    </>
  );
};

export default BloodBank;
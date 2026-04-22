import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  Lock,
  LogOut,
  Trash2,
  PlusCircle,
  Activity,
  Heart,
  User,
  X,
} from "lucide-react";

import "./OrganDonor.css";

// Firebase
import { database } from "../firebase";
import { ref, push, set, onValue, remove } from "firebase/database";

const OrganDonor = () => {
  // --- States ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [patientNeeds, setPatientNeeds] = useState([]);
  const [newNeed, setNewNeed] = useState({
    organ: "",
    bloodGroup: "",
    urgency: "Normal",
  });

  const [form, setForm] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    organ: "",
    contact: "",
    gender: "Male",
    aadhar: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH PATIENT NEEDS FROM FIREBASE
  // ===============================
  useEffect(() => {
    const needsRef = ref(database, "patientNeeds");

    onValue(needsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const needsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setPatientNeeds(needsArray);
      } else {
        setPatientNeeds([]);
      }
    });
  }, []);

  // ===============================
  // LOGIN LOGIC
  // ===============================
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsAdmin(true);
      setShowLogin(false);
      setCredentials({ username: "", password: "" });
      alert("Login Successful! Welcome Admin.");
    } else {
      alert("Invalid Username or Password!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    alert("Logged out successfully.");
  };

  // ===============================
  // ADMIN LOGIC (ADD NEED)
  // ===============================
  const handleAddNeed = async (e) => {
    e.preventDefault();

    if (!newNeed.organ || !newNeed.bloodGroup) {
      return alert("Please fill all details");
    }

    try {
      const needRef = push(ref(database, "patientNeeds"));

      await set(needRef, {
        organ: newNeed.organ,
        bloodGroup: newNeed.bloodGroup,
        urgency: newNeed.urgency,
        createdAt: Date.now(),
      });

      alert("Requirement Added Successfully!");
      setNewNeed({ organ: "", bloodGroup: "", urgency: "Normal" });
    } catch (error) {
      console.log(error);
      alert("Failed to add requirement!");
    }
  };

  // ===============================
  // ADMIN LOGIC (REMOVE NEED)
  // ===============================
  const handleRemoveNeed = async (id) => {
    try {
      await remove(ref(database, `patientNeeds/${id}`));
    } catch (error) {
      console.log(error);
      alert("Failed to delete requirement!");
    }
  };

  // ===============================
  // USER FORM LOGIC
  // ===============================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ===============================
  // PDF GENERATOR + SAVE TO FIREBASE
  // ===============================
  const generatePDF = async (e) => {
    e.preventDefault();

    if (!photo) return alert("Please upload a photo.");
    if (!form.name || !form.aadhar || !form.address) {
      return alert("Please fill all fields properly!");
    }

    setLoading(true);

    // SAVE DONOR DATA TO FIREBASE
    try {
      const donorRef = push(ref(database, "organDonors"));

      await set(donorRef, {
        name: form.name,
        age: form.age,
        bloodGroup: form.bloodGroup,
        organ: form.organ,
        contact: form.contact,
        gender: form.gender,
        aadhar: form.aadhar,
        address: form.address,
        photo: photo,
        createdAt: Date.now(),
      });

      console.log("Donor saved successfully in Firebase!");
    } catch (error) {
      console.log(error);
      alert("Firebase Save Failed!");
      setLoading(false);
      return;
    }

    // CREATE PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 54],
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 85.6, 54, "F");

    // Header
    doc.setFillColor(220, 53, 69);
    doc.rect(0, 0, 85.6, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ORGAN DONOR CARD", 42.8, 7, { align: "center" });

    // Photo
    doc.addImage(photo, "JPEG", 3, 15, 22, 26);
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(0.5);
    doc.rect(3, 15, 22, 26);

    // Text data
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6.5);

    let y = 18;
    const xL = 28;
    const xV = 48;

    // Name
    doc.setFont("helvetica", "bold");
    doc.text("Name:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.name.toUpperCase(), xV, y);

    // Aadhar
    y += 3.5;
    doc.setFont("helvetica", "bold");
    doc.text("Aadhar No:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.aadhar, xV, y);

    // Blood Group
    y += 3.5;
    doc.setFont("helvetica", "bold");
    doc.text("Blood Group:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 53, 69);
    doc.text(form.bloodGroup, xV, y);
    doc.setTextColor(0, 0, 0);

    // Organ
    y += 3.5;
    doc.setFont("helvetica", "bold");
    doc.text("Organ:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.organ, xV, y);

    // Contact
    y += 3.5;
    doc.setFont("helvetica", "bold");
    doc.text("Contact:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.text(form.contact, xV, y);

    // Address
    y += 3.5;
    doc.setFont("helvetica", "bold");
    doc.text("City/Addr:", xL, y);
    doc.setFont("helvetica", "normal");

    const address =
      form.address.length > 20
        ? form.address.substring(0, 18) + "..."
        : form.address;

    doc.text(address, xV, y);

    // Donor ID
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Donor ID:", xL, y);
    doc.setFont("helvetica", "normal");
    doc.text(`OD-${Math.floor(Math.random() * 10000)}`, xV, y);

    // Footer
    doc.setFontSize(5);
    doc.setTextColor(100);
    doc.text('"A Gift of Life Pass It On"', 42.8, 50, { align: "center" });

    doc.save(`${form.name}_DonorCard.pdf`);

    setLoading(false);

    alert("Donor Registered Successfully & PDF Downloaded!");

    // Reset form
    setForm({
      name: "",
      age: "",
      bloodGroup: "",
      organ: "",
      contact: "",
      gender: "Male",
      aadhar: "",
      address: "",
    });
    setPhoto(null);
  };

  return (
    <div className="donor-container">
      {/* Navbar / Top Bar */}
      <div className="top-bar">
        <div className="logo">🏥 LifeSaver Network</div>

        {isAdmin ? (
          <button className="admin-toggle logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <button
            className="admin-toggle login"
            onClick={() => setShowLogin(true)}
          >
            <Lock size={16} /> Admin Login
          </button>
        )}
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="close-modal"
              onClick={() => setShowLogin(false)}
            >
              <X size={20} />
            </button>
            <h2>Admin Access</h2>
            <p>Enter credentials to manage requirements.</p>

            <form onSubmit={handleLoginSubmit}>
              <div className="modal-input">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your Username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      username: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-input">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <button type="submit" className="login-btn">
                Login Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      {isAdmin ? (
        // ADMIN DASHBOARD
        <div className="admin-dashboard fade-in">
          <div className="admin-header">
            <h2>
              <Activity color="#d63031" /> Admin Control Panel
            </h2>
            <p>Manage urgent organ requirements visible to users.</p>
          </div>

          <div className="admin-content">
            <div className="admin-card add-section">
              <h3>Add New Requirement</h3>

              <form onSubmit={handleAddNeed}>
                <label>Organ Needed</label>
                <select
                  value={newNeed.organ}
                  onChange={(e) =>
                    setNewNeed({ ...newNeed, organ: e.target.value })
                  }
                  required
                >
                  <option value="">Select Organ</option>
                  <option>Kidney</option>
                  <option>Liver</option>
                  <option>Heart</option>
                  <option>Lungs</option>
                  <option>Eyes</option>
                </select>

                <label>Blood Group</label>
                <select
                  value={newNeed.bloodGroup}
                  onChange={(e) =>
                    setNewNeed({ ...newNeed, bloodGroup: e.target.value })
                  }
                  required
                >
                  <option value="">Select Group</option>
                  <option>A+</option>
                  <option>B+</option>
                  <option>O+</option>
                  <option>AB+</option>
                  <option>Any</option>
                </select>

                <label>Urgency Level</label>
                <select
                  value={newNeed.urgency}
                  onChange={(e) =>
                    setNewNeed({ ...newNeed, urgency: e.target.value })
                  }
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>

                <button type="submit" className="add-btn">
                  <PlusCircle size={18} /> Update List
                </button>
              </form>
            </div>

            <div className="admin-card list-section">
              <h3>Active Patient Needs</h3>

              {patientNeeds.length === 0 ? (
                <p className="empty-text">No active needs.</p>
              ) : (
                <ul className="needs-list">
                  {patientNeeds.map((item) => (
                    <li
                      key={item.id}
                      className={`need-item ${item.urgency.toLowerCase()}`}
                    >
                      <div className="need-info">
                        <span className="organ-name">{item.organ}</span>
                        <span className="blood-badge">{item.bloodGroup}</span>
                        <span className="urgency-badge">{item.urgency}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveNeed(item.id)}
                        className="delete-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        // USER VIEW
        <div className="donor-card-wrapper fade-in">
          <div className="donor-info-side">
            <h1>Give Life.</h1>
            <p>Donate organs and save lives.</p>

            <div className="heart-icon">
              <Heart size={80} fill="white" />
            </div>

            {/* Live Updates */}
            <div className="urgent-needs-box">
              <h4>⚠️ Live Hospital Requirements</h4>

              <div className="scrolling-needs">
                {patientNeeds.length > 0 ? (
                  patientNeeds.map((item) => (
                    <div key={item.id} className="need-tag">
                      {item.organ} ({item.bloodGroup}){" "}
                      <span className="urgent-dot">•</span> {item.urgency}
                    </div>
                  ))
                ) : (
                  <span>No urgent requirements. All clear.</span>
                )}
              </div>
            </div>
          </div>

          <div className="donor-form-side">
            <h2>
              <User size={24} /> Donor Registration
            </h2>
            <p className="sub-text">Generate your official ID Card.</p>

            <form onSubmit={generatePDF}>
              <div className="profile-upload">
                <label htmlFor="photoInput">
                  {photo ? (
                    <img src={photo} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="placeholder-img">
                      <span>+ Photo</span>
                    </div>
                  )}
                </label>
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <div className="form-grid">
                <div className="input-box">
                  <label>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Donor Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Age</label>
                  <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>Aadhar Number</label>
                  <input
                    name="aadhar"
                    type="text"
                    placeholder="12-digit number"
                    value={form.aadhar}
                    onChange={handleChange}
                    required
                    maxLength="12"
                  />
                </div>

                <div className="input-box">
                  <label>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>A+</option>
                    <option>B+</option>
                    <option>O+</option>
                    <option>AB+</option>
                  </select>
                </div>

                <div className="input-box">
                  <label>Organ</label>
                  <select
                    name="organ"
                    value={form.organ}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>Kidney</option>
                    <option>Liver</option>
                    <option>Heart</option>
                    <option>Eyes</option>
                    <option>Lungs</option>
                  </select>
                </div>

                <div className="input-box">
                  <label>Mobile</label>
                  <input
                    name="contact"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.contact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-box" style={{ marginTop: "15px" }}>
                <label>Full Address</label>
                <input
                  name="address"
                  type="text"
                  placeholder="City, State"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="generate-btn" disabled={loading}>
                {loading ? "Processing..." : "Download ID Card"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganDonor;
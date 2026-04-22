import React, { useState } from "react";
import { database } from "../firebase";
import { ref, push, set } from "firebase/database";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Ambulance.css";

const Ambulance = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    type: "Basic Ambulance",
    location: "",
    emergencyNote: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const ambulanceWhatsAppNumber = "7069163824"; 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const call108 = () => {
    window.location.href = "tel:108";
  };

  const call102 = () => {
    window.location.href = "tel:102";
  };

  // ✅ PDF Generate Function
  const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("RapidRescue Ambulance Booking", 14, 15);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 25);

  // ✅ Correct usage
  autoTable(doc, {
    startY: 35,
    head: [["Field", "Details"]],
    body: [
      ["Patient Name", form.name],
      ["Phone", form.phone],
      ["Age", form.age],
      ["Gender", form.gender],
      ["Ambulance Type", form.type],
      ["Pickup Location", form.location],
      ["Emergency Note", form.emergencyNote],
    ],
  });

  doc.save("Ambulance_Booking.pdf");
};

  // ✅ WhatsApp Send Function
  const sendToWhatsApp = () => {
    if (!form.name || !form.phone || !form.location) {
      alert("Please fill all required details first!");
      return;
    }

    const message = `🚑 *RapidRescue Ambulance Booking*  
--------------------------------  
👤 Patient Name: ${form.name}  
📞 Phone: ${form.phone}  
🎂 Age: ${form.age}  
⚥ Gender: ${form.gender}  
🚑 Ambulance Type: ${form.type}  
📍 Pickup Location: ${form.location}  
📝 Emergency Note: ${form.emergencyNote}  
--------------------------------  
📌 Google Maps Location Link:  
https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.location)}
`;

    const url = `https://wa.me/${ambulanceWhatsAppNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  };

  // ✅ Firebase Save Booking
  const bookAmbulance = async () => {
    if (!form.name || !form.phone || !form.location) {
      alert("Please fill all required details");
      return;
    }

    try {
      setLoading(true);

      const bookingRef = push(ref(database, "ambulanceBookings"));

      await set(bookingRef, {
        ...form,
        status: "Booked",
        createdAt: new Date().toISOString(),
      });

      setStatus("✅ Ambulance booked! Data saved in Firebase.");

      setForm({
        name: "",
        phone: "",
        age: "",
        gender: "Male",
        type: "Basic Ambulance",
        location: "",
        emergencyNote: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error booking ambulance. Please Call 108.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ambulance-container">

      {/* Header */}
      <header className="header">
        <div className="logo">🚑 RapidRescue</div>

        <div className="header-btns">
          <button className="call-btn" onClick={call108}>📞 Call 108</button>
          <button className="call-btn call102" onClick={call102}>📞 Call 102</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="siren-icon">🚨</div>
          <h1> 🚑  Emergency? Book Ambulance Instantly</h1>
          <p>Fast Response • 24/7 Available • Trusted Service</p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="booking-section">
        <div className="booking-card">
          <h2>🚑 Ambulance Booking Form</h2>
          <p>Fill patient details and confirm booking instantly</p>

          <input
            name="name"
            placeholder="Patient Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="phone"
            type="text"
            placeholder="Mobile Number"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
          />

          <select name="gender" value={form.gender} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <select name="type" value={form.type} onChange={handleChange}>
            <option>Basic Ambulance</option>
            <option>ICU Ambulance</option>
            <option>Ventilator Ambulance</option>
            <option>Dead Body Ambulance</option>
          </select>

          <textarea
            name="location"
            placeholder="Exact Pickup Location (House No, Street, Landmark)"
            value={form.location}
            onChange={handleChange}
          />

          <textarea
            name="emergencyNote"
            placeholder="Emergency Note (Optional)"
            value={form.emergencyNote}
            onChange={handleChange}
          />

          <button className="book-btn" onClick={bookAmbulance} disabled={loading}>
            {loading ? "Saving..." : "🚑 Confirm Booking"}
          </button>

          <button className="pdf-btn" onClick={generatePDF}>
            🖨️ Download / Print PDF
          </button>

          <button className="whatsapp-btn" onClick={sendToWhatsApp}>
            📲 Send Details to WhatsApp
          </button>

          {status && <div className="status-message">{status}</div>}
        </div>
      </section>

      <footer>
        <p>© 2025 RapidRescue | Saving Lives 24/7</p>
      </footer>
    </div>
  );
};

export default Ambulance;
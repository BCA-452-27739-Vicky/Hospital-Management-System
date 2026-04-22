import React, { useEffect, useState } from "react";
import { ref, set, get, child } from "firebase/database";
import { database, auth } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Appointment.css";

const departments = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology",
  "Gynecology", "ENT", "General Medicine", "Dentistry", "Ophthalmology"
];

const doctorsByDepartment = {
  Cardiology: ["Dr. Sharma", "Dr. Verma", "Dr. Singh"],
  Neurology: ["Dr. Patel", "Dr. Joshi"],
  Orthopedics: ["Dr. Gupta", "Dr. Reddy"],
  Pediatrics: ["Dr. Kapoor", "Dr. Mehta"],
  Dermatology: ["Dr. Choudhary", "Dr. Nair"],
  Gynecology: ["Dr. Desai", "Dr. Iyer"],
  ENT: ["Dr. Khan", "Dr. Malhotra"],
  "General Medicine": ["Dr. Rao", "Dr. Tiwari"],
  Dentistry: ["Dr. Agarwal", "Dr. Shah"],
  Ophthalmology: ["Dr. Mishra", "Dr. Bose"],
};

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function Appointment() {
  const [formData, setFormData] = useState({
    patientName: "", age: "", gender: "", contact: "",
    department: "", doctor: "", date: "", time: "",
    disease: "", symptoms: "", address: "", emergencyContact: ""
  });

  const [bookedSlots, setBookedSlots] = useState([]);

  
  const getSafePath = (str) => str.replace(/[.#$[\]]/g, "_");

  const appointmentId = () => `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFormData((p) => ({ ...p, department: value, doctor: "", time: "" }));
    } else if (name === "doctor" || name === "date") {
      setFormData((p) => ({ ...p, [name]: value, time: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctor || !formData.date || !formData.department) {
        setBookedSlots([]);
        return;
      }

      try {
        
        const safeDept = getSafePath(formData.department);
        const safeDoc = getSafePath(formData.doctor);
        const safeDate = getSafePath(formData.date);

        const snapshot = await get(
          child(ref(database), `bookedSlots/${safeDept}/${safeDoc}/${safeDate}`)
        );

        if (snapshot.exists()) {
          
          setBookedSlots(Object.keys(snapshot.val()).map(t => t.replace(/_/g, ":")));
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error("Slot fetch error:", err);
      }
    };

    fetchSlots();
  }, [formData.department, formData.doctor, formData.date]);

  const validate = () => {
    if (!auth.currentUser) return "Please login first!";
    if (!formData.patientName.trim()) return "Patient name required!";
    if (!formData.age) return "Age required!";
    if (!formData.gender) return "Gender required!";
    if (!formData.contact || formData.contact.length < 10) return "Valid contact required!";
    if (!formData.department) return "Department required!";
    if (!formData.doctor) return "Doctor required!";
    if (!formData.date) return "Date required!";
    if (!formData.time) return "Time required!";
    if (!formData.disease.trim()) return "Disease required!";
    
    if (bookedSlots.includes(formData.time)) return "This slot is already booked!";
    return null;
  };

  const generatePDF = (id) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("GANPATI HOSPITAL", 105, 15, null, null, "center");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Appointment Receipt", 105, 23, null, null, "center");
    doc.line(20, 28, 190, 28);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Appointment ID: ${id}`, 20, 38);
    doc.text(`Booked: ${new Date().toLocaleDateString()}`, 140, 38);

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: [
        ["Patient", formData.patientName],
        ["Age", formData.age],
        ["Gender", formData.gender],
        ["Contact", formData.contact],
        ["Department", formData.department],
        ["Doctor", formData.doctor],
        ["Date", formData.date],
        ["Time", formData.time],
        ["Disease", formData.disease],
        ["Symptoms", formData.symptoms || "N/A"],
        ["Emergency Contact", formData.emergencyContact || "N/A"],
        ["Address", formData.address || "N/A"],
        ["Status", "Confirmed"],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save(`Appointment_${id}.pdf`);
  };

  const bookAppointment = async () => {
    const err = validate();
    if (err) return alert(err);

    const userId = auth.currentUser.uid;
    const userEmail = auth.currentUser.email;
    const id = appointmentId();

    
    const safeDept = getSafePath(formData.department);
    const safeDoc = getSafePath(formData.doctor);
    const safeDate = getSafePath(formData.date);
    const safeTime = getSafePath(formData.time);

    try {
      await set(ref(database, `appointments/${userId}/${id}`), {
        ...formData,
        appointmentId: id,
        userId,
        userEmail,
        status: "Confirmed",
        bookedAt: new Date().toISOString(),
      });

      await set(
        ref(database, `bookedSlots/${safeDept}/${safeDoc}/${safeDate}/${safeTime}`),
        {
          appointmentId: id,
          userId,
          bookedAt: new Date().toISOString(),
        }
      );

      alert("✅ Appointment Booked Successfully!");
      generatePDF(id);

      setFormData({
        patientName: "", age: "", gender: "", contact: "",
        department: "", doctor: "", date: "", time: "",
        disease: "", symptoms: "", address: "", emergencyContact: ""
      });

    } catch (error) {
      alert("❌ Booking Failed: " + error.message);
    }
  };

  return (
    <div className="appointment-page">
      <div className="appointment-header">
        <h2>Book Medical Appointment</h2>
        <p>Select department, doctor & available slot</p>
      </div>

      <div className="appointment-card">
        <div className="appointment-grid">
          <div className="appointment-section">
            <h4>Patient Information</h4>
            <label>Full Name *</label>
            <input name="patientName" value={formData.patientName} onChange={handleChange} />
            <div className="two-grid">
              <div>
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div>
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <label>Contact *</label>
            <input name="contact" value={formData.contact} onChange={handleChange} />
            <label>Emergency Contact</label>
            <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
            <label>Address</label>
            <textarea name="address" rows="3" value={formData.address} onChange={handleChange} />
          </div>

          <div className="appointment-section">
            <h4>Medical Information</h4>
            <label>Department *</label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option value="">Choose</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <label>Doctor *</label>
            <select name="doctor" value={formData.doctor} onChange={handleChange} disabled={!formData.department}>
              <option value="">Choose</option>
              {doctorsByDepartment[formData.department]?.map((doc) => (
                <option key={doc}>{doc}</option>
              ))}
            </select>
            <div className="two-grid">
              <div>
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Time Slot *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!formData.doctor || !formData.date}
                >
                  <option value="">Select</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t} disabled={bookedSlots.includes(t)}>
                      {t} {bookedSlots.includes(t) ? "(Booked)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label>Disease/Condition *</label>
            <input name="disease" value={formData.disease} onChange={handleChange} />
            <label>Symptoms</label>
            <textarea name="symptoms" rows="4" value={formData.symptoms} onChange={handleChange} />
          </div>
        </div>

        <div className="appointment-buttons">
          <button className="btn-print" onClick={() => window.print()}>🖨️ Print Form</button>
          <button className="btn-book" onClick={bookAppointment}>📅 Book & Download PDF</button>
        </div>
      </div>
    </div>
  );
}
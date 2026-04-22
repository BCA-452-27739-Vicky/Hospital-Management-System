import React, { useEffect, useState } from "react";
import "./Lab.css";

import { database } from "../firebase";
import { ref, push, set, get, remove, child } from "firebase/database";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Lab = () => {
  const testList = [
    { testName: "X-Ray", price: 500 },
    { testName: "Blood Checkup", price: 800 },
    { testName: "Urine Checkup", price: 300 },
    { testName: "Bone Fracture Checkup", price: 1200 },
    { testName: "Cold & Cough Checkup", price: 200 },
    { testName: "ECG", price: 600 },
    { testName: "Sugar Test", price: 250 },
    { testName: "Thyroid Test", price: 900 },
    { testName: "BP Checkup", price: 100 },
    { testName: "CT Scan", price: 2500 },
    { testName: "MRI Scan", price: 5000 },
    { testName: "Liver Function Test (LFT)", price: 1500 },
    { testName: "Kidney Function Test (KFT)", price: 1400 },
    { testName: "Vitamin D Test", price: 1800 },
    { testName: "Cholesterol Test", price: 700 },
    { testName: "Dengue Test", price: 900 },
    { testName: "Malaria Test", price: 600 },
  ];

  const [records, setRecords] = useState([]);

  const [patient, setPatient] = useState({
    name: "",
    phone: "+91",
    age: "",
    gender: "Male",
    address: "",
    doctor: "",
    date: new Date().toLocaleDateString(),
    tests: [],
    total: 0,
  });

  // ---------------- PDF RECEIPT ----------------
  const generateReceiptPDF = (data) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Hospital Lab Receipt", 70, 15);

    doc.setFontSize(12);
    doc.text(`Patient Name: ${data.name}`, 15, 30);
    doc.text(`Phone: ${data.phone}`, 15, 38);
    doc.text(`Age: ${data.age}`, 15, 46);
    doc.text(`Gender: ${data.gender}`, 15, 54);
    doc.text(`Doctor: ${data.doctor}`, 15, 62);
    doc.text(`Address: ${data.address}`, 15, 70);
    doc.text(`Date: ${data.date}`, 15, 78);

    autoTable(doc, {
      startY: 90,
      head: [["Test Name", "Price"]],
      body: data.tests.map((t) => [t.testName, `Rs.${t.price}`]),
    });

    doc.text(
      `Total Amount: Rs.${data.total}`,
      15,
      doc.lastAutoTable.finalY + 15
    );

    doc.save(`${data.name}_Receipt.pdf`);
  };

  // ---------------- PDF REPORT ----------------
  const generateReportPDF = (data) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Hospital Lab Report", 70, 15);

    doc.setFontSize(12);
    doc.text(`Patient Name: ${data.name}`, 15, 30);
    doc.text(`Phone: ${data.phone}`, 15, 38);
    doc.text(`Doctor: ${data.doctor}`, 15, 46);
    doc.text(`Date: ${data.date}`, 15, 54);

    autoTable(doc, {
      startY: 70,
      head: [["Test Name", "Result", "Status"]],
      body: data.tests.map((t) => [
        t.testName,
        t.result ? t.result : "Pending",
        t.result ? "Completed" : "Pending",
      ]),
    });

    doc.text(
      "NOTE: This is a computer-generated report.",
      15,
      doc.lastAutoTable.finalY + 20
    );

    doc.save(`${data.name}_Report.pdf`);
  };

  // ---------------- FETCH RECORDS ----------------
  const fetchRecords = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "labPatients"));

      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setRecords(formattedData.reverse());
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // ---------------- ADD TEST ----------------
  const handleTestSelect = (test) => {
    const exists = patient.tests.find((t) => t.testName === test.testName);
    if (exists) return;

    const updatedTests = [...patient.tests, test];
    const totalAmount = updatedTests.reduce((sum, t) => sum + t.price, 0);

    setPatient({ ...patient, tests: updatedTests, total: totalAmount });
  };

  // ---------------- REMOVE TEST ----------------
  const handleRemoveTest = (testName) => {
    const updatedTests = patient.tests.filter((t) => t.testName !== testName);
    const totalAmount = updatedTests.reduce((sum, t) => sum + t.price, 0);

    setPatient({ ...patient, tests: updatedTests, total: totalAmount });
  };

  // ---------------- SUBMIT FORM ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !patient.name ||
      !patient.phone ||
      !patient.age ||
      !patient.address ||
      !patient.doctor ||
      patient.tests.length === 0
    ) {
      alert("Please fill all details and select at least one test!");
      return;
    }

    try {
      const newRef = push(ref(database, "labPatients"));
      await set(newRef, patient);

      alert("Patient Record Saved Successfully!");
      generateReceiptPDF(patient);

      setPatient({
        name: "",
        phone: "",
        age: "",
        gender: "Male",
        address: "",
        doctor: "",
        date: new Date().toLocaleDateString(),
        tests: [],
        total: 0,
      });

      fetchRecords();
    } catch (error) {
      console.log(error);
      alert("Error saving record!");
    }
  };

  // ---------------- DELETE RECORD ----------------
  const deleteRecord = async (id) => {
    try {
      await remove(ref(database, `labPatients/${id}`));
      alert("Record Deleted Successfully!");
      fetchRecords();
    } catch (error) {
      console.log(error);
      alert("Error deleting record!");
    }
  };

  return (
    <div className="lab-container">
      <div className="lab-header">
        <h1>🏥  Ganpati Hospital Lab Management</h1>
        <p>Register Patients, Select Tests, Generate PDF Receipt & Reports</p>
      </div>

      {/* FORM */}
      <div className="lab-card">
        <h2>🧾 Patient Registration Form</h2>

        <form onSubmit={handleSubmit} className="lab-form">
          <div className="lab-grid">
            <div>
              <label>Patient Name</label>
              <input
                type="text"
                value={patient.name}
                onChange={(e) =>
                  setPatient({ ...patient, name: e.target.value })
                }
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                type="text"
                value={patient.phone}
                onChange={(e) =>
                  setPatient({ ...patient, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label>Age</label>
              <input
                type="number"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                placeholder="Enter age"
              />
            </div>

            <div>
              <label>Gender</label>
              <select
                value={patient.gender}
                onChange={(e) =>
                  setPatient({ ...patient, gender: e.target.value })
                }
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                value={patient.date}
                onChange={(e) =>
                  setPatient({ ...patient, date: e.target.value })
                }
                placeholder="Enter date"
              />
            </div>

            
            
            <div>
              <label>Doctor Name</label>
              <input
                type="text"
                value={patient.doctor}
                onChange={(e) =>
                  setPatient({ ...patient, doctor: e.target.value })
                }
                placeholder="Enter doctor name"
              />
            </div>

            
            
            
            
            <div>
              <label>Address</label>
              <input
                type="text"
                value={patient.address}
                onChange={(e) =>
                  setPatient({ ...patient, address: e.target.value })
                }
                placeholder="Enter patient address"
              />
            </div>
          </div>

          <h3 className="lab-subtitle">🧪 Select Lab Tests</h3>

          <div className="lab-test-grid">
            {testList.map((test, index) => (
              <button
                type="button"
                key={index}
                className="test-btn"
                onClick={() => handleTestSelect(test)}
              >
                {test.testName} <br /> (Rs{test.price})
              </button>
            ))}
          </div>

          <h3 className="lab-subtitle">📌 Selected Tests</h3>

          {patient.tests.length === 0 ? (
            <p className="empty-msg">No test selected yet.</p>
          ) : (
            <div className="selected-tests">
              {patient.tests.map((t, i) => (
                <div className="selected-test-card" key={i}>
                  <p>
                    <b>{t.testName}</b> - Rs{t.price}
                  </p>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveTest(t.testName)}
                  >
                    ❌ Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 className="total-amount">Total: Rs{patient.total}</h2>

          <button type="submit" className="submit-btn">
            Save Patient & Download Receipt PDF
          </button>
        </form>
      </div>

      {/* RECORDS */}
      <div className="lab-card">
        <h2>📂 Patient Records</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Tests</th>
                <th>Total</th>
                <th>Receipt</th>
                <th>Report</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {records.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.tests?.map((t) => t.testName).join(", ")}</td>
                  <td>₹{p.total}</td>

                  <td>
                    <button
                      className="download-btn"
                      onClick={() => generateReceiptPDF(p)}
                    >
                      Receipt
                    </button>
                  </td>

                  <td>
                    <button
                      className="report-btn"
                      onClick={() => generateReportPDF(p)}
                    >
                      Report
                    </button>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteRecord(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {records.length === 0 && (
            <p className="empty-msg">No records found in database.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lab;
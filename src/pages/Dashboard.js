import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [appointments, setAppointments] = useState(0);
  const [ambulance, setAmbulance] = useState(0);
  const [patients, setPatients] = useState(0);

  // ✅ NEW STATES
  const [patientDetails, setPatientDetails] = useState(0);
  const [organDonors, setOrganDonors] = useState(0);
  const [bloodBank, setBloodBank] = useState(0);
  const [labTests, setLabTests] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // A. Users
        onValue(ref(database, "users"), (snap) => {
          setTotalUsers(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // B. Appointments
        onValue(ref(database, "appointments"), (snap) => {
          if (snap.exists()) {
            const data = snap.val();
            let count = 0;

            Object.values(data).forEach((item) => {
              count += typeof item === "object" ? Object.keys(item).length : 1;
            });

            setAppointments(count);
          } else {
            setAppointments(0);
          }
        });

        // C. Ambulance
        onValue(ref(database, "ambulanceBookings"), (snap) => {
          setAmbulance(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // D. Patients
        onValue(ref(database, "patients"), (snap) => {
          setPatients(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // ✅ E. Patient Details
        onValue(ref(database, "patients"), (snap) => {
          setPatientDetails(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // ✅ F. Organ Donors
        onValue(ref(database, "organDonors"), (snap) => {
          setOrganDonors(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // ✅ G. Blood Bank
        onValue(ref(database, "Blood Bank"), (snap) => {
          setBloodBank(snap.exists() ? Object.keys(snap.val()).length : 0);
        });

        // ✅ H. Lab Tests
        onValue(ref(database, "labPatients"), (snap) => {
          setLabTests(snap.exists() ? Object.keys(snap.val()).length : 0);
          setLoading(false);
        });

        // Safety timeout
        setTimeout(() => setLoading(false), 3000);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ UPDATED CHART DATA
  const chartData = {
    labels: [
      "Users",
      "Appointments",
      "Patients",
      "Ambulance",
      "PatientDetails",
      "Organ Donor",
      "Blood Bank",
      "Lab",
    ],
    datasets: [
      {
        label: "Hospital Live Statistics",
        data: [
          totalUsers,
          appointments,
          patients,
          ambulance,
          patientDetails,
          organDonors,
          bloodBank,
          labTests,
        ],
        backgroundColor: [
          "#38bdf8",
          "#f87171",
          "#4ade80",
          "#fbbf24",
          "#a78bfa",
          "#fb7185",
          "#60a5fa",
          "#34d399",
        ],
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">Hospital Admin Dashboard</h1>

        {loading ? (
          <div className="loading-spinner">Connecting to Database...</div>
        ) : (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <h5>Total Users</h5>
                <h2>{totalUsers}</h2>
              </div>

              <div className="stat-card">
                <h5>Appointments</h5>
                <h2>{appointments}</h2>
              </div>

              <div className="stat-card card-green">
                <h5>Admitted Patients</h5>
                <h2>{patients}</h2>
              </div>

              <div className="stat-card card-yellow">
                <h5>Ambulance</h5>
                <h2>{ambulance}</h2>
              </div>

              {/* ✅ NEW DASHBOARD CARDS */}
              <div className="stat-card card-purple">
                <h5>Patient Details</h5>
                <h2>{patientDetails}</h2>
              </div>

              <div className="stat-card card-pink">
                <h5>Organ Donors</h5>
                <h2>{organDonors}</h2>
              </div>

              <div className="stat-card card-blue">
                <h5>Blood Bank</h5>
                <h2>{bloodBank}</h2>
              </div>

              <div className="stat-card card-lab">
                <h5>Lab Reports</h5>
                <h2>{labTests}</h2>
              </div>
            </div>

            <div className="chart-box">
              <h5 className="mb-3">Hospital Overview (Real-time)</h5>
              <Bar
                data={chartData}
                key={`${totalUsers}-${appointments}-${patients}-${ambulance}-${patientDetails}-${organDonors}-${bloodBank}-${labTests}`}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
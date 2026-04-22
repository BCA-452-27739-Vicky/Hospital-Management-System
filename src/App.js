import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/Navbar";

// App.js me aise likhein:
import GeminiChatbot from './GeminiChatbot';


import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Ambulance from "./pages/Ambulance";
import BloodBank from "./pages/BloodBank";
import OrganDonor from "./pages/OrganDonor";
import Department from "./pages/Department";
import Appointment from "./pages/Appointment";
import Medicine from "./pages/Medicine";
import Lab from "./pages/Lab";
import PatientDetailPage from "./pages/PatientDetails";


function App() {
  return  (
    <BrowserRouter>
      <AppNavbar />
    <div className="App">
       {/* Aapka baaki content... */}
       
       
       {/* Chatbot ko yahan add karein */}
       <GeminiChatbot />
    </div>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Lab" element={<Lab/>} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/appointment" element={<Appointment />} />
        <Route path="/department" element={<Department />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/ambulance" element={<Ambulance />} />
        <Route path="/bloodbank" element={<BloodBank />} />
        <Route path="/organdonor" element={<OrganDonor />} />
        <Route path="/patient-details" element={<PatientDetailPage />} />
        <Route path="/profile" element={<Profile />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;

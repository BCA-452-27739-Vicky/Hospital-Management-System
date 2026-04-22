import { useState } from "react";
import { ref, push } from "firebase/database";
import { database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AddOrganDonor() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    organs: "",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const donorRef = ref(database, "organdonors");
    push(donorRef, formData);

    alert("✅ Organ Donor Added Successfully");

    setFormData({
      name: "",
      age: "",
      bloodGroup: "",
      organs: "",
      date: "",
      time: "",
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">➕ Add Organ Donor</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <input className="form-control mb-3" name="name" placeholder="Patient Name" value={formData.name} onChange={handleChange} required />
        <input className="form-control mb-3" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input className="form-control mb-3" name="bloodGroup" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} required />
        <input className="form-control mb-3" name="organs" placeholder="Organs Donated (comma separated)" value={formData.organs} onChange={handleChange} required />
        <input className="form-control mb-3" type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input className="form-control mb-3" type="time" name="time" value={formData.time} onChange={handleChange} required />

        <button className="btn btn-success w-100">Save Donor</button>
      </form>
    </div>
  );
}

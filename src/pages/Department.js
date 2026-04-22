import React from 'react';

import './Department.css'; // Make sure to create this CSS file

const Department = () => {
  
  
  return (
    <div className="dept-page">
      <header className="dept-header">
        <h1>🏥 Hospital Departments</h1>
        <p>World-class care across 30 specialized medical fields</p>
      </header>

      <div className="dept-container">
        {departmentsData.map((dept, index) => (
          <div key={index} className="dept-card">
            <div className="dept-icon-wrapper">
              <span className="dept-icon">{dept.icon}</span>
            </div>
            <div className="dept-content">
              <h3>{dept.title}</h3>
              <span className="dept-badge">{dept.doctors} Specialists</span>
              <p>{dept.desc}</p>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default Department;

// --- Data: 30 Unique Departments ---
const departmentsData = [
  { icon: "❤️", title: "Cardiology", doctors: 12, desc: "Diagnosis and treatment of heart-related diseases and cardiac surgery." },
  { icon: "🧠", title: "Neurology", doctors: 9, desc: "Advanced care for brain, spinal cord, and nervous system disorders." },
  { icon: "🦴", title: "Orthopedics", doctors: 15, desc: "Treatment of bones, joints, fractures, arthritis, and sports injuries." },
  { icon: "👶", title: "Pediatrics", doctors: 10, desc: "Complete medical care for infants, children, and adolescents." },
  { icon: "👩‍⚕️", title: "Gynecology", doctors: 8, desc: "Women's health care including pregnancy, fertility, and reproductive health." },
  { icon: "🫁", title: "Pulmonology", doctors: 6, desc: "Diagnosis and treatment of lung and respiratory system diseases." },
  { icon: "🩺", title: "General Medicine", doctors: 18, desc: "Primary and preventive health care for adults and elderly patients." },
  { icon: "🧬", title: "Oncology", doctors: 7, desc: "Comprehensive cancer diagnosis, chemotherapy, and radiation therapy." },
  { icon: "🔬", title: "Dermatology", doctors: 5, desc: "Treatment of skin, hair, and nail conditions including cosmetic procedures." },
  { icon: "🍽️", title: "Gastroenterology", doctors: 8, desc: "Care for the digestive system, liver, and gastrointestinal diseases." },
  { icon: "💧", title: "Urology", doctors: 6, desc: "Treatment of urinary tract and male reproductive system disorders." },
  { icon: "👁️", title: "Ophthalmology", doctors: 7, desc: "Complete eye care, vision correction, and ophthalmic surgeries." },
  { icon: "👂", title: "ENT", doctors: 5, desc: "Ear, Nose, and Throat specialty for hearing, sinus, and vocal disorders." },
  { icon: "🧘", title: "Psychiatry", doctors: 6, desc: "Mental health care, counseling, and treatment of psychological disorders." },
  { icon: "💉", title: "Endocrinology", doctors: 4, desc: "Treatment of hormonal imbalances, diabetes, and thyroid disorders." },
  { icon: "🩸", title: "Hematology", doctors: 4, desc: "Diagnosis and treatment of blood disorders like anemia and leukemia." },
  { icon: "🩹", title: "Plastic Surgery", doctors: 5, desc: "Reconstructive and cosmetic surgeries for face and body enhancement." },
  { icon: "🦠", title: "Immunology", doctors: 3, desc: "Treatment of allergies, immune deficiencies, and autoimmune diseases." },
  { icon: "🧂", title: "Nephrology", doctors: 5, desc: "Kidney care including dialysis and transplant preparation." },
  { icon: "💊", title: "Anesthesiology", doctors: 10, desc: "Pain management and anesthesia for surgical procedures." },
  { icon: "🦴", title: "Rheumatology", doctors: 4, desc: "Treatment of autoimmune diseases affecting joints and muscles." },
  { icon: "🍎", title: "Nutrition", doctors: 3, desc: "Dietary planning and nutrition counseling for health recovery." },
  { icon: "🏃", title: "Physiotherapy", doctors: 8, desc: "Rehabilitation and physical therapy for mobility and pain relief." },
  { icon: "🦷", title: "Dentistry", doctors: 6, desc: "Oral health, dental surgery, orthodontics, and cosmetic dentistry." },
  { icon: "🚑", title: "Emergency", doctors: 20, desc: "24/7 critical care for trauma, accidents, and acute illnesses." },
  { icon: "☢️", title: "Radiology", doctors: 5, desc: "Medical imaging including X-rays, MRI, and CT scans for diagnosis." },
  { icon: "👵", title: "Geriatrics", doctors: 4, desc: "Specialized health care focused on the unique needs of elderly patients." },
  { icon: "🧪", title: "Pathology", doctors: 6, desc: "Lab testing and analysis of tissue samples for disease diagnosis." },
  { icon: "🍼", title: "Neonatology", doctors: 4, desc: "Specialized care for newborn infants, especially ill or premature babies." },
  { icon: "🔪", title: "General Surgery", doctors: 12, desc: "Surgical treatment for abdominal contents and general body trauma." },
];
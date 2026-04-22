import React, { useState, useEffect } from "react";
import { auth, database, storage } from "../firebase";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    name: "",
    specialization: "",
    bio: "",
    phone: "",
    gender: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Realtime Database से डेटा फेच करना
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          setEditData({
            name: data.name || "",
            specialization: data.specialization || "",
            bio: data.bio || "",
            phone: data.phone || "",
            gender: data.gender || ""
          });
        } else {
          // अगर डेटाबेस में एंट्री नहीं है (नया यूजर)
          const newData = {
            uid: user.uid,
            name: user.displayName || "New User",
            email: user.email,
            role: "user",
            createdAt: new Date().toISOString()
          };
          setUserData(newData);
          setEditData(prev => ({ ...prev, name: newData.name }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // फोटो अपलोड फंक्शन
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // फाइल टाइप चेक
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setUploading(true);
    try {
      const uid = auth.currentUser.uid;
      const fileRef = storageRef(storage, `profileImages/${uid}`);
      
      // अपलोड करें
      await uploadBytes(fileRef, file);
      
      // URL प्राप्त करें
      const downloadURL = await getDownloadURL(fileRef);

      // डेटाबेस अपडेट करें
      const userDbRef = ref(database, `users/${uid}`);
      await update(userDbRef, { photoURL: downloadURL });
      
      // लोकल स्टेट अपडेट करें
      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      alert("✅ Profile Photo Updated!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("❌ Upload Failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.name.trim()) return alert("Name is required!");

    try {
      const updates = {
        ...editData,
        updatedAt: new Date().toISOString(),
      };

      await update(ref(database, `users/${auth.currentUser.uid}`), updates);
      setUserData(prev => ({ ...prev, ...updates }));
      setIsEditing(false);
      alert("✅ Profile Updated!");
    } catch (error) {
      alert("❌ Failed to update profile");
    }
  };

  if (loading) return <div className="profile-loading">Loading Profile Details...</div>;

  const profileImage = userData?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=health";

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>{userData?.role === "admin" ? "Administrator Account" : "Patient Account"}</p>
        </div>

        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={profileImage} alt="Profile" className="profile-avatar" />
              <label className={`avatar-edit-btn ${uploading ? "disabled" : ""}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                <span>{uploading ? "..." : "✏️"}</span>
              </label>
            </div>
          </div>

          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={editData.name} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Specialization / Title</label>
                  <input 
                    type="text" 
                    value={editData.specialization} 
                    onChange={(e) => setEditData({...editData, specialization: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={editData.phone} 
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    value={editData.bio} 
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  />
                </div>
                <div className="edit-actions">
                  <button onClick={handleSaveProfile} className="save-btn">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="display-info">
                <div className="info-main">
                  <h3>{userData?.name}</h3>
                  <p className="spec-tag">{userData?.specialization || (userData?.role === 'admin' ? "Hospital Admin" : "Patient")}</p>
                </div>

                <div className="detail-item">
                  <label>Email Address</label>
                  <p>{userData?.email} {userData?.verified && <span className="v-icon">✔️</span>}</p>
                </div>

                <div className="detail-item">
                  <label>Phone</label>
                  <p>{userData?.phone || "Not provided"}</p>
                </div>

                <div className="detail-item">
                  <label>About</label>
                  <p className="bio-text">{userData?.bio || "No information added."}</p>
                </div>

                <button onClick={() => setIsEditing(true)} className="btn-edit-main">Update Profile Info</button>
              </div>
            )}
          </div>

          <div className="profile-footer">
            <button className="btn-back" onClick={() => navigate(userData?.role === "admin" ? "/admin-dashboard" : "/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
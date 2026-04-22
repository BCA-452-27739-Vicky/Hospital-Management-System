import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, update, get, set, query, orderByChild, equalTo } from "firebase/database";
import { auth, googleProvider, database } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [activeTab, setActiveTab] = useState("user");
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // User states
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  
  // Admin states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  const ADMIN_SECRET_CODE = "HOSPITAL_ADMIN_2024";

  // ✅ FIXED: Check email uniqueness across both roles
  const checkEmailExists = async (email, excludeUid = null) => {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const uid in users) {
        if (users[uid].email === email && uid !== excludeUid) {
          return true; // Email already exists
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Only auto-redirect for admin, let user stay on login page
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.role === "admin") {
            navigate("/admin-dashboard");
          }
          // Don't auto-redirect users from login page
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const showMessage = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // ✅ FUNCTION TO CHECK IF USER CAN LOGIN WITH THIS EMAIL
  const validateUserRole = async (email, expectedRole) => {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const uid in users) {
        if (users[uid].email === email) {
          return users[uid].role === expectedRole;
        }
      }
    }
    return false;
  };

  // ==================== USER FUNCTIONS ====================
  
  const userRegister = async () => {
    if (!userName.trim()) {
      showMessage("Please enter your full name.");
      return;
    }
    if (!userEmail.trim()) {
      showMessage("Please enter your email address.");
      return;
    }
    if (!userPassword.trim()) {
      showMessage("Please enter your password.");
      return;
    }
    if (userPassword.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }

    // ✅ CHECK: Email already exists in database
    const emailExists = await checkEmailExists(userEmail);
    if (emailExists) {
      showMessage("This email is already registered. Please login instead.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        name: userName,
        email: user.email.toLowerCase(), // Store email in lowercase
        role: "user",
        verified: false,
        createdAt: new Date().toISOString(),
      });

      showMessage("Registration successful! Please verify your email.", "success");
      
      // Sign out so user can login after verification
      await signOut(auth);
      
      setMode("login");
      setUserName("");
      setUserEmail("");
      setUserPassword("");
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage("Email already exists. Please use different email or login.");
      } else {
        showMessage("Registration Failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userLogin = async () => {
    if (!userEmail.trim() || !userPassword.trim()) {
      showMessage("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIRST: Check if this email belongs to a user (not admin)
      const isValidUser = await validateUserRole(userEmail, "user");
      if (!isValidUser) {
        // Check if email exists as admin
        const isAdmin = await validateUserRole(userEmail, "admin");
        if (isAdmin) {
          showMessage("This is an admin account. Please use Admin Portal tab.");
        } else {
          showMessage("No user account found with this email. Please register first.");
        }
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        showMessage("User data not found.");
        await signOut(auth);
        return;
      }

      const userData = snapshot.val();
      
      // ✅ DOUBLE CHECK: Role is still user
      if (userData.role !== "user") {
        showMessage("Access denied. This is not a user account.");
        await signOut(auth);
        return;
      }

      if (!user.emailVerified) {
        showMessage("Email not verified. Please check your inbox.");
        await signOut(auth);
        return;
      }

      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showMessage("Incorrect password. Please try again.");
      } else if (error.code === 'auth/user-not-found') {
        showMessage("No account found with this email.");
      } else {
        showMessage("Login Failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const email = user.email.toLowerCase();

      // ✅ CHECK: Email already exists as admin?
      const isAdmin = await validateUserRole(email, "admin");
      if (isAdmin) {
        showMessage("This email is registered as Admin. Please use Admin Portal.");
        await signOut(auth);
        return;
      }

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // ✅ CHECK AGAIN: Email not used anywhere
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          showMessage("This email is already registered with another account.");
          await signOut(auth);
          return;
        }

        await set(userRef, {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: email,
          provider: "google",
          role: "user",
          verified: true,
          createdAt: new Date().toISOString(),
        });
      } else {
        const existingData = snapshot.val();
        if (existingData.role === "admin") {
          showMessage("Admin accounts cannot use Google Sign-In.");
          await signOut(auth);
          return;
        }
      }

      navigate("/dashboard");
    } catch (error) {
      showMessage("Google Login Failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== ADMIN FUNCTIONS ====================
  
  const adminRegister = async () => {
    if (!adminName.trim()) {
      showMessage("Please enter admin full name.");
      return;
    }
    if (!adminEmail.trim()) {
      showMessage("Please enter admin email address.");
      return;
    }
    if (!adminPassword.trim()) {
      showMessage("Please enter admin password.");
      return;
    }
    if (adminPassword.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }
    if (adminCode !== ADMIN_SECRET_CODE) {
      showMessage("Invalid admin code. Access denied.");
      return;
    }

    // ✅ CHECK: Email already exists in database (as user or admin)
    const emailExists = await checkEmailExists(adminEmail);
    if (emailExists) {
      showMessage("This email is already registered. Cannot create admin account with same email.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        name: adminName,
        email: user.email.toLowerCase(),
        role: "admin",
        verified: true,
        createdAt: new Date().toISOString(),
        adminCode: ADMIN_SECRET_CODE
      });

      showMessage("Admin registration successful! Redirecting...", "success");
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1500);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage("Email already in use. Please use different email.");
      } else {
        showMessage("Admin Registration Failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      showMessage("Please enter admin email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIRST: Check if this email belongs to an admin (not user)
      const isValidAdmin = await validateUserRole(adminEmail, "admin");
      if (!isValidAdmin) {
        const isUser = await validateUserRole(adminEmail, "user");
        if (isUser) {
          showMessage("This is a patient account. Please use Patient Portal tab.");
        } else {
          showMessage("No admin account found with this email.");
        }
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        showMessage("Admin account not found.");
        await signOut(auth);
        return;
      }

      const userData = snapshot.val();
      
      // ✅ DOUBLE CHECK: Role is still admin
      if (userData.role !== "admin") {
        showMessage("Access denied. This is not an admin account.");
        await signOut(auth);
        return;
      }

      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString(),
      });

      navigate("/admin-dashboard");
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showMessage("Incorrect password. Please try again.");
      } else if (error.code === 'auth/user-not-found') {
        showMessage("No admin account found with this email.");
      } else {
        showMessage("Admin Login Failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async () => {
    const email = activeTab === "user" ? userEmail : adminEmail;
    if (!email.trim()) {
      showMessage("Enter your registered email first.");
      return;
    }

    // ✅ CHECK: Email exists with correct role
    const expectedRole = activeTab === "user" ? "user" : "admin";
    const isValid = await validateUserRole(email, expectedRole);
    
    if (!isValid) {
      showMessage(`No ${expectedRole} account found with this email.`);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMode("reset-sent");
      showMessage("Password reset email sent!", "success");
    } catch (error) {
      showMessage("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showMessage("Logged out successfully.", "success");
      setUserEmail("");
      setUserPassword("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminCode("");
      setUserName("");
      setAdminName("");
    } catch (error) {
      showMessage("Logout Failed: " + error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="hospital-bg">
        <div className="medical-cross"></div>
        <div className="medical-cross cross2"></div>
        <div className="medical-cross cross3"></div>
        <div className="heartbeat-line"></div>
        <div className="pulse-circles">
          <div className="pulse"></div>
          <div className="pulse pulse2"></div>
          <div className="pulse pulse3"></div>
        </div>
        <div className="ambient-overlay"></div>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <span className="medical-symbol">🏥</span>
          </div>
          <div className="logo-text">
            <h3>MediCare Hospital</h3>
            <p>Advanced Healthcare Management System</p>
          </div>
        </div>

        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === "user" ? "active user-tab" : ""}`}
            onClick={() => {
              setActiveTab("user");
              setMode("login");
              setMessage("");
            }}
            disabled={isLoading}
          >
            <span className="tab-icon">👤</span> Patient Portal
          </button>
          <button 
            className={`tab-btn ${activeTab === "admin" ? "active admin-tab" : ""}`}
            onClick={() => {
              setActiveTab("admin");
              setMode("login");
              setMessage("");
            }}
            disabled={isLoading}
          >
            <span className="tab-icon">🏥</span> Admin Portal
          </button>
        </div>

        {currentUser && (
          <div className="user-status">
            <span className="status-dot"></span>
            Logged in as <b>{currentUser.email}</b>
            {activeTab === "admin" && <span className="admin-badge">Admin</span>}
          </div>
        )}

        {message && (
          <div className={`${messageType === "success" ? "success-msg" : "error-msg"}`}>
            {message}
          </div>
        )}

        {/* ==================== USER PORTAL ==================== */}
        {activeTab === "user" && (
          <>
            {mode === "login" && (
              <>
                <h2 className="auth-title">Patient Login</h2>
                <p className="auth-subtitle">
                  Access your health records, appointments & prescriptions
                </p>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="patient@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="custom-input"
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      className="toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div
                  className="forgot-password-link"
                  onClick={() => !isLoading && setMode("forgot")}
                >
                  Forgot password?
                </div>

                <button className="btn-primary user-btn" onClick={userLogin} disabled={isLoading}>
                  <span className="btn-icon">🔐</span> {isLoading ? "Please wait..." : "Login as Patient"}
                </button>

                <div className="divider">OR</div>

                <button className="btn-google" onClick={userGoogleLogin} disabled={isLoading}>
                  <span className="google-icon">G</span> Continue with Google
                </button>

                <div className="toggle-auth">
                  New to MediCare?{" "}
                  <span onClick={() => !isLoading && setMode("register")}>
                    Register as Patient
                  </span>
                </div>
              </>
            )}

            {mode === "register" && (
              <>
                <h2 className="auth-title">Patient Registration</h2>
                <p className="auth-subtitle">
                  Create your account to book appointments
                </p>

                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="patient@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="custom-input"
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      className="toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button className="btn-primary user-btn" onClick={userRegister} disabled={isLoading}>
                  <span className="btn-icon">📝</span> {isLoading ? "Please wait..." : "Register as Patient"}
                </button>

                <div className="divider">OR</div>

                <button className="btn-google" onClick={userGoogleLogin} disabled={isLoading}>
                  <span className="google-icon">G</span> Sign up with Google
                </button>

                <div className="toggle-auth">
                  Already have an account?{" "}
                  <span onClick={() => !isLoading && setMode("login")}>
                    Login
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {/* ==================== ADMIN PORTAL ==================== */}
        {activeTab === "admin" && (
          <>
            {mode === "login" && (
              <>
                <h2 className="auth-title">Admin Login</h2>
                <p className="auth-subtitle">
                  Secure access to hospital management system
                </p>

                <div className="input-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="admin@medicare.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="custom-input"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      className="toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div
                  className="forgot-password-link"
                  onClick={() => !isLoading && setMode("forgot")}
                >
                  Forgot password?
                </div>

                <button className="btn-primary admin-btn" onClick={adminLogin} disabled={isLoading}>
                  <span className="btn-icon">🔐</span> {isLoading ? "Please wait..." : "Login as Admin"}
                </button>

                <div className="toggle-auth">
                  New Admin?{" "}
                  <span onClick={() => !isLoading && setMode("register")}>
                    Register as Admin
                  </span>
                </div>
              </>
            )}

            {mode === "register" && (
              <>
                <h2 className="auth-title">Admin Registration</h2>
                <p className="auth-subtitle">
                  Authorized personnel only
                </p>

                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Dr. Admin Name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="admin@medicare.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="custom-input"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      className="toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Admin Registration Code</label>
                  <input
                    type="password"
                    className="custom-input"
                    placeholder="Enter admin code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    disabled={isLoading}
                  />
                  <small className="input-hint">
                    Contact hospital IT department for admin code
                  </small>
                </div>

                <button className="btn-primary admin-btn" onClick={adminRegister} disabled={isLoading}>
                  <span className="btn-icon">📝</span> {isLoading ? "Please wait..." : "Register as Admin"}
                </button>

                <div className="toggle-auth">
                  Already have admin access?{" "}
                  <span onClick={() => !isLoading && setMode("login")}>
                    Login
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {mode === "forgot" && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              Enter your registered email address
            </p>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                className="custom-input"
                placeholder={activeTab === "user" ? "patient@example.com" : "admin@medicare.com"}
                value={activeTab === "user" ? userEmail : adminEmail}
                onChange={(e) => {
                  if (activeTab === "user") {
                    setUserEmail(e.target.value);
                  } else {
                    setAdminEmail(e.target.value);
                  }
                }}
                disabled={isLoading}
              />
            </div>

            <button className="btn-primary" onClick={forgotPassword} disabled={isLoading}>
              <span className="btn-icon">📧</span> {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div
              className="back-to-login"
              onClick={() => !isLoading && setMode("login")}
            >
              ← Back to Login
            </div>
          </>
        )}

        {mode === "reset-sent" && (
          <>
            <div className="reset-check">✓</div>
            <h2 className="auth-title">Email Sent!</h2>
            <p className="auth-subtitle">
              Reset link sent to your email. Please check inbox and spam.
            </p>
            <button
              className="btn-primary"
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </>
        )}

        {currentUser && (
          <button className="btn-logout-link" onClick={handleLogout} disabled={isLoading}>
            Logout / Switch Account
          </button>
        )}
      </div>
    </div>
  );
}
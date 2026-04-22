import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShoppingCart, Search, Trash2, Printer, AlertCircle, CheckCircle, PlusCircle, Edit, Package, User, LogOut, X, Lock, Mail, Eye, EyeOff, QrCode, CreditCard, Smartphone, Banknote } from 'lucide-react';
import './Medicine.css';

// Default Admin
const DEFAULT_ADMIN = {
  email: "admin@medcare.com",
  password: "admin123"
};

// Initial Medicines
const INITIAL_MEDICINES = [
  { id: 1, name: "Paracetamol 500mg", price: 30, stock: 50, img: "https://cdn-icons-png.flaticon.com/512/2966/2966480.png" },
  { id: 2, name: "Azithromycin 250mg", price: 120, stock: 15, img: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png" },
  { id: 3, name: "Vitamin C Tablets", price: 60, stock: 5, img: "https://cdn-icons-png.flaticon.com/512/2966/2966492.png" },
  { id: 4, name: "Cough Syrup", price: 90, stock: 0, img: "https://cdn-icons-png.flaticon.com/512/2966/2966478.png" },
  { id: 5, name: "Pain Relief Gel", price: 75, stock: 20, img: "https://cdn-icons-png.flaticon.com/512/2966/2966490.png" },
];

const Medicine = () => {
  // States
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [upiPin, setUpiPin] = useState(["", "", "", ""]);
  
  // Login Data
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  
  // Medicine Form
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", img: "" });
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  // Admin Users
  const [adminUsers] = useState(() => {
    const saved = localStorage.getItem('adminUsers');
    return saved ? JSON.parse(saved) : [DEFAULT_ADMIN];
  });

  // Save data
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(products));
  }, [products]);

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add to cart
  const addToCart = (product) => {
    if (product.stock > 0) {
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      ));
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          );
        } else {
          return [...prev, { ...product, qty: 1 }];
        }
      });
    }
  };

  // Remove from cart
  const removeFromCart = (id) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (!itemToRemove) return;
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: p.stock + itemToRemove.qty } : p
    ));
    setCart(cart.filter(item => item.id !== id));
  };

  // Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const admin = adminUsers.find(user => 
      user.email === loginData.email && user.password === loginData.password
    );
    if (admin) {
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setShowLoginForm(false);
      setLoginData({ email: "", password: "" });
      alert("Admin login successful!");
    } else {
      alert("Invalid email or password!");
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    alert("Admin logged out!");
  };

  // Add/Edit Medicine
  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (editingMedicine) {
      setProducts(products.map(p => 
        p.id === editingMedicine.id 
          ? { 
              ...formData, 
              id: editingMedicine.id,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock)
            } 
          : p
      ));
      setEditingMedicine(null);
    } else {
      const newMedicine = {
        id: Date.now(),
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        img: formData.img || "https://cdn-icons-png.flaticon.com/512/2966/2966480.png"
      };
      setProducts([...products, newMedicine]);
    }
    setFormData({ name: "", price: "", stock: "", img: "" });
    setShowAddForm(false);
  };

  // Edit Medicine
  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      price: medicine.price,
      stock: medicine.stock,
      img: medicine.img
    });
    setShowAddForm(true);
  };

  // Delete Medicine
  const handleDeleteMedicine = (id) => {
    if (window.confirm("Delete this medicine?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Restock
  const handleRestock = (id, amount) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: p.stock + amount } : p
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
  };

  // Initiate Payment
  const initiatePayment = () => {
    setShowPaymentModal(true);
    setIsCartOpen(false);
    setShowPinScreen(false);
    setUpiPin(["", "", "", ""]);
  };

  // Handle UPI Click - Show PIN Screen
  const handleUpiClick = () => {
    setShowPinScreen(true);
  };

  // Handle PIN Input
  const handlePinChange = (index, value) => {
    if (isNaN(value)) return;
    const newPin = [...upiPin];
    newPin[index] = value;
    setUpiPin(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  // Verify PIN and Pay
  const verifyPinAndPay = () => {
    const enteredPin = upiPin.join("");
    if (enteredPin.length === 4) {
      handlePaymentSuccess();
    } else {
      alert("Please enter a 4-digit PIN");
    }
  };

  // Final Payment Success
  const handlePaymentSuccess = () => {
    setShowPinScreen(false);
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      // Small delay to ensure modal is closed
      setTimeout(() => {
        generatePDF();
        alert(`✅ Payment Successful via ${paymentMethod.toUpperCase()}! Bill downloaded.`);
      }, 100);
    }, 2000);
  };

  // FIXED: Generate PDF without & characters
  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MEDCARE STORE", 14, yPos);
    yPos += 12;
    
    // Date and Payment Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-IN');
    const timeStr = currentDate.toLocaleTimeString('en-IN');
    
    doc.text(`Date: ${dateStr}`, 14, yPos);
    doc.text(`Time: ${timeStr}`, 100, yPos);
    yPos += 7;
    
    const paymentModeText = paymentMethod === 'cash' ? 'CASH' : paymentMethod.toUpperCase();
    doc.text(`Payment Mode: ${paymentModeText}`, 14, yPos);
    yPos += 15;
    
    // Draw header line
    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    
    // Table Headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Medicine Name", 14, yPos);
    doc.text("Price", 120, yPos);
    doc.text("Qty", 150, yPos);
    doc.text("Total", 170, yPos);
    yPos += 5;
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    
    // Table Rows
    doc.setFont("helvetica", "normal");
    for (const item of cart) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
        // Re-add headers on new page
        doc.setFont("helvetica", "bold");
        doc.text("Medicine Name", 14, yPos);
        doc.text("Price", 120, yPos);
        doc.text("Qty", 150, yPos);
        doc.text("Total", 170, yPos);
        yPos += 5;
        doc.line(14, yPos, 196, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
      }
      
      const nameText = item.name.length > 28 ? item.name.substring(0, 25) + "..." : item.name;
      doc.text(nameText, 14, yPos);
      doc.text(`Rs. ${item.price}`, 120, yPos);
      doc.text(`${item.qty}`, 150, yPos);
      doc.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, 170, yPos);
      yPos += 7;
    }
    
    // Draw line before total
    yPos += 5;
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    // Total Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL AMOUNT: Rs. ${calculateTotal()}`, 140, yPos);
    yPos += 15;
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping with MedCare!", 14, yPos);
    yPos += 7;
    doc.text("Visit Again!", 14, yPos);
    yPos += 10;
    doc.text("** This is a computer generated bill **", 14, yPos);
    
    // Save PDF with timestamp
    const timestamp = new Date().getTime();
    doc.save(`MedCare_Bill_${timestamp}.pdf`);
    
    // Clear cart after successful bill generation
    setCart([]);
  };

  return (
    <div className="app-container">
      {/* Login Modal */}
      {showLoginForm && (
        <div className="modal-overlay">
          <div className="modal-content admin-form">
            <div className="modal-header">
              <h2><Lock /> Admin Login</h2>
              <button className="close-btn" onClick={() => setShowLoginForm(false)}>×</button>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                    placeholder="admin@medcare.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                    placeholder="Password"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowLoginForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content medicine-form">
            <div className="modal-header">
              <h3>{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddMedicine}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Medicine name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="Price"
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    placeholder="Stock"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.img}
                  onChange={(e) => setFormData({...formData, img: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingMedicine ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="modal-header">
              <h2><CreditCard size={24} /> Secure Payment</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  if(!isProcessingPayment) {
                    if(showPinScreen) {
                      setShowPinScreen(false);
                    } else {
                      setShowPaymentModal(false);
                    }
                  }
                }}
              >
                {showPinScreen ? '←' : '×'}
              </button>
            </div>

            <div className="payment-amount">
              <span>Total to Pay:</span>
              <h1>₹{calculateTotal()}</h1>
            </div>

            {showPinScreen ? (
              <div className="pin-screen">
                <h3>Enter UPI PIN</h3>
                <p>Enter 4-digit PIN to authorize payment</p>
                <div className="pin-inputs">
                  {upiPin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-${index}`}
                      type="password"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      className="pin-box"
                    />
                  ))}
                </div>
                <button className="pay-now-btn" onClick={verifyPinAndPay}>
                  Verify & Pay
                </button>
              </div>
            ) : (
              <>
                <div className="payment-tabs">
                  <button className={paymentMethod === 'upi' ? 'active' : ''} onClick={() => setPaymentMethod('upi')}>
                    <Smartphone size={18} /> UPI
                  </button>
                  <button className={paymentMethod === 'qr' ? 'active' : ''} onClick={() => setPaymentMethod('qr')}>
                    <QrCode size={18} /> QR
                  </button>
                  <button className={paymentMethod === 'card' ? 'active' : ''} onClick={() => setPaymentMethod('card')}>
                    <CreditCard size={18} /> Card
                  </button>
                  <button className={paymentMethod === 'cash' ? 'active' : ''} onClick={() => setPaymentMethod('cash')}>
                    <Banknote size={18} /> Cash
                  </button>
                </div>

                <div className="payment-body">
                  {paymentMethod === 'upi' && (
                    <div className="upi-options">
                      <p>Select your UPI App:</p>
                      <div className="upi-grid">
                        <div className="upi-item" onClick={handleUpiClick}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" />
                          <span>Google Pay</span>
                        </div>
                        <div className="upi-item" onClick={handleUpiClick}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/PhonePe_Logo.svg" alt="PhonePe" />
                          <span>PhonePe</span>
                        </div>
                        <div className="upi-item" onClick={handleUpiClick}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" />
                          <span>Paytm</span>
                        </div>
                        <div className="upi-item" onClick={handleUpiClick}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="BHIM" />
                          <span>BHIM UPI</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'qr' && (
                    <div className="qr-section">
                      <p>Scan this QR Code with any UPI App:</p>
                      <div className="qr-box">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=medcare@upi&pn=MedCareStore&am=${calculateTotal()}&cu=INR`} 
                          alt="Payment QR" 
                        />
                      </div>
                      <button className="scan-done-btn" onClick={handlePaymentSuccess}>
                        I have Scanned & Paid
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="card-form">
                      <input type="text" placeholder="Card Number" className="card-input" />
                      <div className="card-row">
                        <input type="text" placeholder="MM/YY" />
                        <input type="password" placeholder="CVV" />
                      </div>
                      <button className="pay-now-btn" onClick={handlePaymentSuccess}>
                        Pay ₹{calculateTotal()}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="cash-section">
                      <div className="cash-icon-box">
                        <Banknote size={48} color="#10b981" />
                      </div>
                      <h3>Pay Cash at Counter</h3>
                      <p>Please pay the exact amount to the pharmacist.</p>
                      <button className="pay-now-btn" onClick={handlePaymentSuccess}>
                        Confirm Cash Payment
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {isProcessingPayment && (
              <div className="processing-overlay">
                <div className="spinner"></div>
                <p>Processing Payment...</p>
                <small>Do not close this window</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="navbar">
        <div className="logo">
          <h1>💊 MedCare</h1>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search medicines..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="header-actions">
          {!isAdminAuthenticated ? (
            <button className="admin-login-btn" onClick={() => setShowLoginForm(true)}>
              <Lock size={18} />
              <span>Admin Login</span>
            </button>
          ) : (
            <div className="admin-controls-header">
              <button className="logout-btn" onClick={handleAdminLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
              <button className="admin-toggle-btn" onClick={() => setIsAdminMode(!isAdminMode)}>
                {isAdminMode ? <User size={18} /> : <Package size={18} />}
                <span>{isAdminMode ? 'User Mode' : 'Admin Mode'}</span>
              </button>
            </div>
          )}
          <div className="cart-icon-wrapper" onClick={() => setIsCartOpen(!isCartOpen)}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.reduce((a,c) => a + c.qty, 0)}</span>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {isAdminAuthenticated && isAdminMode && (
          <div className="admin-controls">
            <div className="admin-header">
              <h2><Package /> Admin Dashboard</h2>
              <button className="add-medicine-btn" onClick={() => {
                setEditingMedicine(null);
                setFormData({ name: "", price: "", stock: "", img: "" });
                setShowAddForm(true);
              }}>
                <PlusCircle /> Add Medicine
              </button>
            </div>
          </div>
        )}

        <div className="grid-container">
          {filteredProducts.map(med => (
            <div key={med.id} className={`card ${med.stock === 0 ? 'out-of-stock' : ''}`}>
              <div className="image-container">
                <img src={med.img} alt={med.name} onError={(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/2966/2966480.png'} />
              </div>
              <div className="card-details">
                <h3>{med.name}</h3>
                <p className="price">₹{med.price.toFixed(2)}</p>
                
                <div className="stock-status">
                  {med.stock === 0 ? (
                    <span className="status-badge error"><AlertCircle size={12}/> Out of Stock</span>
                  ) : med.stock < 10 ? (
                    <span className="status-badge warning">Low Stock: {med.stock}</span>
                  ) : (
                    <span className="status-badge success"><CheckCircle size={12}/> Stock: {med.stock}</span>
                  )}
                </div>

                {isAdminAuthenticated && isAdminMode ? (
                  <div className="admin-actions">
                    <button className="action-btn edit-btn" onClick={() => handleEditMedicine(med)}>
                      <Edit /> Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteMedicine(med.id)}>
                      <Trash2 /> Delete
                    </button>
                    <button className="action-btn restock-btn" onClick={() => handleRestock(med.id, 10)}>
                      <PlusCircle /> +10
                    </button>
                  </div>
                ) : (
                  <button 
                    disabled={med.stock === 0} 
                    onClick={() => addToCart(med)}
                    className="add-btn"
                  >
                    {med.stock === 0 ? "Unavailable" : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price} x {item.qty}</p>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Total:</span>
            <span>₹{calculateTotal()}</span>
          </div>
          <button className="checkout-btn" onClick={initiatePayment} disabled={cart.length === 0}>
            <CreditCard size={18} /> Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Medicine;
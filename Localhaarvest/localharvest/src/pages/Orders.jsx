import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, CreditCard, ChevronRight, X, User, MapPin, Phone } from "lucide-react";

function Orders({ orders, setCartItems, refreshProducts }) {
  const [removingIndex, setRemovingIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to remove items and restore stock
  const removeItem = async (indexToRemove) => {
    const itemToRemove = orders[indexToRemove];

    try {
        // Restore stock
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/products/${itemToRemove.id}/stock`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ adjustment: 1 })
        });

        if (!response.ok) {
            console.error("Failed to restore stock");
        } else {
             // Refresh products
             if (refreshProducts) refreshProducts();
        }

    } catch (err) {
        console.error("Error restoring stock:", err);
    }

    setRemovingIndex(indexToRemove);
    setTimeout(() => {
      setCartItems((prevItems) =>
        prevItems.filter((_, index) => index !== indexToRemove)
      );
      setRemovingIndex(null);
    }, 300);
  };

  const totalAmount = orders.reduce(
    (sum, item) => sum + parseFloat(item.price || 0),
    0
  );

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleDeliverClick = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.name || !address.street || !address.city || !address.zip || !address.phone) {
        alert("Please fill in all required fields.");
        return;
    }
    // Proceed to Direct Order (Bypassing Payment Gateway for now)
    handleDirectOrder();
  };

  // Notification Handler
  const sendSoldNotifications = async () => {
      try {
          // Send notification request to backend
          const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/notifications/sold`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  items: orders,
                  buyerDetails: address
              })
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.details || errorData.error || "Failed to send notification via server");
          }
          return { success: true };

      } catch (e) {
          console.error("Failed to send notifications", e);
          return { success: false, error: e.message };
      }
  };

  // Direct Order function (Replaces Razorpay)
  const handleDirectOrder = async () => {
    if (orders.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setIsProcessing(true);
      
      // 1. Simulate Order Processing (Optional delay for UX)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Send Email Notifications to Producers
      const result = await sendSoldNotifications();

      if (result.success) {
          // 3. Success!
          alert("✅ Order Placed Successfully! The producers have been notified.");
          setCartItems([]); // Clear cart
          setIsAddressModalOpen(false); // Close modal
      } else {
          // SHOW DETAILED ERROR
          alert(`⚠️ Order placed, but email notification failed.\nReason: ${result.error}\n\nPlease contact support.`);
          setCartItems([]); // Still clear cart as order is "done" locally
          setIsAddressModalOpen(false);
      }

    } catch (error) {
      console.error("Order failed:", error);
      alert("Order processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center py-8 px-4 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
             <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
                <ShoppingCart size={14} /> Checkout
             </span>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Cart</span>
             </h1>
        </div>

        {orders.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-emerald-200 text-center max-w-lg w-full animate-fadeInUp">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                 <ShoppingCart size={40} className="text-emerald-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Cart is Empty</h3>
            <p className="text-slate-500 mb-8">Looks like you haven't added any fresh produce yet.</p>
            <Link to="/shop">
              <button className="flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-500 hover:scale-[1.02] active:scale-[0.98]">
                Go Shopping <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4 animate-fadeInUp">
               <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-6 shadow-sm">
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-50">
                    <h2 className="text-xl font-bold text-slate-800">Order Items ({orders.length})</h2>
                 </div>

                 <ul className="space-y-4">
                    {orders.map((item, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl transition-all duration-300 ${removingIndex === index ? "opacity-0 translate-x-10" : "hover:border-emerald-200 hover:shadow-md"}`}
                      >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                 {item.image_url ? 
                                    <img src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/${item.image_url}`} alt={item.name} className="w-full h-full object-cover"/> 
                                    : <span className="text-2xl">🥦</span>}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                                <p className="text-slate-500 text-sm">₹{item.price} / unit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-emerald-700 text-lg">
                            ₹{parseFloat(item.price || 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </li>
                    ))}
                 </ul>
               </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl p-8 shadow-xl shadow-emerald-500/5 sticky top-24">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Platform Fee</span>
                            <span>₹{0}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Delivery</span>
                            <span className="text-emerald-600 font-medium">Free</span>
                        </div>
                        <div className="h-px bg-slate-100 my-4"></div>
                        <div className="flex justify-between text-xl font-bold text-slate-800">
                            <span>Total</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                      onClick={handleDeliverClick}
                      disabled={isProcessing}
                      className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Processing..." : (
                          <>Procced to Delivery <ChevronRight size={18} /></>
                      )}
                    </button>
                    
                    <p className="text-xs text-center text-slate-400 mt-4">
                        Order notifications are sent to producers
                    </p>
                </div>
            </div>

          </div>
        )}
      </div>

       {/* Styled Address Modal - SCROLLABLE OVERLAY */}
       {isAddressModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto pt-24 px-4 pb-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          {/* Flex container to center the modal */}
          <div className="flex min-h-full items-start justify-center text-center sm:p-0">
             
              {/* Modal Card */}
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-[2rem] bg-white text-left shadow-xl transition-all animate-scaleIn mb-10">
                
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Delivery Details</h2>
                        <p className="text-sm text-slate-500">Where should we send your fresh produce?</p>
                    </div>
                    <button 
                        onClick={() => setIsAddressModalOpen(false)} 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <form onSubmit={handleAddressSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/>
                                <input 
                                type="text" 
                                name="name"
                                value={address.name}
                                onChange={handleAddressChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Full Name"
                                required
                                />
                            </div>

                            {/* Street */}
                            <div className="relative group">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/>
                                <input 
                                type="text" 
                                name="street"
                                value={address.street}
                                onChange={handleAddressChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Street Address"
                                required
                                />
                            </div>

                            {/* Grid Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="City"
                                    required
                                    />
                                <input 
                                    type="text" 
                                    name="zip"
                                    value={address.zip}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Zip Code"
                                    required
                                    />
                            </div>

                            {/* Phone */}
                            <div className="relative group">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/>
                                <input 
                                type="tel" 
                                name="phone"
                                value={address.phone}
                                onChange={handleAddressChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Phone Number"
                                required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full text-white font-bold text-lg px-6 py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                            <CreditCard size={20} />
                            {isProcessing ? "Processing..." : "Place Order (Pay on Delivery)"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn { 
            from { opacity: 0; transform: scale(0.95); } 
            to { opacity: 1; transform: scale(1); } 
        }
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
        .animate-fadeInUp { 
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
          animation-fill-mode: backwards; 
        }
        .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
        /* Custom Scrollbar for Modal */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default Orders;

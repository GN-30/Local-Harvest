import React, { useState } from "react";
import { Link } from "react-router-dom";

function Orders({ orders, setCartItems, refreshProducts }) {
  const [removingIndex, setRemovingIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const removeItem = async (indexToRemove) => {
    const itemToRemove = orders[indexToRemove];

    try {
        // ALWAYS try to restore stock, assuming it was deducted when added to cart
        // We use itemToRemove.id which is the product ID
        const response = await fetch(`http://localhost:3001/api/products/${itemToRemove.id}/stock`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ adjustment: 1 })
        });

        if (!response.ok) {
            console.error("Failed to restore stock");
        } else {
             // If successful, refresh the global product list so Shop page reflects new stock
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

  // ✅ Razorpay payment function
  const handlePayment = async () => {
    if (orders.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setIsProcessing(true);

      // 1️⃣ Create Razorpay order from backend
      const res = await fetch(
        "http://localhost:3001/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            currency: "INR",
            orderId: new Date().getTime(),
          }),
        }
      );

      const data = await res.json();
      if (!data.orderId) {
        alert("Failed to create Razorpay order.");
        setIsProcessing(false);
        return;
      }

      // 2️⃣ Razorpay checkout options
      const options = {
        key: "rzp_test_yourkeyid", // 🔑 Replace with your Razorpay Test Key
        amount: totalAmount * 100,
        currency: "INR",
        name: "LocalHarvest",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3️⃣ Verify payment with backend
            const verifyRes = await fetch(
              "http://localhost:3001/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            const result = await verifyRes.json();
            if (result.success) {
              alert("✅ Payment Successful! Thank you for shopping.");
              setCartItems([]); // clear cart
            } else {
              alert("❌ Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            alert("Payment verification failed. Try again.");
          }
        },
        prefill: {
          name: "", // Optional: Add default name
          email: "", // Optional: Add default email
        },
        theme: { color: "#4F46E5" },
      };

      // 4️⃣ Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
    // Proceed to payment after address validation
    handlePayment();
    // Optionally close modal here, or wait for payment to finish
    setIsAddressModalOpen(false); 
  };

  return (
    <div className="min-h-screen font-sans -mt-24">
      {/* Animated background removed (in App.jsx) */}

      <div className="relative z-10 flex flex-col items-center py-20 px-4">
        <h1 className="text-7xl font-black tracking-tight mb-12 text-slate-900 drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600">
            Your Cart
          </span>
        </h1>

        {orders.length === 0 ? (

          <div className="text-center bg-white/80 backdrop-blur-xl p-16 rounded-3xl border border-emerald-100 shadow-xl w-full max-w-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200 mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">
              Your Cart is Empty
            </h3>
            <p className="text-slate-500 text-lg">
              Looks like you haven't added anything yet!
            </p>
            <Link to="/shop">
              <button className="mt-6 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden group/btn tracking-wide">
                <span className="relative z-10">Go Shopping</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-8 shadow-2xl shadow-emerald-500/10 w-full max-w-2xl flex flex-col gap-6">
              <ul className="divide-y divide-slate-100">
                {orders.map((item, index) => (
                  <li
                    key={index}
                    className={`py-4 flex justify-between items-center transition-all duration-300 ease-in-out ${
                      removingIndex === index
                        ? "opacity-0 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                        {/* Optional: Add small thumbnail here if available */}
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden">
                             {item.image_url ? 
                                <img src={`http://localhost:3001/${item.image_url}`} alt={item.name} className="w-full h-full object-cover"/> 
                                : <span>📦</span>}
                        </div>
                        <span className="text-lg text-slate-800 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                        ₹{parseFloat(item.price || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-slate-400 hover:text-rose-500 font-bold text-2xl transition-colors duration-200 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                <span className="text-xl font-bold text-slate-900">
                  Total: ₹{totalAmount.toFixed(2)}
                </span>
                <button
                  onClick={handleDeliverClick}
                  disabled={isProcessing}
                  className={`text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 ease-out transform ${
                    isProcessing
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:scale-105"
                  } active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden group/btn tracking-wide`}
                >
                  <span className="relative z-10">
                    Deliver
                  </span>
                </button>
              </div>
            </div>

            <Link to="/shop">
              <button className="text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden group/btn tracking-wide">
                <span className="relative z-10">Continue Shopping</span>
              </button>
            </Link>
          </div>
        )}
      </div>

       {/* Address Modal */}
       {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeInUp">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Delivery Details</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddressSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={address.name}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input 
                  type="text" 
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                  placeholder="123 Farm Lane"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input 
                    type="text" 
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    placeholder="New York"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input 
                    type="text" 
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    placeholder="NY"
                    required
                    />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                    <input 
                    type="text" 
                    name="zip"
                    value={address.zip}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    placeholder="10001"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input 
                    type="tel" 
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    placeholder="+91 9876543210"
                    required
                    />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full text-white font-bold text-lg px-6 py-4 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden"
                >
                  {isProcessing ? "Processing..." : "Proceed to Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;

import React, { useState, useEffect, useContext } from "react";
import { useToast } from "./context/ToastContext";
import { AuthContext } from "./context/AuthContext"; // Import AuthContext
import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import SellerDashboard from "./pages/SellerDashboard";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AuthModal from "./components/AuthModal";
import RoleSelection from "./pages/RoleSelection"; // Import RoleSelection
import AuthPage from "./pages/AuthPage"; // Import AuthPage
import FarmBg from "./images/farm-bg.png"; // Import Global Background

// Protected Route Component
const ProtectedSellerRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'producer') {
    return <Navigate to="/auth?role=seller" replace />;
  }
  return children;
};

function App() {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const [fallingItems] = useState(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${15 + Math.random() * 25}s`,
    delay: `${-(Math.random() * 20)}s`,
    icon: ['🍎', '🌽', '🥕', '🥦', '🍇', '🍅', '🥔', '🥬', '🌾', '🍓'][Math.floor(Math.random() * 10)],
    size: `${1 + Math.random() * 1.5}rem`
  })));
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { user } = useContext(AuthContext); // Get user from context

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const { addToast } = useToast();

  const handleAddProduct = async (newProduct) => {
    try {
      const isFormData = newProduct instanceof FormData;
      const headers = isFormData ? {} : { "Content-Type": "application/json" };
      const body = isFormData ? newProduct : JSON.stringify(newProduct);

      const response = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const updatedList = await response.json();
      setProducts(updatedList);
      addToast("Product added successfully", "success");
    } catch (error) {
      console.error("Error adding product:", error);
      addToast("Failed to add product", "error");
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      const updatedList = await response.json();
      setProducts(updatedList);
      addToast("Product removed successfully", "success");
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("Failed to delete product", "error");
    }
  };

  const handleAddToCart = async (item) => {
    // 1. Check stock
    if (item.stock <= 0) {
        addToast("Out of stock!", "error");
        return;
    }

    try {
        // 2. Call backend to decrement stock
        const response = await fetch(`http://localhost:3001/api/products/${item.id}/stock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adjustment: -1 })
        });

        if (!response.ok) {
            throw new Error("Failed to update stock");
        }

        const updatedProducts = await response.json();
        setProducts(updatedProducts); // Sync global product state

        // 3. Add to cart local state
        setCartItems((prevItems) => [...prevItems, item]);
        addToast("Added to Cart!", "success");

    } catch (error) {
        console.error("Error updating stock:", error);
        addToast("Failed to add to cart", "error");
    }
  };

  const toggleAuthModal = () => {
    setAuthModalOpen(!isAuthModalOpen);
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-800">
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-stone-50">
         <img src={FarmBg} alt="background" className="absolute inset-0 w-full h-full object-cover opacity-[0.15] blur-[1px] scale-105 animate-slow-zoom mix-blend-multiply" />
         <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white/50 to-emerald-50/40"></div>
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]"></div>
         
         {/* Animated Orbs */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[100px] animate-pulse-slow"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[100px] animate-float"></div>
         
         {/* Falling Harvest Items */}
         {fallingItems.map((item) => (
           <div
             key={item.id}
             className="absolute -top-20 animate-fall select-none pointer-events-none"
             style={{
               left: item.left,
               animationDuration: item.duration,
               animationDelay: item.delay,
                fontSize: item.size,
                opacity: 0.9,
                zIndex: 10
              }}
           >
             {item.icon}
           </div>
         ))}
      </div>

      <Navbar cartCount={cartItems.length} onLoginClick={toggleAuthModal} />

      <main className="pt-24 relative z-10">
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route
            path="/shop"
            element={
              <Shop 
                products={products} 
                addToCart={handleAddToCart} 
                refreshProducts={fetchProducts} 
                onRemoveProduct={handleRemoveProduct} // Passed prop
              />
            }
          />
          <Route
            path="/sellers"
            element={
              <ProtectedSellerRoute>
                <SellerDashboard
                  products={products}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                />
              </ProtectedSellerRoute>
            }
          />
          <Route
            path="/orders"
            element={<Orders orders={cartItems} setCartItems={setCartItems} refreshProducts={fetchProducts} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }

        @keyframes float { 
          0%, 100% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-20px) rotate(2deg); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
        .animate-slow-zoom { animation: slow-zoom 20s ease-in-out infinite; }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default App;

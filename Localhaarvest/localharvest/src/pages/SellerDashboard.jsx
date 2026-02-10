import React, { useState, useContext } from "react";
// Leaflet imports
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
// Fix for default marker icon in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { AuthContext } from "../context/AuthContext";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SVG Icons ---
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const PackageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);
const DollarSignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-10h0M6 12a6 6 0 1112 0 6 6 0 01-12 0z"
    />
  </svg>
);
const HashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);
const PhoneIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 text-indigo-400" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
    />
  </svg>
);

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function SellerDashboard({
  products,
  onAddProduct,
  onRemoveProduct,
}) {
  const { user } = useContext(AuthContext); // Get current logged in user
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: null,
    address: "",
    contact_number: "",
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  
  // Default center (India or generic)
  const defaultCenter = [20.5937, 78.9629]; 

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('address', newProduct.address);
      formData.append('contact_number', newProduct.contact_number);
      
      // Pass the Seller's Email!
      formData.append('seller_email', user?.email || "");

      if (newProduct.latitude) {
          formData.append('latitude', newProduct.latitude);
      }
      if (newProduct.longitude) {
          formData.append('longitude', newProduct.longitude);
      }
      
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      await onAddProduct(formData);

      setNewProduct({ 
          name: "", 
          price: "", 
          stock: "", 
          image: null,
          address: "",
          contact_number: "",
          latitude: null,
          longitude: null
      });
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    setRemovingId(id);
    // Wait for animation to finish before calling API
    setTimeout(async () => {
        try {
            await onRemoveProduct(id);
        } catch (error) {
            console.error("Error removing", error);
        } finally {
            setRemovingId(null);
        }
    }, 800);
  };

  const getStockColor = (stock) => {
    if (stock > 15) return "text-emerald-900 bg-emerald-400/80";
    if (stock > 5) return "text-amber-900 bg-amber-400/80";
    if (stock > 0) return "text-rose-900 bg-rose-400/80";
    return "text-slate-500 bg-slate-200"; // Out of stock style
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Background provided by App.jsx */}

      <div className="relative z-10">
        {/* Header Section */}
        <section className="text-center py-24 px-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-emerald-100/50 backdrop-blur-md border border-emerald-200 rounded-full shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              Admin & Seller Portal
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">Inventory</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Seamlessly add, track, and manage your products with our professional dashboard interface.
          </p>
        </section>

        {/* Add Product Form */}
        <div className="max-w-4xl mx-auto px-6 mb-24">
          <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-8 md:p-10 shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
                <p className="text-slate-500 text-sm">Enter product details & location below</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-4 gap-6"
            >
               {/* Product Name */}
               <div className="relative group md:col-span-4 lg:col-span-2">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                    <PackageIcon />
                 </span>
                 <input
                   type="text"
                   placeholder="Product Name"
                   value={newProduct.name}
                   onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-200"
                   required
                 />
               </div>

                {/* Price */}
               <div className="relative group md:col-span-2 lg:col-span-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                    <DollarSignIcon />
                 </span>
                 <input
                   type="number"
                   placeholder="Price"
                   value={newProduct.price}
                   onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-200"
                   required
                 />
               </div>

               {/* Stock */}
               <div className="relative group md:col-span-2 lg:col-span-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300">
                    <HashIcon />
                 </span>
                 <input
                   type="number"
                   placeholder="Stock"
                   value={newProduct.stock}
                   onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-200"
                   required
                 />
               </div>

                {/* Image */}
               <div className="relative group md:col-span-4">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                   className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                 />
               </div>

               {/* Contact Number */}
               <div className="relative group md:col-span-4">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300 mt-3.5">
                    <PhoneIcon />
                 </span>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                 <input 
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newProduct.contact_number}
                    onChange={(e) => setNewProduct({ ...newProduct, contact_number: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-200"
                  />
               </div>

               {/* Address Input */}
               <div className="relative group md:col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. 123 Farm Road, Village"
                    value={newProduct.address}
                    onChange={(e) => setNewProduct({ ...newProduct, address: e.target.value })}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-200"
                  />
               </div>

               {/* Map Picker */}
               <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pin Location on Map</label>
                    <div className="h-64 rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                        <MapContainer center={defaultCenter} zoom={4} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <LocationMarker 
                                position={newProduct.latitude ? [newProduct.latitude, newProduct.longitude] : null}
                                setPosition={(pos) => setNewProduct({ ...newProduct, latitude: pos.lat, longitude: pos.lng })}
                            />
                        </MapContainer>
                    </div>
                     <p className="text-xs text-slate-500 mt-1">Click on the map to set the exact location.</p>
               </div>
              
               <div className="md:col-span-4 mt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            Add to Inventory
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </>
                    )}
                </button>
               </div>
            </form>
          </div>
        </div>

        {/* Inventory List */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    Current Stock
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full border border-slate-200">
                        {products.length} Items
                    </span>
                </h2>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                    group relative bg-white/60 backdrop-blur-xl border border-emerald-50 rounded-3xl p-6 
                    hover:bg-white/90 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 
                    transition-all duration-500 flex flex-col
                     ${removingId === product.id ? "animate-shatter pointer-events-none" : "animate-fadeInUp opacity-100 scale-100"}
                     ${product.stock <= 0 ? "grayscale-0" : ""} 
                `}
              >
                <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 rounded-xl bg-emerald-50/50 flex items-center justify-center overflow-hidden border border-emerald-100/50 transition-colors duration-300 group-hover:bg-emerald-100">
                        {product.image_url ? (
                            <img 
                                src={`http://localhost:3001/${product.image_url}`} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl">📦</span>
                        )}
                     </div>
                     
                     {/* CONDITIONAL DELETE BUTTON */}
                     {product.stock <= 0 && (
                         <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-300 cursor-pointer"
                            title="Remove Out of Stock Product"
                         >
                            <TrashIcon />
                         </button>
                     )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
                    {product.name}
                </h3>
                
                {product.contact_number && (
                    <div className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <PhoneIcon /> {product.contact_number}
                    </div>
                )}

                {/* Map Display in Card - Click to Open Google Maps */}
                <div className="mb-4 w-full h-24 rounded-lg overflow-hidden border border-emerald-100 relative z-0 group/map">
                     {product.latitude && product.longitude ? (
                        <>
                            <MapContainer
                                center={[Number(product.latitude), Number(product.longitude)]}
                                zoom={13}
                                scrollWheelZoom={false}
                                zoomControl={false}
                                dragging={false}
                                doubleClickZoom={false}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[Number(product.latitude), Number(product.longitude)]} />
                            </MapContainer>
                            
                            {/* Overlay to open Google Maps */}
                            <a 
                                href={`https://www.google.com/maps?q=${product.latitude},${product.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 z-[1000] bg-black/0 group-hover/map:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                                title="Open in Google Maps"
                            >
                                <span className="opacity-0 group-hover/map:opacity-100 bg-white/90 px-2 py-1 rounded text-xs font-semibold text-emerald-700 shadow-sm transition-opacity">
                                    Open Maps ↗
                                </span>
                            </a>
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                            No location
                        </div>
                    )}
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-sm text-slate-500">₹</span>
                    <span className="text-2xl font-bold text-emerald-900">{product.price}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getStockColor(product.stock)}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                    </span>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p>No products in inventory yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>

       <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0px) translateX(0px); } 
          50% { transform: translateY(-20px) translateX(20px); } 
        }
        @keyframes float-delayed { 
          0%, 100% { transform: translateY(0px) translateX(0px); } 
          50% { transform: translateY(20px) translateX(-20px); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes shatter {
            0% { transform: scale(1); opacity: 1; }
            20% { transform: scale(1.1) rotate(2deg); opacity: 1; filter: brightness(1.2); }
            50% { transform: scale(1.2) rotate(-2deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(10deg); opacity: 0; filter: blur(10px); }
        }
        .animate-fadeInUp { 
          animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
          animation-fill-mode: backwards; 
        }
        .animate-float { 
          animation: float 10s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float-delayed 12s ease-in-out infinite; 
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-shatter {
            animation: shatter 0.5s ease-in forwards;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default SellerDashboard;

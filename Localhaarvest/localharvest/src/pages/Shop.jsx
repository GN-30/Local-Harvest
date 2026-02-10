import React, { useState } from "react";
// Leaflet imports
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SVG Icons ---
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

function Shop({ products, addToCart, refreshProducts }) {
  // We can call refreshProducts on mount if needed, but App.js does it.

  return (
    <div className="min-h-screen font-sans">
        {/* Background is in App.jsx */}
      
      <div className="relative z-10 pt-12 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-4 shadow-sm border border-emerald-200">
                Fresh from the Farm
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Marketplace</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
                Discover organic, locally sourced produce directly from verified farmers near you.
            </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const isOutOfStock = product.stock <= 0;
            return (
            <div
              key={product.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`group relative bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-5 transition-all duration-500 flex flex-col
                ${isOutOfStock ? "opacity-70 grayscale" : "hover:bg-white/90 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 animate-fadeInUp"}
              `}
            >
              {/* Image */}
              <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 mb-5 overflow-hidden relative shadow-inner">
                {product.image_url ? (
                    <img
                      src={`http://localhost:3001/${product.image_url}`}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        broccoli
                    </div>
                )}
                
                {/* Price Tag Overlay */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-900 font-bold px-3 py-1.5 rounded-lg shadow-sm text-sm border border-emerald-100">
                    ₹{product.price}
                </div>

                {isOutOfStock && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-rose-500 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-xl transform -rotate-12 border-2 border-white">
                            OUT OF STOCK
                        </span>
                     </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-emerald-700 transition-colors">
                        {product.name}
                    </h3>
                </div>
                <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded w-fit mb-3 ${isOutOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-600"}`}>
                     Stock: {product.stock}
                </div>
                
                 {/* Contact Info */}
                 {product.contact_number && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1">
                        <PhoneIcon />
                        <span>{product.contact_number}</span>
                    </div>
                 )}

                 {/* Address Text */}
                 {product.address && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2 leading-relaxed">
                        <MapIcon />
                        <span className="line-clamp-2">{product.address}</span>
                    </div>
                 )}
              </div>

              {/* Map Section */}
               <div className="mt-auto">
                    {product.latitude && product.longitude ? (
                        <div className="w-full h-28 rounded-xl overflow-hidden border border-emerald-100 relative mb-4 group/map">
                            <MapContainer
                                center={[Number(product.latitude), Number(product.longitude)]}
                                zoom={10}
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
                                className="absolute inset-0 z-[1000] bg-emerald-900/0 group-hover/map:bg-emerald-900/10 transition-colors flex items-center justify-center cursor-pointer"
                            >
                                <span className="opacity-0 group-hover/map:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 shadow-lg transform scale-90 group-hover/map:scale-100 transition-all">
                                    Open in Google Maps ↗
                                </span>
                            </a>
                        </div>
                    ) : null}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                        if (!isOutOfStock) addToCart(product);
                    }}
                    disabled={isOutOfStock}
                    className={`
                        w-full py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 flex items-center justify-center gap-2
                        ${isOutOfStock 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-slate-900 hover:bg-emerald-600 text-white shadow-slate-900/20 hover:shadow-emerald-600/30 hover:-translate-y-1 active:scale-95"}
                    `}
                  >
                    <ShoppingCartIcon />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
              </div>
            </div>
          );
        })}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
             <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    🧺
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Marketplace is Empty</h3>
                <p className="text-slate-500">Farmers haven't listed any produce yet. Check back soon!</p>
             </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeInUp { 
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
          animation-fill-mode: backwards; 
        }
      `}</style>
    </div>
  );
}

export default Shop;

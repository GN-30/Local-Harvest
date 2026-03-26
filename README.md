# 🍎 Local Harvest

Local Harvest is a modern full-stack platform designed to bridge the gap between local producers (farmers/growers) and consumers. It empowers local communities by providing a streamlined marketplace for fresh, locally-sourced products.

## 🚀 Features

### 🛒 For Consumers
- **Browse Fresh Products:** View a wide range of locally grown produce with real-time stock availability.
- **Location-Based Discovery:** Find products near you using integrated maps and address search.
- **Secure Shopping Cart:** Easily add items to your cart and manage quantities.
- **Seamless Payments:** Integrated with **Razorpay** for safe and quick transactions.
- **Order History:** Keep track of your past purchases.

### 👩‍🌾 For Producers
- **Product Management:** Add, update, or delete products with ease.
- **Automated Stock Tracking:** Real-time updates to inventory as customers purchase items.
- **Verification System:** Secure onboarding process with seller access codes sent via email.
- **Order Notifications:** Receive instant email alerts when your products are sold, including buyer details and delivery addresses.

## 🛠️ Tech Stack

### Frontend
- **React (Vite):** A fast, modern frontend framework.
- **Tailwind CSS:** For a premium, responsive, and clean UI design.
- **Leaflet & React-Leaflet:** Integrated maps for location-based product discovery.
- **Lucide-React:** Beautiful, consistent iconography.
- **React Router:** For smooth, client-side navigation.

### Backend
- **Node.js & Express:** A scalable and efficient server-side environment.
- **MySQL:** A robust relational database for managing users, products, and orders.
- **JWT (JSON Web Tokens):** Secure authentication and session management.
- **bcryptjs:** Advanced password hashing for user security.
- **Multer:** Handling multipart/form-data for product image uploads.
- **Nodemailer:** Automated email services for welcome messages and order alerts.
- **Razorpay SDK:** Reliable payment processing.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server
- A Gmail account (for Nodemailer)
- A Razorpay account (for payments)

### 1. Clone the repository
```bash
git clone <repository-url>
cd Localhaarvest
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory (use `.env.example` as a template).
- Configure your MySQL, Email, and Razorpay credentials.
- The server will automatically verify and update the database schema on startup.

```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../Localhaarvest/localharvest
npm install
npm run dev
```

## 📬 Contact & Seller Verification
Interested in becoming a seller? Use the contact form on the platform to request a **Seller Access Code**. Our team will review your request and send a unique code to your email, which you can use to sign up as a Producer.

## 📄 License
This project is licensed under the ISC License.

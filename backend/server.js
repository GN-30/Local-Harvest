const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
const PORT = 3001;
const JWT_SECRET = "your_jwt_secret_here"; // Replace with process.env.JWT_SECRET in production

app.use(cors());
app.use(express.json());
// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

const multer = require('multer');
const path = require('path');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp-randomnumber.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- DB Connection ---
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "ramram",
  database: "localharvest",
});

// --- Email Config (Nodemailer) ---
// REPLACE with your actual email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gnsn1200@gmail.com", // TODO: Update this
    pass: "vdup ptqh ljpd hhql",    // TODO: Update this (App Password if using Gmail)
  },
});

// Helper to send email
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const mailOptions = {
      from: '"Local Harvest" <no-reply@localharvest.com>',
      to: email,
      subject: "Welcome to Local Harvest!",
      text: `Hello ${name},\n\nWelcome to Local Harvest! Your account has been created as a ${role}.\n\nBest,\nThe Team`,
      html: `<h3>Hello ${name},</h3><p>Welcome to Local Harvest! Your account has been created as a <b>${role}</b>.</p><br><p>Best,<br>The Team</p>`
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// --- Razorpay Instance ---
const razorpay = new Razorpay({
  key_id: "rzp_test_1234567890abcdef", // replace with your Razorpay key
  key_secret: "your_razorpay_secret",
});

// --- AUTH ROUTES ---

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role, secretCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check existing user
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Secret code check for producers
    if (role === 'producer') {
      if (!SECRET_CODES.includes(secretCode)) {
        return res.status(403).json({ message: "Invalid Producer Secret Code" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    // Send Welcome Email
    sendWelcomeEmail(email, name, role);

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "10h" } // Longer session
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCT ROUTES ---

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database fetch failed" });
  }
});

app.post("/api/products", upload.single('image'), async (req, res) => {
  try {
    // DEBUG: Log received data
    console.log("--- Received Product (POST) ---");
    console.log("Body:", req.body);
    console.log("File:", req.file ? req.file.filename : "No file");

    const { name, price, stock, address, latitude, longitude, contact_number, seller_email } = req.body;

    // image file path (relative to server root)
    let image_url = null;
    if (req.file) {
      image_url = req.file.path.replace(/\\/g, "/"); // Normalize path for URL usage
    }

    if (!name || !price || !stock)
      return res.status(400).json({ error: "Missing fields" });

    // Validate and parse lat/long
    let lat = null;
    let lng = null;

    if (latitude && latitude !== 'null' && latitude !== 'undefined') {
      const parsedLat = parseFloat(latitude);
      if (!isNaN(parsedLat)) lat = parsedLat;
    }

    if (longitude && longitude !== 'null' && longitude !== 'undefined') {
      const parsedLng = parseFloat(longitude);
      if (!isNaN(parsedLng)) lng = parsedLng;
    }

    const addr = address && address !== 'null' && address !== 'undefined' ? address : null;
    const contact = contact_number && contact_number !== 'null' && contact_number !== 'undefined' ? contact_number : null;
    const s_email = seller_email && seller_email !== 'null' && seller_email !== 'undefined' ? seller_email : null;

    console.log("Inserting:", { name, price, stock, image_url, addr, lat, lng, contact, s_email });

    // Insert with location, contact & seller_email
    // Note: Assuming table column is renamed to 'seller_email' or check startup script
    await pool.query(
      "INSERT INTO products (name, price, stock, image_url, address, latitude, longitude, contact_number, seller_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, price, stock, image_url || null, addr, lat, lng, contact, s_email]
    );

    // Return updated list for convenience
    const [rows] = await pool.query("SELECT * FROM products");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Add error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related orders first
    // console.log(`Attempting to delete orders for product_id: ${id}`);
    await pool.query("DELETE FROM orders WHERE product_id = ?", [id]);

    // Then delete the product
    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    // Return updated list
    const [rows] = await pool.query("SELECT * FROM products");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database delete failed" });
  }
});

// --- STOCK ADJUSTMENT ROUTE ---
app.put("/api/products/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment } = req.body; // +1 or -1

    // check current stock first
    const [rows] = await pool.query("SELECT stock FROM products WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const currentStock = rows[0].stock;
    const newStock = currentStock + adjustment; // can be negative if adjustment is negative

    if (newStock < 0) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    await pool.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, id]);

    // Return updated product list for easy sync
    const [allProducts] = await pool.query("SELECT * FROM products");
    res.status(200).json(allProducts);

  } catch (error) {
    console.error("Stock update error:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// --- ORDER ROUTES (Optional, mostly handled inside Razorpay for now, but good for history) ---
app.post("/api/orders", async (req, res) => {
  try {
    const { product_id, product_name, quantity, total_price } = req.body;
    // ... code omitted for brevity as it's not main path
    const [result] = await pool.query(
      "INSERT INTO orders (product_id, product_name, quantity, total_price, order_date) VALUES (?, ?, ?, ?, NOW())",
      [product_id, product_name, quantity, total_price]
    );
    res.status(200).json({ success: true, orderId: result.insertId });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to add order" });
  }
});


// --- CONSTANTS ---
const SECRET_CODES = ['FARMER123', 'GROW_LOCAL', 'HARVEST_2026', 'NATURE_PURE', 'GREEN_FUTURE'];

// --- CONTACT FORM ROUTE ---
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Pick a random secret code
    const randomCode = SECRET_CODES[Math.floor(Math.random() * SECRET_CODES.length)];

    // 2. Email the User with the Code (Auto-Reply)
    const userMailOptions = {
      from: '"Local Harvest Support" <gnsn1200@gmail.com>',
      to: email, // Send to the applicant
      subject: "Your Seller Access Code - Local Harvest",
      text: `Hello ${name},\n\nThank you for your interest in becoming a seller on Local Harvest.\n\nYour Seller Access Code is: ${randomCode}\n\nPlease use this code during signup to create your Producer account.\n\nBest Regards,\nThe Local Harvest Team`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #059669;">Welcome to Local Harvest!</h2>
            <p>Hello <b>${name}</b>,</p>
            <p>Thank you for applying to become a seller. We are excited to have you onboard.</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px;">Your Seller Access Code:</p>
              <h3 style="margin: 10px 0 0; color: #059669; letter-spacing: 2px;">${randomCode}</h3>
            </div>
            <p>Please use this code on the <a href="http://localhost:5173/auth?role=seller&mode=signup" style="color: #059669;">Signup Page</a> to complete your registration.</p>
            <br>
            <p>Best Regards,<br>The Local Harvest Team</p>
          </div>
        `
    };

    await transporter.sendMail(userMailOptions);
    console.log(`Access code ${randomCode} sent to ${email}`);

    res.status(200).json({ success: true, message: "Access code sent to your email!" });

  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// --- NOTIFICATION ROUTE (For Purchase Emails) ---
app.post("/api/notifications/sold", async (req, res) => {
  try {
    const { items, buyerDetails } = req.body;
    // items: array of { id, name, price, seller_email, ... } OR just { id }
    // buyerDetails: { name, address, ... }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items" });
    }

    // Process each item
    for (const item of items) {
      // Find the seller email (best to fetch from DB to be safe, but if we trust frontend...)
      // Let's fetch from DB to be sure we have the latest info
      const [rows] = await pool.query("SELECT name, seller_email FROM products WHERE id = ?", [item.id]);

      if (rows.length > 0) {
        const product = rows[0];
        const sellerEmail = product.seller_email;

        if (sellerEmail) {
          console.log(`Sending sold notification to seller: ${sellerEmail} for product ${product.name}`);
          const mailOptions = {
            from: '"Local Harvest Orders" <no-reply@localharvest.com>',
            to: sellerEmail,
            subject: `New Order: Your "${product.name}" has been purchased!`,
            html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #047857;">New Order Received! 🎉</h2>
                        <p>Hello,</p>
                        <p>Great news! Your product <b>${product.name}</b> has just been purchased by a customer.</p>
                        
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p><b>Product:</b> ${product.name}</p>
                            <p><b>Buyer:</b> ${buyerDetails.name}</p>
                            <p><b>Delivery Address:</b> ${buyerDetails.street}, ${buyerDetails.city}, ${buyerDetails.zip}</p>
                            <p><b>Price:</b> ₹${item.price}</p>
                        </div>
                        
                        <p>Please prepare the item for pickup/delivery.</p>
                        <p style="color: #6b7280; font-size: 12px;">LocalHarvest Team</p>
                    </div>
                `
          };
          await transporter.sendMail(mailOptions);
        } else {
          console.log(`No seller email found for product ${product.name} (ID: ${item.id})`);
        }
      }
    }

    res.status(200).json({ success: true, message: "Notifications sent" });

  } catch (error) {
    console.error("Notification error:", error);
    // RETURN DETAILED ERROR MESSAGE
    res.status(500).json({ error: "Failed to send notifications", details: error.message });
  }
});


// --- RAZORPAY ROUTES ---

// 1. Create Order
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    // Amount from frontend is in RUPEES, Razorpay needs PAISE
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay create order error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// 2. Verify Payment
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "your_razorpay_secret") // TODO: Use env var
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment success!
      // Here we trust the frontend to call the notification endpoint separately
      // Or we could have passed items here and done it all in one go
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);

  // Auto-verify users table on startup
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);
    console.log("🔍 Current User Columns:", columnNames);
    console.log("✅ Users table verification passed");

    // --- Check Products Table for image_url ---
    const [prodColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'image_url'");
    if (prodColumns.length === 0) {
      console.log("⚠️ 'image_url' column missing in 'products'. Adding it now...");
      await pool.query("ALTER TABLE products ADD COLUMN image_url VARCHAR(255)");
      console.log("✅ Added 'image_url' column to 'products'.");
    }

    // --- Check Products Table for Location & Contact ---
    const [locColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'address'");
    if (locColumns.length === 0) {
      console.log("⚠️ Location fields missing. Adding them now...");
      await pool.query("ALTER TABLE products ADD COLUMN address TEXT");
      await pool.query("ALTER TABLE products ADD COLUMN latitude DECIMAL(10, 8)");
      await pool.query("ALTER TABLE products ADD COLUMN longitude DECIMAL(11, 8)");
      console.log("✅ Added location columns to 'products'.");
    }

    const [contactColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'contact_number'");
    if (contactColumns.length === 0) {
      console.log("⚠️ 'contact_number' column missing. Adding it now...");
      await pool.query("ALTER TABLE products ADD COLUMN contact_number VARCHAR(50)");
      console.log("✅ Added 'contact_number' column to 'products'.");
    }

    // --- Check Products Table for Seller Email ---
    const [sellerColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'seller_email'");
    if (sellerColumns.length === 0) {
      console.log("⚠️ 'seller_email' column missing. Adding it now...");
      await pool.query("ALTER TABLE products ADD COLUMN seller_email VARCHAR(255)");
      console.log("✅ Added 'seller_email' column to 'products'.");
    }


  } catch (err) {
    console.error("❌ Database verification failed:", err);
  }
});
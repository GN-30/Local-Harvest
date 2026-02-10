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
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "1h" });

    // Send Welcome Email
    sendWelcomeEmail(email, name, role);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: userId, name, email, role },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
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

    const { name, price, stock, address, latitude, longitude, contact_number } = req.body;

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

    console.log("Inserting:", { name, price, stock, image_url, addr, lat, lng, contact });

    // Insert with location & contact
    await pool.query(
      "INSERT INTO products (name, price, stock, image_url, address, latitude, longitude, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, price, stock, image_url || null, addr, lat, lng, contact]
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

// --- ORDER ROUTES ---

app.post("/api/orders", async (req, res) => {
  try {
    const { product_id, product_name, quantity, total_price } = req.body;

    // 1. Check stock
    const [productRows] = await pool.query("SELECT stock FROM products WHERE id = ?", [product_id]);
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const currentStock = productRows[0].stock;

    if (currentStock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // 2. Deduct stock
    await pool.query("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, product_id]);

    // 3. Create Order
    // proper column is order_date
    const [result] = await pool.query(
      "INSERT INTO orders (product_id, product_name, quantity, total_price, order_date) VALUES (?, ?, ?, ?, NOW())",
      [product_id, product_name, quantity, total_price]
    );

    // Return the new order ID so frontend can track it
    res.status(200).json({ success: true, orderId: result.insertId });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to add order" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY order_date DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --- CANCEL ORDER ---
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    // 1. Get order details to know product and quantity
    const [orderRows] = await pool.query("SELECT product_id, quantity FROM orders WHERE id = ?", [orderId]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const { product_id, quantity } = orderRows[0];

    // 2. Restore stock
    await pool.query("UPDATE products SET stock = stock + ? WHERE id = ?", [quantity, product_id]);

    // 3. Delete order
    await pool.query("DELETE FROM orders WHERE id = ?", [orderId]);

    res.status(200).json({ success: true, message: "Order cancelled and stock restored" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
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
      // Ideally, you should now verify stock again or mark order as paid in DB
      // For now, we return success to frontend
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
      await pool.query("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT NULL");
      console.log("✅ Added 'image_url' column to 'products' table.");
    }

    // --- Check Products Table for location fields ---
    const [locColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'address'");
    if (locColumns.length === 0) {
      console.log("⚠️ Location columns missing. Adding them now...");
      await pool.query(`
            ALTER TABLE products 
            ADD COLUMN address TEXT DEFAULT NULL,
            ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL,
            ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL
        `);
      console.log("✅ Added location columns to 'products' table.");
    } else {
      console.log("✅ Products table schema verification passed (location fields exist).");
    }

    // --- Check Products Table for contact_number ---
    const [contactColumns] = await pool.query("SHOW COLUMNS FROM products LIKE 'contact_number'");
    if (contactColumns.length === 0) {
      console.log("⚠️ 'contact_number' column missing. Adding it now...");
      await pool.query("ALTER TABLE products ADD COLUMN contact_number VARCHAR(20) DEFAULT NULL");
      console.log("✅ Added 'contact_number' column to 'products'.");
    }

  } catch (err) {
    console.error("❌ Table verification failed:", err.message);
  }
});
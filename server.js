const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ✅ Import Routes
const receiptRoutes = require("./routes/receipt");
const authRoutes = require("./routes/auth"); // new auth route

// ✅ Use Routes
app.use("/api/receipt", receiptRoutes);
app.use("/api/auth", authRoutes); // register + login routes

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and MongoDB connection working ✅");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

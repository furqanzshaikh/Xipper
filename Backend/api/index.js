const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("../routes/authRoutes");
const bookingRoutes = require("../routes/bookingRoutes");
const familyRoutes = require("../routes/familyRoutes");

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/family", familyRoutes);

app.get("/", (req, res) => {
  res.send("Working");
});

app.use((err, req, res, next) => {
  res
    .status(500)
    .json({ error: "An unexpected error occurred", details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

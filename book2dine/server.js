const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const restaurantRoutes = require("./routes/restaurants");
const bookingRoutes = require("./routes/bookings");

// Ensure the imported routes are functions
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/bookings", bookingRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = new sqlite3.Database("./database/book2dine.db"); // Update the database path

// CORS Configuration (Fix for session authentication)
app.use(cors({
    origin: "http://localhost:3001", // Replace with your frontend URL
    credentials: true // ✅ Allow credentials (cookies, sessions)
}));

// Middleware
app.use(express.json());
const SQLiteStore = require("connect-sqlite3")(session);

app.use(session({
    store: new SQLiteStore({ db: "sessions.db", dir: "./database" }), // ✅ Persistent storage
    secret: "your_secret_key",
    resave: false,  // ✅ Prevent session from being reset on every request
    saveUninitialized: false,  // ✅ Don't create sessions until needed
    cookie: {
        secure: false,  // Set to `true` in production with HTTPS
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Import routes
const restaurantRoutes = require("./routes/restaurants");
const bookingRoutes = require("./routes/bookings");
const availabilityRoutes = require("./routes/availability"); // New route for availability

// Ensure the imported routes are functions
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes); // Add this route for availability

// Login Route
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        req.session.user = user.username;
        console.log("Session after login:", req.session); // ✅ Debugging: Print session
        res.json({ message: `Logged in as ${user.username}`, user: user.username });
    });
});

// Logout Route (Destroy session)
app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Check Login Status
app.get("/api/auth/status", (req, res) => {
    console.log("Session on status check:", req.session); // ✅ Debugging: Print session data

    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const db = require("../models/database"); // Import the database connection

// Task 1: Retrieve all restaurants in a given location
router.get("/:location", (req, res) => {
    const location = req.params.location;
    const sql = "SELECT * FROM Restaurants WHERE location = ?";

    db.all(sql, [location], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Task 2: Retrieve all restaurants of a given type in a given location
router.get("/:location/:type", (req, res) => {
    const location = req.params.location;
    const type = req.params.type;
    const sql = "SELECT * FROM Restaurants WHERE location = ? AND type = ?";

    db.all(sql, [location, type], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


module.exports = router;

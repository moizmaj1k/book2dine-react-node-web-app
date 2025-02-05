const express = require("express");
const router = express.Router();
const db = require("../models/database"); // Import the database connection

// Fetch available dates for a given restaurant
// Fetch available dates for a given restaurant
router.get("/:restaurantId", (req, res) => {
    const restaurantId = req.params.restaurantId;

    const sql = `
        SELECT theDate
        FROM Availability
        WHERE restID = ?
        ORDER BY theDate ASC
    `;

    db.all(sql, [restaurantId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Convert Julian date to standard date format
        const formattedDates = rows.map(row => {
            const julianDate = row.theDate.toString();
            const year = `20${julianDate.slice(0, 2)}`; // Extract year (assuming format is YYMMDD)
            const month = julianDate.slice(2, 4);
            const day = julianDate.slice(4, 6);

            // Format the date as YYYY-MM-DD
            return {
                theDate: `${year}-${month}-${day}`
            };
        });

        res.json(formattedDates); // Send back the formatted dates
    });
});


module.exports = router;

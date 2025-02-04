const express = require("express");
const router = express.Router();
const db = require("../models/database"); // Import the database connection

// Task 3: Book a restaurant for a given number of people on a given date
router.post("/", (req, res) => {
    const { restaurantId, numPeople, bookingDate, username } = req.body; // Destructure input from request body

    // Check for missing or empty input
    if (!restaurantId || !numPeople || !bookingDate || !username) {
        return res.status(400).json({ error: 'Please provide all required details: restaurant ID, number of people, booking date, and username.' });
    }

    // Remove the first '20' from the year and ensure bookingDate is in the correct format (YYYYMMDD as integer)
    const formattedBookingDate = parseInt(bookingDate.replace(/-/g, '').substring(2));

    // Check if there are enough available seats for the booking
    const checkAvailabilitySql = "SELECT * FROM Availability WHERE restID = ? AND theDate = ?";
    db.get(checkAvailabilitySql, [restaurantId, formattedBookingDate], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If no availability record found for the specified restaurant and date
        if (!row) {
            return res.status(404).json({ message: "No availability record found for this restaurant and date" });
        }

        // Check if there are enough seats available
        const availableSeats = row.maxPlaces - row.bookedSeats;
        if (numPeople > availableSeats) {
            return res.status(400).json({ message: "Not enough available seats" });
        }

        // Update the availability table: reduce the bookedSeats
        const updateAvailabilitySql = "UPDATE Availability SET maxPlaces = maxPlaces - ? WHERE restID = ? AND theDate = ?";
        db.run(updateAvailabilitySql, [numPeople, restaurantId, formattedBookingDate], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Insert the booking record into the bookings table, including the username
            const insertBookingSql = "INSERT INTO Bookings (restID, diners, theDate, username) VALUES (?, ?, ?, ?)";
            db.run(insertBookingSql, [restaurantId, numPeople, formattedBookingDate, username], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // Respond with success message and booking details
                res.status(201).json({
                    message: "Booking successful",
                    bookingId: this.lastID, // Return the newly created booking ID
                    restaurantId,
                    numPeople,
                    bookingDate: formattedBookingDate,
                    username
                });
            });
        });
    });
});

module.exports = router;

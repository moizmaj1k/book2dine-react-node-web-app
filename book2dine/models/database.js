const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, "../database/book2dine.db"), (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

module.exports = db;

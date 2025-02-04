// BookRestaurant.js
import React from 'react';
import axios from 'axios';

const BookRestaurant = ({ restaurantId }) => {
  const numPeople = 4;  // Hardcoded for now
  const bookingDate = "2024-11-01";  // Hardcoded date for now

  const handleBook = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/bookings', {
        restaurantId,
        numPeople,
        bookingDate,
        username: 'john_doe',  // Hardcoded username for now
      });
      alert(`Booking successful! Booking ID: ${response.data.bookingId}`);
    } catch (error) {
      if (error.response) {
        // The server responded with a status code other than 200
        alert(`Error: ${error.response.data.error || 'An unknown error occurred'}`);
      } else {
        // Something else went wrong
        alert('An unexpected error occurred while booking the restaurant.');
      }
    }
  };

  return (
    <button onClick={handleBook} className="book-button">Book</button>
  );
};

export default BookRestaurant;

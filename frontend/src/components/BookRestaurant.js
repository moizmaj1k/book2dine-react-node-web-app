import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookRestaurant = ({ restaurantId }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/auth/status', { withCredentials: true })
      .then(response => {
        console.log("Auth Status Response:", response.data);

        if (response.data.loggedIn && response.data.user) {
          setUsername(response.data.user); // Correct username set
        }
      })
      .catch(error => {
        console.error("Error fetching login status:", error);
      });
  }, []);

  const numPeople = 4;  // Hardcoded for now
  const bookingDate = "2024-11-01";  // Hardcoded date for now

  const handleBook = async () => {
    // Ensure user is logged in
    if (!username || username.trim() === "") {
      alert('You must be logged in to make a booking.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/bookings',
        { restaurantId, numPeople, bookingDate, username }, // Passing username
        { withCredentials: true }
      );
      
      // Check if booking was successful
      if (response.data.message === 'Booking successful') {
        alert(`Booking successful! Booking ID: ${response.data.bookingId}`);
      } else {
        // Handle unexpected responses from the backend
        alert('An unknown error occurred.');
      }
    } catch (error) {
      // Show error message if user is not logged in
      if (error.response?.status === 401) {
        alert('You must be logged in to book a restaurant.');
      } else if (error.response?.status === 400) {
        // If not enough seats available, show the message from backend
        alert(`Error: ${error.response?.data?.message || 'An unknown error occurred'}`);
      } else {
        // Catch all for other errors
        alert(`Error: ${error.response?.data?.error || 'An unknown error occurred'}`);
      }
    }
  };

  return (
    <button onClick={handleBook} className="book-button">Book</button>
  );
};

export default BookRestaurant;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../SearchRestaurants.css';  // Import CSS file for styling

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // To customize the marker icon
import 'leaflet/dist/leaflet.css'; // Leaflet CSS

const SearchRestaurants = () => {
  const [location, setLocation] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default center (London)
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [numPeople, setNumPeople] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  // Handle location search and geocode it
  const handleSearch = async () => {
    try {
      // Get coordinates for the location using OpenStreetMap's Nominatim API (Geocoding)
      const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: location,
          format: 'json',
          limit: 1
        }
      });
  
      // If geocoding is successful, update the map center
      if (geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        const latNum = parseFloat(lat); // Ensure it's a number
        const lonNum = parseFloat(lon); // Ensure it's a number
  
        console.log('Geocoding coordinates:', latNum, lonNum);
  
        // Update map center and zoom level
        setMapCenter([latNum, lonNum]);  // Set the center to the new coordinates
        setZoomLevel(7); // Adjust zoom level as needed
  
        // Fetch restaurants data based on the location
        const response = await axios.get(`http://localhost:3000/api/restaurants/${location}`);
        setRestaurants(response.data);
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      console.error('Error fetching location or restaurants:', error);
    }
  };

  // Fetch available dates for the selected restaurant
  const fetchAvailableDates = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/availability/${restaurantId}`);
      setAvailableDates(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Handle the booking request
  const handleBooking = async () => {
    if (!selectedRestaurant) {
      alert("Please select a restaurant.");
      return;
    }

    if (!bookingDate || !numPeople) {
      alert("Please select a date and number of people.");
      return;
    }

    // Get the username from the session (similar to what you did in the BookRestaurant component)
    let username = '';
    try {
      const response = await axios.get('http://localhost:3000/api/auth/status', { withCredentials: true });
      if (response.data.loggedIn && response.data.user) {
        username = response.data.user;  // Use the username from the session
      }
    } catch (error) {
      console.error('Error fetching login status:', error);
    }

    // If the user isn't logged in, prompt them
    if (!username || username.trim() === "") {
      alert("You must be logged in to make a booking.");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/bookings',
        { restaurantId: selectedRestaurant.id, numPeople, bookingDate, username },  // Pass username here
        { withCredentials: true }
      );
      alert(`Booking successful! Booking ID: ${response.data.bookingId}`);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response?.data?.error || 'No enough available seats';
        alert(`Error: ${errorMessage}`);
      } else {
        alert('Error occurred while making the booking.');
      }
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <br />
      <div className="map-and-restaurants-container">
        {/* Map Container */}
        <div className="map-container">
          <MapContainer
            key={mapCenter.join(',')}  // Forces a re-render whenever mapCenter changes
            center={mapCenter}  // Use the dynamically updated map center
            zoom={zoomLevel}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}  // Ensure the map takes up the full container height
          >
            {/* Tile Layer for OpenStreetMap */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Markers for each restaurant */}
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]} // Assume the restaurant has latitude and longitude
                icon={new L.Icon({
                  iconUrl: require('../assets/marker-icon.png'), // Optional: custom marker icon
                  iconSize: [38, 38],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })}
                eventHandlers={{
                  click: () => {
                    setSelectedRestaurant(restaurant);
                    fetchAvailableDates(restaurant.id); // Fetch available dates when a restaurant is selected
                  }
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{restaurant.name}</h4>
                    <p>{restaurant.type}</p>

                    {/* Booking form inside the popup */}
                    <div>
                      <h4>Booking Details :</h4>
                      <div>
                        <label htmlFor="bookingDate">Select Date:</label>
                        <select
                          id="bookingDate"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="styled-dropdown"
                        >
                          <option value="">Select a date</option>
                          {availableDates.map((dateObj) => (
                            <option key={dateObj.theDate} value={dateObj.theDate}>
                              {dateObj.theDate}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="numPeople">Number of People:</label>
                        <input
                          type="number"
                          id="numPeople"
                          value={numPeople}
                          onChange={(e) => setNumPeople(e.target.value)}
                          min="1"
                          className="styled-input"
                        />
                      </div>

                      <button onClick={handleBooking} className="styled-button">Book Now</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Restaurant Cards */}
        <div className="restaurants-container">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <div className="restaurant-details">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <hr />
                  <p className="restaurant-type">Type of food served: <b>{restaurant.type}</b></p>
                  <p className="restaurant-location">Located in: <b>{restaurant.location}</b></p>
                  <p className="restaurant-description">
                    <i><b>{restaurant.description}</b></i>
                  </p>
                  <button onClick={() => { setMapCenter([restaurant.latitude, restaurant.longitude]); setZoomLevel(15); }} className="styled-button">
                    View on Map
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No restaurants found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRestaurants;

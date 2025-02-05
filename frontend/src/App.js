import React, { useState, useEffect } from 'react';
import './App.css';
import SearchRestaurants from './components/SearchRestaurants';
import axios from 'axios';
import LoginModal from './components/LoginModal';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check if the user is logged in (Ensuring credentials are included)
    axios.get('http://localhost:3000/api/auth/status', { withCredentials: true })
      .then(response => {
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          setShowLogin(true);
        }
      })
      .catch(error => {
        console.error('Error checking login status:', error);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setShowLogin(true);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="App">
      <h1>Book2Dine</h1>

      {user ? (
        <div className="logout-button">
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in to continue.</p>
      )}

      {showLogin && (
        <LoginModal 
          setUser={setUser} 
          setShowLogin={setShowLogin} 
        />
      )}

      <SearchRestaurants />
    </div>
  );
}

export default App;

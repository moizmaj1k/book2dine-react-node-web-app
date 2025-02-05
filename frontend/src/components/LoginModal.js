import React, { useState } from 'react';
import axios from 'axios';
import '../LoginModal.css';

function LoginModal({ setUser, setShowLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", 
        { username, password }, 
        { withCredentials: true } // ✅ Ensure cookies are sent
      );

      if (response.data.user) {
        setUser(response.data.user); // ✅ Update the user state
        alert(`Logged in as ${response.data.user}`);
        setShowLogin(false); // ✅ Close login modal after success
      }
    } catch (error) {
      console.error("Login error:", error);

      // ✅ Improved error handling
      setErrorMessage(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label><b>Username</b></label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label><b>Password</b></label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Login</button>
          {errorMessage && <div className="error">{errorMessage}</div>}
        </form>
      </div>
    </div>
  );
}

export default LoginModal;

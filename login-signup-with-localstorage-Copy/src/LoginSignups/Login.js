import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // Declare state variables at the top of the component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Asynchronous handleLogin function using Axios
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMsg('Email and password are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      setMsg(response.data);
      if (response.data === 'Login successful') {
        localStorage.setItem('currentUser', email); // store current user session
        navigate('/home'); // Redirect to home on success
      }
    } catch (error) {
      setMsg('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {msg && <p>{msg}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

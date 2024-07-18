import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Header from "./img/header-wide.png";
function LoginForm({ setAuthTokens, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });
      const { access, refresh } = response.data;
      setAuthTokens({ access, refresh });
      const decoded = jwtDecode(access);
      setUser({ username: decoded.username });
    } catch (error) {
      setAuthTokens(null);
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <header>
        <img src={Header} alt="header" />
      </header>
      <form className="flex flex-col mb-4" onSubmit={handleSubmit}>
        <div className="mx-auto">
          <div className="flex flex-row">
            <p className="text-gray-700 text-2xl">Login</p>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-b-2 border-gray-700 text-xl"
            />
          </div>

          <div className="flex flex-row">
            <p className="text-gray-700 text-2xl">Password</p>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-b-2 border-gray-700 text-xl"
            />
          </div>
        </div>
        <button
          className="mx-auto text-sm  p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;

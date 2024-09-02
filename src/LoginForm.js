import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Header from "./img/header-wide.png";
import { useNavigate } from "react-router-dom";

function LoginForm({ setAuthTokens, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validEmail = validateMailAddress(email);
    if (!validEmail) {
      setErrorMessage("メールアドレスが不正です");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/token/`, {
        username: email,
        password,
      });
      const { access, refresh } = response.data;
      setAuthTokens({ access, refresh });
      const decoded = jwtDecode(access);
      setUser({ username: decoded.username });
      // /chatへ移動
      navigate("/chat");
    } catch (error) {
      setAuthTokens(null);
      console.error("Login failed:", error);
    }
  };

  const validateMailAddress = (mailAddress) => {
    // メールアドレスのバリデーションチェック
    const mailAddressPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return mailAddressPattern.test(mailAddress);
  };

  return (
    <div>
      <header>
        <img src={Header} alt="header" />
      </header>
      {errorMessage.length > 0 && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}

      <form className="flex flex-col mb-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2  mx-auto">
          <p className="text-gray-700 text-2xl">メールアドレス</p>
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-b-2 border-gray-700 text-xl"
          />

          <p className="text-gray-700 text-2xl">パスワード</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-b-2 border-gray-700 text-xl"
          />
        </div>
        <div className="m-4 mx-auto">
          <div className="md:grid md:gap-0 md:grid-cols-2">
            <button
              className="mt-4 mr-1 text-sm  p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              type="submit"
            >
              ログイン
            </button>
            <button
              className="mt-4 ml-1 text-sm  p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              onClick={(e) => {
                navigate("/register");
              }}
            >
              新規登録
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

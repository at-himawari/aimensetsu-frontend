import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import ChatComponent from "./ChatComponent";
import RegisterForm from "./RegisterForm";
import ErrorModal from "./ErrorModal";
import { useCookies } from "react-cookie";
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function App() {
  const [authTokens, setAuthTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isError, setIsError] = useState({ open: false, message: "" });
  const [isLogin, setIsLogin] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies();
  const navigate = useNavigate();

  // ログイン状態の初期化
  useEffect(() => {
    if (authTokens) {
      setIsLogin(true);
    }
    // Cookieにトークンがあるかどうかを確認
    else if (cookies.authTokens) {
      setAuthTokens(cookies.authTokens);
      setIsLogin(true);
    }
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/"
          element={
            <LoginForm setAuthTokens={setAuthTokens} setUser={setUser} />
          }
        />
        <Route
          path="/chat"
          element={
            <ChatComponent
              authTokens={authTokens}
              user={user}
              setIsError={setIsError}
            />
          }
        />
        <Route
          path="/error_modal"
          element={
            <ErrorModal
              open={isError.open}
              onCancel={() => {
                setIsError({ open: false, message: "" });
                navigate("/chat");
              }}
                  onOk={() => {
                      setIsError({ open: false, message: "" });
                      navigate("/chat");
                  }}
              message={isError.message}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;

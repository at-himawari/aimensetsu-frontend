import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import ChatComponent from "./ChatComponent";
import RegisterForm from "./RegisterForm";
import RegisterConfirmForm from "./RegisterConfirmationForm";
import ErrorModal from "./ErrorModal";
import { useCookies } from "react-cookie";
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ResetPasswordForm from "./ResetPasswordForm";



function App() {
  const [authTokens, setAuthTokens] = useState(null);
  const [isError, setIsError] = useState({ open: false, message: "" });
  const [, setIsLogin] = useState(false);
  const [cookies, , ] = useCookies();
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

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
        <Route path="/resetpassword" element={<ResetPasswordForm/>} />
        <Route path="/register" element={<RegisterForm setUsername={setUsername} username={username} />} />
        <Route path="/confirm" element={<RegisterConfirmForm username={username}/>} />
        <Route 
          path="/"
          element={
            <LoginForm setAuthTokens={setAuthTokens} setUsername={setUsername} username={ username } />
          }
        />
        <Route
          path="/chat"
          element={
            <ChatComponent
              authTokens={authTokens}
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

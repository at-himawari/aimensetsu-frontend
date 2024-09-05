import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Header from "./img/header-wide.png";
import { useNavigate } from "react-router-dom";
import { signIn, fetchAuthSession, signOut } from "@aws-amplify/auth";

function LoginForm({ setAuthTokens, username, setUsername }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const NEXT_STEP_CONFIRM = "CONFIRM_SIGN_UP";
  const INCORRECT_LOGIN = "Incorrect username or password.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validEmail = validateMailAddress(email);
    if (!validEmail) {
      setErrorMessage("メールアドレスが不正です");
      return;
    }
    try {
      // 事前のセッションが残っていればログアウトする
      const idToken = (await fetchAuthSession()).tokens?.idToken;
      if (idToken) {
        await signOut();
      }

      const user = await signIn({
        username: email,
        password: password,
      });

      // 確認コード送信前なら、確認コード送信画面に転送する
      if (user.nextStep.signInStep === NEXT_STEP_CONFIRM) {
        setUsername(email);
        navigate("/confirm");
        return;
      }

      const authTokens = (await fetchAuthSession()).tokens.idToken.toString();

      setAuthTokens(authTokens);

      // /chatへ移動
      navigate("/chat");
    } catch (error) {
      setAuthTokens(null);
      if (error.message === INCORRECT_LOGIN) {
        setErrorMessage("メールアドレスまたはパスワードが違います。");
      }
      console.error(error.message);
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
          <p className="text-red-600 mb-1">{errorMessage}</p>
        </div>
      )}

      <form className="flex flex-col mb-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2  mx-auto">
          <p className="text-gray-700 text-2xl">メールアドレス</p>
          <input
            type="text"
            placeholder="Mail Address"
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

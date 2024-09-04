import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "aws-amplify/auth";

function RegisterForm({ setUsername, username }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    username: [],
    password: [],
  });
  const [success, setSuccess] = useState(false);
  // パスワード確認用のstateを追加
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();

  const validateMailAddress = (mailAddress) => {
    // メールアドレスのバリデーションチェック
    const mailAddressPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return mailAddressPattern.test(mailAddress);
  };
  const UNEXPECTED_ERROR = "原因不明のエラーが発生しました。";
  const USER_ALREADY_EXISTS_MESSAGE = "User already exists";

  const pushError = (errorMessage) => {
    if ("username" in errorMessage) {
      setError({
        username: errorMessage.username,
        password: [],
      });
    }
    if ("password" in errorMessage) {
      setError({
        username: [],
        password: errorMessage.password,
      });
    }
    if (!("password" in errorMessage) && !("username" in errorMessage)) {
      setError({
        username: [UNEXPECTED_ERROR],
      });
    }
  };

  const clearError = () => {
    setError({
      username: [],
      password: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !passwordConfirmation) {
      pushError({ password: ["パスワードを入力してください。"] });
      setSuccess(false);
      return;
    }
    if (password !== passwordConfirmation) {
      pushError({ password: ["パスワードが一致しません。"] });
      setSuccess(false);
      return;
    }
    if (!username) {
      pushError({ username: ["Eメールアドレスを入力してください。"] });
      setSuccess(false);
      return;
    }
    const validEmail = validateMailAddress(username);
    if (!validEmail) {
      pushError({ username: ["Eメールアドレスが不正です。"] });
      return;
    }
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: username,
        password: password,
      });
      
      setSuccess(true);
      setError("");
      navigate("/confirm");
      return;
    } catch (error) {
      if (error.message === USER_ALREADY_EXISTS_MESSAGE) {
        pushError({ username: ["同じユーザが既に存在します"] });
      }
      setSuccess(false);
      console.error(error);
    }
  };

  // 戻るボタンを押した時の処理
  const handleReturnButton = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // 成功したらログインする
  useEffect(() => {
    setUsername("");
    clearError();
  }, []);

  return (
    <div className="register-container m-6">
      <h2 className="text-2xl font-bold mb-4">ユーザー登録</h2>
      {success && (
        <p className="text-green-500">ユーザー登録に成功しました。</p>
      )}
      {error.username.length > 0 && (
        <p className="text-red-600 mb-1">{error.username.join(",")}</p>
      )}
      {error.password.length > 0 && (
        <p className="text-red-600 mb-1">{error.password.join(",")}</p>
      )}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="grid grid-cols-2 gap-4">
          <p>Email</p>
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded"
          />

          <p>パスワード</p>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded"
          />
          <p>パスワード確認</p>
          <input
            type="password"
            placeholder="パスワード確認"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded mr-1"
          >
            登録
          </button>
          <button
            className="p-2 text-white bg-blue-500 rounded ml-1"
            onClick={(e) => handleReturnButton(e)}
          >
            戻る
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // パスワード確認用のstateを追加
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError("パスワードが一致しません。");
      setSuccess(false);
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/api/register/", {
        username,
        password,
      });
      if (response.status === 201) {
        setSuccess(true);
        setError("");
      }
      navigate("/chat");
    } catch (error) {
      setError("ユーザー登録に失敗しました。");
      setSuccess(false);
    }
  };

  // 戻るボタンを押した時の処理
  const handleReturnButton = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // 成功したらログインする
  useEffect(() => {});

  return (
    <div className="register-container m-6">
      <h2 className="text-2xl font-bold mb-4">ユーザー登録</h2>
      {success && (
        <p className="text-green-500">ユーザー登録に成功しました。</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="grid grid-cols-2 gap-4">
          <p>ユーザ名</p>
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
          <button type="submit" className="p-2 bg-blue-500 text-white rounded mr-1">
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmSignUp } from 'aws-amplify/auth';

function RegisterCofirmForm({ username }) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState({
    username: [],
    password: [],
  });
    const [success, setSuccess] = useState(false);
  // パスワード確認用のstateを追加
  const navigate = useNavigate();
  const INVALID_CODE = "Invalid verification code provided, please try again.";

  const UNEXPECTED_ERROR = "原因不明のエラーが発生しました。";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { isSignUpComplete, userId, nextStep } = await confirmSignUp({
        username: username,
        confirmationCode: confirmationCode
      });

      if (!isSignUpComplete) {
        throw Error(UNEXPECTED_ERROR);
      }

      setSuccess(true);
      setError("");

      navigate("/");
    } catch (error) {
        if (error.message === INVALID_CODE) {
            pushError({password:["確認コードが間違っています"]})
          
      }
        
      setSuccess(false);
    }
  };

  // 戻るボタンを押した時の処理
  const handleReturnButton = (e) => {
    e.preventDefault();
    navigate("/");
  };


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
          <p>メールアドレス</p>
          <p>{username}</p>

          <p>確認コード</p>
          <input
            type="password"
            placeholder="確認コード"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
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

export default RegisterCofirmForm;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmSignUp,resendSignUpCode } from "aws-amplify/auth";

function RegisterConfirmationForm({ username }) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isResendButtonDisabled, setIsResendButtonDisabled] = useState(false);
  const [error, setError] = useState({
    username: [],
    password: [],
  });
  // パスワード確認用のstateを追加
  const navigate = useNavigate();
  const INVALID_CODE = "Invalid verification code provided, please try again.";
  const UNEXPECTED_ERROR = "原因不明のエラーが発生しました。";
  const RESEND_MAIL = "確認コードを再送信しました。"

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
        confirmationCode: confirmationCode,
      });

      if (!isSignUpComplete) {
        throw Error(UNEXPECTED_ERROR);
      }

      setError("");

      navigate("/");
    } catch (error) {
      if (error.message === INVALID_CODE) {
        pushError({ password: ["確認コードが間違っています"] });
      }

    }
  };

  // 戻るボタンを押した時の処理
  const handleResendButton = async (e) => {
    e.preventDefault();
    const {
      destination,
      deliveryMedium,
      attributeName
    } = await resendSignUpCode({ username });

    pushError({ username: [RESEND_MAIL] })
    
    setIsResendButtonDisabled(true);

    // 1分間のタイムラグ
    const timeOut = 60 * 1000;
    setTimeout(() => {
      setIsResendButtonDisabled(false);
    }, timeOut);
  };

  return (
    <div className="register-container m-6">
      <h2 className="text-2xl font-bold mb-4">ユーザー登録</h2>
      <p className="mb-5">
        あなたのメールアドレスに確認コードを送付しました。確認コードを入力してください。
      </p>
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
            isResendButtonDisabled={isResendButtonDisabled}
            className="p-2 text-white bg-blue-500 rounded ml-1"
            onClick={(e) => handleResendButton(e)}
          >
            確認コードを再送する
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterConfirmationForm;

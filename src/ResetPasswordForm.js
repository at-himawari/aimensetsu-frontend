import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

function ResetPasswordForm() {
  const [error, setError] = useState({
    username: [],
    password: [],
  });
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isSendButtonClicked, setIsSendButtonClicked] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const validateMailAddress = (mailAddress) => {
    // メールアドレスのバリデーションチェック
    const mailAddressPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return mailAddressPattern.test(mailAddress);
  };
  const UNEXPECTED_ERROR = "原因不明のエラーが発生しました。";
  const LIMIT_EXCEEDED = "Attempt limit exceeded, please try after some time.";
  const INVARID_VERIFICARION_CODE =
    "Invalid verification code provided, please try again.";

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

    if (!username) {
      pushError({ username: ["Eメールアドレスを入力してください。"] });
      return;
    }
    const validEmail = validateMailAddress(username);
    if (!validEmail) {
      pushError({ username: ["Eメールアドレスが不正です。"] });
      return;
    }

    try {
      const output = await resetPassword({ username });
      console.log(output);
      setIsSendButtonClicked(true);
      return;
    } catch (error) {
      if (error.message === LIMIT_EXCEEDED) {
        pushError({
          username: [
            "パスワードをリセットできる上限に到達しました。しばらく経ってからお試しください。",
          ],
        });
      }
      console.error(error);
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirmation) {
      pushError({ password: ["パスワードが一致しません。"] });
      return;
    }
    if (!confirmationCode) {
      pushError({ username: ["確認コードを入力してください。"] });
      return;
    }
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });
    } catch (error) {
      if (error.message === INVARID_VERIFICARION_CODE) {
        pushError({ username: ["確認コードが一致しません。"] });
      }
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
    // 確認コード入力画面
    isSendButtonClicked ? (
      <div className="register-container m-6">
        <h2 className="text-2xl font-bold mb-4 bg-gray-200 p-3">
          パスワードリセット
        </h2>
        <div className="mb-5">
          <p>
            あなたのメールアドレスに確認コードを送付して、パスワードをリセットします。
          </p>
          <p className="bg-stone-400 p-2 my-2 mx-auto">
            確認コードと新しいパスワードを入力してください。
          </p>
        </div>
        {error.username.length > 0 && (
          <p className="text-red-600 mb-1">{error.username.join(",")}</p>
        )}
        {error.password.length > 0 && (
          <p className="text-red-600 mb-1">{error.password.join(",")}</p>
        )}
        <form onSubmit={handleConfirmResetPassword} className="register-form">
          <div className="grid grid-cols-2 gap-4">
            <p>Email</p>
            <input
              type="text"
              value={username}
              className="mb-4 p-2 border-gray-300 rounded"
            />
            <p>確認コード</p>
            <input
              type="text"
              placeholder="確認コード"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <p>新しいパスワード</p>
            <input
              type="password"
              placeholder="新しいパスワード"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <p>新しいパスワード確認</p>
            <input
              type="password"
              placeholder="新しいパスワード確認"
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded mr-1"
            >
              パスワードリセット
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
    ) : (
      // E-mail入力画面
      <>
        <div className="register-container m-6">
          <h2 className="text-2xl font-bold mb-4 bg-gray-200 p-3">
            パスワードリセット
          </h2>
          <div className="mb-5">
            <p>
              あなたのメールアドレスに確認コードを送付して、パスワードをリセットします。
            </p>
            <p className="bg-stone-400 p-2 my-2 mx-auto">
              登録済みのメールアドレスを入力してください。
            </p>
          </div>
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
                placeholder="登録済みメールアドレス"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded mr-1"
              >
                確認コードを送信
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
      </>
    )
  );
}

export default ResetPasswordForm;

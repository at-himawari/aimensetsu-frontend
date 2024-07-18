import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
      });
      if (response.status === 201) {
        setSuccess(true);
        setError('');
      }
    } catch (error) {
      setError('ユーザー登録に失敗しました。');
      setSuccess(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="text-2xl font-bold mb-4">ユーザー登録</h2>
      {success && <p className="text-green-500">ユーザー登録に成功しました。</p>}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">登録</button>
      </form>
    </div>
  );
}

export default RegisterForm;
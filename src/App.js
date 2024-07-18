import React, { useState } from 'react';
import LoginForm from './LoginForm';
import ChatComponent from './ChatComponent';
import RegisterForm from './RegisterForm';
import ErrorModal from './ErrorModal';

function App() {
  const [authTokens, setAuthTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isError, setIsError] = useState({ open: false, message: '' });
  return (
    <div className="App">
      {!authTokens ? (
        <>
          {showRegister ? (
            <RegisterForm />
          ) : (
            <LoginForm setAuthTokens={setAuthTokens} setUser={setUser} />
          )}
          <button onClick={() => setShowRegister(!showRegister)} className="p-2 bg-blue-600 text-white rounded">
            {showRegister ? 'ログイン画面へ' : '新規登録画面へ'}
          </button>
        </>
          ) : (isError.open ? <ErrorModal open={isError.open} onCancel={() => setIsError(false)} message={isError.message} onOk={()=>setIsError(false)} />: <ChatComponent authTokens={authTokens} user={user} setIsError={setIsError} />)}
    </div>
  );
}

export default App;
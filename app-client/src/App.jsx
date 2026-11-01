import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import { api } from './api';

function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    api('/auth/me/').then(({ ok, data }) => {
      if (ok && data?.authenticated) {
        setUser(data.user);
        setScreen('chat');
      } else {
        setScreen('login');
      }
    });
  }, []);

  const handleAuthenticated = (loggedUser) => {
    setUser(loggedUser);
    setScreen('chat');
  };

  const handleLogout = async () => {
    await api('/auth/logout/', { method: 'POST' });
    setUser(null);
    setScreen('login');
  };

  if (screen === 'loading') return null;

  return (
    <div>
      {screen === 'login' && (
        <Login
          onLoginSuccess={handleAuthenticated}
          onNavigateToRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <Register
          onRegisterSuccess={handleAuthenticated}
          onNavigateToLogin={() => setScreen('login')}
        />
      )}

      {screen === 'chat' && <Chat user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
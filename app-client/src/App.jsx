import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import Settings from './Settings';

function App() {
  // Les écrans  : 'login', 'register', 'chat', 'settings'
  const [screen, setScreen] = useState('login');

  return (
    <div>
      {screen === 'login' && (
        <Login 
          onLoginSuccess={() => setScreen('chat')} 
          onNavigateToRegister={() => setScreen('register')} 
        />
      )}

      {screen === 'register' && (
        <Register 
          onRegisterSuccess={() => setScreen('chat')} 
          onNavigateToLogin={() => setScreen('login')} 
        />
      )}

      {screen === 'chat' && (
        <Chat onLogout={() => setScreen('login')} />
      )}

      {screen === 'settings' && (
        <Settings />
      )}
    </div>
  );
}

export default App;

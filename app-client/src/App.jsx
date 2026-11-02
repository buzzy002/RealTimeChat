import { useEffect, useState } from 'react';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import { api } from './api';

const PUBLIC = ['landing', 'login', 'register'];
const screenFromUrl = () => {
  const s = window.location.hash.slice(1);
  return PUBLIC.includes(s) ? s : 'landing';
};
const urlFor = (screen) => (screen === 'landing' ? '/' : `/#${screen}`);

function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);

  // Public screens get their own history entry, so Back works
  const go = (next) => {
    window.history.pushState({ screen: next }, '', urlFor(next));
    setScreen(next);
  };

  useEffect(() => {
    api('/auth/me/').then(({ ok, data }) => {
      if (ok && data?.authenticated) {
        setUser(data.user);
        setScreen('chat');
      } else {
        setScreen(screenFromUrl());
      }
    });

    const onBack = () => setScreen((current) => (current === 'chat' ? 'chat' : screenFromUrl()));
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, []);

  const handleAuthenticated = (loggedUser) => {
    window.history.replaceState({ screen: 'chat' }, '', '/');
    setUser(loggedUser);
    setScreen('chat');
  };

  const handleLogout = async () => {
    await api('/auth/logout/', { method: 'POST' });
    window.history.replaceState({ screen: 'landing' }, '', '/');
    setUser(null);
    setScreen('landing');
  };

  if (screen === 'loading') return null;

  return (
    <div>
      {screen === 'landing' && <Landing onTry={() => go('register')} onLogin={() => go('login')} />}
      {screen === 'login' && (
        <Login onLoginSuccess={handleAuthenticated} onNavigateToRegister={() => go('register')} />
      )}
      {screen === 'register' && (
        <Register onRegisterSuccess={handleAuthenticated} onNavigateToLogin={() => go('login')} />
      )}
      {screen === 'chat' && <Chat user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
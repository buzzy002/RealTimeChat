import React, { useState } from 'react';

function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLoginSuccess();
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    onNavigateToRegister();
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[var(--bg)] text-[var(--ink)] font-sans">
      <div className="w-full max-w-[400px] p-10 px-8 bg-[var(--surface)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-[var(--line)]">
        <h2 className="text-center mb-[30px] text-[var(--ink)] font-semibold text-2xl">
          Connexion
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-[var(--ink-muted)] text-sm">
              Email 
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-3 rounded-md border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--ink)] box-border outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>

          <div className="mb-[25px]">
            <label className="block mb-2 text-[var(--ink-muted)] text-sm">
              Mot de passe
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-3 rounded-md border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--ink)] box-border outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full p-3 bg-[var(--accent)] text-[var(--on-accent)] border-none rounded-md text-base font-bold cursor-pointer mb-5 transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            Se connecter
          </button>
        </form>

        <div className="text-center text-sm text-[var(--ink-muted)]">
          Vous n'avez pas de compte ?{' '}
          <a 
            href="#" 
            onClick={handleRegisterClick}
            className="text-[var(--accent)] no-underline font-semibold transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            Cliquez ici
          </a>
        </div>

      </div>
    </div>
  );
}

export default Login;
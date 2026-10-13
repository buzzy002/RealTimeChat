import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 
import { Button } from "@/components/ui/button";

function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    onRegisterSuccess();
  };

  const toggleVisibility = (setter) => {
    setter(prev => !prev);
  };

  const inputWrapperClass = "relative w-full"; 
  const inputClass = "w-full p-3 pr-12 rounded-md border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--ink)] box-border outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all";
  const iconClass = "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ink-muted)] cursor-pointer hover:text-[var(--ink)] transition-colors";

  return (
    <div className="flex justify-center items-center h-screen bg-[var(--bg)] text-[var(--ink)] font-sans">
      <div className="w-full max-w-[400px] p-10 px-8 bg-[var(--surface)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-[var(--line-strong)]">
        <h2 className="text-center mb-[25px] text-[var(--ink)] font-semibold text-2xl">
          Nouveau membre
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1.5 text-[var(--ink-muted)] text-sm">
              Nom d'utilisateur
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-[var(--ink-muted)] text-sm">
              Email 
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-[var(--ink-muted)] text-sm">
              Mot de passe
            </label>
            <div className={inputWrapperClass}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className={inputClass}
              />
              {showPassword ? (
                <EyeOff onClick={() => toggleVisibility(setShowPassword)} className={iconClass} />
              ) : (
                <Eye onClick={() => toggleVisibility(setShowPassword)} className={iconClass} />
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-1.5 text-[var(--ink-muted)] text-sm">
              Répéter le mot de passe
            </label>
            <div className={inputWrapperClass}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className={inputClass}
              />
              {showConfirmPassword ? (
                <EyeOff onClick={() => toggleVisibility(setShowConfirmPassword)} className={iconClass} />
              ) : (
                <Eye onClick={() => toggleVisibility(setShowConfirmPassword)} className={iconClass} />
              )}
            </div>
          </div>

          {/* Utilisation du Button Shadcn */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] font-bold text-base mb-5 cursor-pointer"
          >
            Inscription
          </Button>
        </form>

        <div className="text-center text-sm text-[var(--ink-muted)]">
          Déjà un compte ?{' '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}
            className="text-[var(--accent)] no-underline font-semibold transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
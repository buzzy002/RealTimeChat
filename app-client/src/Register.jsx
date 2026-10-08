import React, { useState } from 'react';

function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log("Inscription demandée :", { username, email, password });
    // Plus tard, ces informations seront envoyées à l'API Django
    onRegisterSuccess();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#030637', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px 30px', 
        backgroundColor: '#3C0753', 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        color: '#ffffff'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#ffffff', fontWeight: '600' }}>
          Créer un compte B2B
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#e0e0e0', fontSize: '14px' }}>
              Nom d'utilisateur
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #720455', backgroundColor: '#030637', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#e0e0e0', fontSize: '14px' }}>
              Email 
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #720455', backgroundColor: '#030637', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#e0e0e0', fontSize: '14px' }}>
              Mot de passe
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #720455', backgroundColor: '#030637', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#e0e0e0', fontSize: '14px' }}>
              Confirmer le mot de passe
            </label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #720455', backgroundColor: '#030637', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', padding: '12px', backgroundColor: '#720455', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#910A67'} 
            onMouseOut={(e) => e.target.style.backgroundColor = '#720455'}
          >
            S'inscrire
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#e0e0e0' }}>
          Déjà un compte ?{' '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}
            style={{ color: '#910A67', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#ffffff'} 
            onMouseOut={(e) => e.target.style.color = '#910A67'}
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;

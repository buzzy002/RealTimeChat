import React, { useState, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Smile, Send, Settings as SettingsIcon, Menu, X } from 'lucide-react'; 
import Settings from './Settings'; 

function Chat({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice', text: 'Bonjour équipe ! Le projet Django avance bien.', time: '11:45' },
    { id: 2, sender: 'Bob', text: 'Super, j’attaque l’intégration de la base de données de mon côté.', time: '11:47' }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Gestion de la conversation active (type: 'channel' ou 'mp', target: nom du canal ou du destinataire)
  const [activeChat, setActiveChat] = useState({ type: 'channel', target: 'général' });
  
  // État pour basculer entre la vue "chat" et la vue "settings"
  const [currentView, setCurrentView] = useState('chat'); 

  // État pour le menu mobile (Responsive)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sélecteur de fichiers et panneau d'emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Liste des utilisateurs pour les messages directs (MP)
  const directMessagesUsers = [
    { id: 1, name: 'Alice', status: 'online' },
    { id: 2, name: 'Bob', status: 'offline' }
  ];

  const popularEmojis = ["😀", "😂", "😍", "👍", "🔥", "🎉", "❤️", "✨", "🚀", "😎", "🙌", "💡", "💻", "☕", "👏", "🙏"];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'Moi',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setShowEmojiPicker(false); 
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Fichier sélectionné : ${file.name}`);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const inputIconClass = "h-5 w-5 text-ink-muted cursor-pointer hover:text-ink transition-colors";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink font-sans relative">
      
      {/* BOUTON MOBILE (Visible uniquement sur mobile) */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-surface border border-line-strong rounded-lg text-ink shadow-md cursor-pointer"
        title="Ouvrir le menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* BARRE LATÉRALE */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40 w-[260px] bg-surface flex flex-col border-r border-line-strong 
        transform transition-transform duration-200 ease-in-out shadow-xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-line-strong flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold tracking-wide text-ink">Espace B2B</h2>


          {/* Bouton croix pour fermer sur mobile */}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-ink-muted hover:text-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 px-2.5 py-4 overflow-y-auto space-y-6">
          
          {/* Section Canaux Publics */}
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-widest pl-2.5 mb-2 font-semibold">Canaux</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {['général', 'technique', 'marketing'].map((channel) => (
                <li 
                  key={channel}
                  onClick={() => {
                    setActiveChat({ type: 'channel', target: channel });
                    setCurrentView('chat'); 
                    setMobileMenuOpen(false); 
                  }}
                  className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                    currentView === 'chat' && activeChat.type === 'channel' && activeChat.target === channel 
                      ? "bg-accent font-bold text-on-accent shadow-sm" 
                      : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                  }`}
                >
                  # {channel}
                </li>
              ))}
            </ul>
          </div>

          {/* Section Messages Directs (MP) */}
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-widest pl-2.5 mb-2 font-semibold">Messages directs</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {directMessagesUsers.map((user) => (
                <li 
                  key={user.id}
                  onClick={() => {
                    setActiveChat({ type: 'dm', target: user.name });
                    setCurrentView('chat'); 
                    setMobileMenuOpen(false); // Ferme le menu sur mobile
                  }}
                  className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors flex items-center justify-between ${
                    currentView === 'chat' && activeChat.type === 'dm' && activeChat.target === user.name 
                      ? "bg-accent font-bold text-on-accent shadow-sm" 
                      : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {user.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Boutons du bas (Paramètres + Déconnexion) */}
        <div className="p-5 border-t border-line-strong space-y-2">
          <Button 
            onClick={() => {
              setCurrentView('settings');
              setMobileMenuOpen(false);
            }}
            variant={currentView === 'settings' ? "default" : "outline"}
            className={`w-full transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2 ${
              currentView === 'settings' 
                ? "bg-accent text-on-accent" 
                : "bg-transparent text-ink border-line-strong hover:bg-surface-raised hover:text-ink"
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            Paramètres
          </Button>

          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent text-ink border-line-strong hover:bg-surface-raised hover:text-ink transition-colors font-semibold cursor-pointer"
          >
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* ZONE PRINCIPALE (Affichage dynamique : Chat ou Paramètres) */}
      <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden w-full">
        
        {/* En-tête (avec un décalage à gauche sur mobile pour ne pas cacher le bouton burger) */}
        <div className="p-5 pl-16 md:pl-5 border-b border-line-strong flex items-center shadow-sm">
          <h3 className="m-0 text-lg font-semibold tracking-wide text-ink">
            {currentView === 'settings' 
              ? 'Paramètres du compte' 
              : (activeChat.type === 'channel' ? `#${activeChat.target}` : `@ ${activeChat.target}`)}
          </h3>
        </div>

        {currentView === 'settings' ? (
          /* VUE PARAMÈTRES */
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="max-w-4xl mx-auto pb-10">
              <Settings />
            </div>
          </ScrollArea>
        ) : (
          /* VUE CHAT CLASSIQUE (Canal ou MP) */
          <>
            <ScrollArea className="flex-1 p-4 md:p-5">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                      msg.sender === 'Moi' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-xs text-ink-muted mb-1">
                      {msg.sender} • {msg.time}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl leading-relaxed text-sm shadow-sm ${
                      msg.sender === 'Moi' 
                        ? 'bg-accent text-on-accent rounded-tr-none font-medium' 
                        : 'bg-surface-raised text-ink rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Barre d'envoi du message */}
            <div className="p-4 md:p-5 bg-bg relative">
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50 p-3 bg-surface border border-line-strong rounded-xl shadow-2xl grid grid-cols-4 gap-2 w-52">
                  {popularEmojis.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl hover:bg-surface-raised p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <div className="relative flex-1 h-11">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Smile 
                      onClick={() => setShowEmojiPicker(prev => !prev)} 
                      className={inputIconClass} 
                      title="Choisir un emoji"
                    />            
                  </div>

                  <Input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeChat.type === 'channel' ? `Envoyer un message dans #${activeChat.target}` : `Envoyer un message à @${activeChat.target}`}
                    className="w-full h-full pl-12 pr-12 bg-surface border-line-strong text-ink placeholder-ink-muted/50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 rounded-lg text-sm"
                  />

                  <Paperclip 
                    onClick={() => fileInputRef.current.click()} 
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${inputIconClass}`} 
                    title="Joindre un fichier"
                  />
                </div>

                <Button 
                  type="submit"
                  className="h-11 px-4 md:px-6 bg-accent hover:bg-accent-hover text-on-accent font-bold rounded-lg transition-all cursor-pointer flex items-center shrink-0"
                >
                  <Send className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Envoyer</span>
                </Button>
              </form>
            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default Chat;
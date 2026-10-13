import React, { useState, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Paperclip, Smile, Send } from 'lucide-react'; 

function Chat({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice', text: 'Bonjour équipe ! Le projet Django avance bien.', time: '11:45' },
    { id: 2, sender: 'Bob', text: 'Super, j’attaque l’intégration de la base de données de mon côté.', time: '11:47' }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState('général');

  // Sélecteur de fichiers et le panneau d'emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Liste des emojis populaires
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

  // Ajoute l'emoji cliqué dans le champ de texte
  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false); // Optionnel : ferme le panneau après sélection
  };

  const inputIconClass = "h-5 w-5 text-[var(--ink-muted)] cursor-pointer hover:text-[var(--ink)] transition-colors";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)] font-sans">
      
      {/* 1. BARRE LATÉRALE */}
      <div className="w-[260px] bg-[var(--surface)] flex flex-col border-r border-[var(--line-strong)]">
        <div className="p-5 border-b border-[var(--line-strong)]">
          <h2 className="m-0 text-lg font-bold tracking-wide text-[var(--ink)]">Espace B2B</h2>
        </div>
        
        <div className="flex-1 px-2.5 py-4">
          <p className="text-xs text-[var(--ink-muted)] uppercase tracking-widest pl-2.5 mb-2 font-semibold">Canaux</p>
          <ul className="list-none p-0 m-0 space-y-1">
            {['général', 'technique', 'marketing'].map((channel) => (
              <li 
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                  activeChannel === channel 
                    ? "bg-[var(--accent)] font-bold text-[var(--on-accent)] shadow-sm" 
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
                }`}
              >
                # {channel}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 border-t border-[var(--line-strong)]">
          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent text-[var(--ink)] border-[var(--line-strong)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] transition-colors font-semibold cursor-pointer"
          >
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* 2. ZONE DE DISCUSSION PRINCIPALE */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg)]">
        <div className="p-5 border-b border-[var(--line-strong)] flex items-center shadow-sm">
          <h3 className="m-0 text-lg font-semibold tracking-wide text-[var(--ink)]">#{activeChannel}</h3>
        </div>

        <ScrollArea className="flex-1 p-5">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[70%] ${
                  msg.sender === 'Moi' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-xs text-[var(--ink-muted)] mb-1">
                  {msg.sender} • {msg.time}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl leading-relaxed text-sm shadow-sm ${
                  msg.sender === 'Moi' 
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] rounded-tr-none font-medium' 
                    : 'bg-[var(--surface-raised)] text-[var(--ink)] rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Barre d'envoi du message */}
        <div className="p-5 bg-[var(--bg)] relative">
          
          {/* PANNEAU FLOTTANT DES EMOJIS */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-5 z-50 p-3 bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl shadow-2xl grid grid-cols-4 gap-2 w-52">
              {popularEmojis.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:bg-[var(--surface-raised)] p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
            
            {/* Input file masqué pour le trombone */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            <div className="relative flex-1 h-11">
              
              {/* Icône Emojis */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Smile 
                  onClick={() => setShowEmojiPicker(prev => !prev)} 
                  className={inputIconClass} 
                  title="Choisir un emoji"
                />                
              </div>

              {/* Champ Input */}
              <Input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Envoyer un message dans #${activeChannel}`}
                className="w-full h-full pl-12 pr-12 bg-[var(--surface)] border-[var(--line-strong)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0 rounded-lg"
              />

              {/* Icône Fichier / Trombone */}
              <Paperclip 
                onClick={() => fileInputRef.current.click()} 
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${inputIconClass}`} 
                title="Joindre un fichier"
              />
              
            </div>

            {/* Bouton Envoyer */}
            <Button 
              type="submit"
              className="h-11 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold rounded-lg transition-all cursor-pointer flex items-center"
            >
              <Send className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">Envoyer</span>
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
}

export default Chat;
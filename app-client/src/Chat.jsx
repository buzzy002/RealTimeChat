import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function Chat({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice', text: 'Bonjour équipe ! Le projet Django avance bien.', time: '11:45' },
    { id: 2, sender: 'Bob', text: 'Super, j’attaque l’intégration de la base de données de mon côté.', time: '11:47' }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState('général');

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
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030637] text-white font-sans">
      
      {/* 1. BARRE LATÉRALE (SIDEBAR) */}
      <div className="w-[260px] bg-[#3C0753] flex flex-col border-r border-[#720455]">
        {/* En-tête Sidebar */}
        <div className="p-5 border-b border-[#720455]">
          <h2 className="m-0 text-lg font-bold tracking-wide">Espace B2B</h2>
        </div>
        
        {/* Liste des canaux */}
        <div className="flex-1 px-2.5 py-4">
          <p className="text-xs text-[#e0e0e0]/70 uppercase tracking-widest pl-2.5 mb-2 font-semibold">Canaux</p>
          <ul className="list-none p-0 m-0 space-y-1">
            {['général', 'technique', 'marketing'].map((channel) => (
              <li 
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                  activeChannel === channel 
                    ? "bg-[#720455] font-bold text-white shadow-sm shadow-[#720455]/30" 
                    : "text-[#e0e0e0] hover:bg-[#720455]/40 hover:text-white"
                }`}
              >
                # {channel}
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton Déconnexion tout en bas */}
        <div className="p-5 border-t border-[#720455]">
          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent text-[#e0e0e0] border-[#720455] hover:bg-[#910A67] hover:text-white transition-colors font-semibold"
          >
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* 2. ZONE DE DISCUSSION PRINCIPALE */}
      <div className="flex-1 flex flex-col h-full bg-[#030637]">
        {/* En-tête du canal */}
        <div className="p-5 border-b border-[#3C0753] flex items-center shadow-sm">
          <h3 className="m-0 text-lg font-semibold tracking-wide">#{activeChannel}</h3>
        </div>

        {/* Historique des messages (avec le ScrollArea fluide de shadcn) */}
        <ScrollArea className="flex-1 p-5">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[70%] ${
                  msg.sender === 'Moi' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-xs text-[#e0e0e0]/70 mb-1">
                  {msg.sender} • {msg.time}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl leading-relaxed text-sm shadow-sm ${
                  msg.sender === 'Moi' 
                    ? 'bg-[#720455] text-white rounded-tr-none' 
                    : 'bg-[#3C0753] text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Barre d'envoi du message */}
        <div className="p-5 bg-[#030637]">
          <form onSubmit={handleSendMessage} className="flex gap-2.5">
            <Input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Envoyer un message dans #${activeChannel}`}
              className="flex-1 h-11 bg-[#3C0753] border-[#720455] text-white placeholder-[#e0e0e0]/50 focus-visible:ring-1 focus-visible:ring-[#910A67] focus-visible:ring-offset-0 rounded-lg"
            />
            <Button 
              type="submit"
              className="h-11 px-6 bg-[#910A67] hover:bg-[#910A67]/80 text-white font-bold rounded-lg shadow-md shadow-[#910A67]/20 transition-all"
            >
              Envoyer
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
}

export default Chat;

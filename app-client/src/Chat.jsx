import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Smile, Send, Menu } from 'lucide-react'; 
import { api, errorMessages } from './api';

const toUi = (m) => ({
  id: m.id,
  sender: m.sender,
  text: m.text,
  time: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
})

const UnreadBadge = ({ count }) =>
  count > 0 ? (
    <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

function Chat({ onLogout, user }) {

  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const [inputText, setInputText] = useState('');

  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState(null);
  const [newChannel, setNewChannel] = useState('');
  const [channelError, setChannelError] = useState('');

  const [users, setUsers] = useState([]);
  const groupChannels = channels.filter((c) => !c.is_direct);
  const directChannels = channels.filter((c) => c.is_direct);
  const active = channels.find((c) => c.id === channelId);
  const activeLabel = !active ? '' : active.is_direct ? `@${active.name}` : `#${active.name}`;
  const currentWorkspaceId = channels.find((c) => c.id === channelId)?.workspace_id ?? channels[0]?.workspace_id;
  const channelIdRef = useRef(null);
  const channelsRef = useRef([]);
  useEffect(() => {
    channelIdRef.current = channelId;
    channelsRef.current = channels;
  });
  const refreshChannels = () =>
  api('/channels/').then(({ ok, data }) => {
    if (ok) setChannels(data.channels);
  });

  const [unread, setUnread] = useState({});
  const [toast, setToast] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sélecteur de fichiers et le panneau d'emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Liste des emojis populaires
  const popularEmojis = ["😀", "😂", "😍", "👍", "🔥", "🎉", "❤️", "✨", "🚀", "😎", "🙌", "💡", "💻", "☕", "👏", "🙏"];

  useEffect(() => {
    api('/channels/').then(({ ok, data }) => {
      if (!ok) return;
      setChannels(data.channels);
      const first = data.channels.find((c) => !c.is_direct) ?? data.channels[0];
      setChannelId(first?.id ?? null);
    });
    api('/users/').then(({ ok, data }) => {
      if (ok) setUsers(data.users);
    });
  }, []);

  useEffect(() => {
    let retry;
    let stopped = false;

    const connect = () => {
      if (channelId === null) return;
      setMessages([]);
      setUnread((prev) => ({ ...prev, [channelId]: 0 }));
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/channels/${channelId}/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'history') setMessages(data.messages.map(toUi));
        if (data.type === 'message') setMessages((prev) => [...prev, toUi(data.message)]);
      };
      ws.onclose = () => {
        if (!stopped) retry = setTimeout(connect, 2000);
      };
      socketRef.current = ws;
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      socketRef.current?.close();
    };
  }, [channelId]);

  useEffect(() => {
    let retry;
    let stopped = false;
    let socket;

    const connect = () => {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      socket = new WebSocket(`${proto}://${window.location.host}/ws/notifications/`);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== 'notify' || data.channel_id === channelIdRef.current) return;

        setUnread((prev) => ({ ...prev, [data.channel_id]: (prev[data.channel_id] ?? 0) + 1 }));

        const known = channelsRef.current.find((c) => c.id === data.channel_id);
        if (!known) refreshChannels(); // a new channel, or a first direct message
        const sender = data.message.sender;
        setToast({
          channelId: data.channel_id,
          title: !known
            ? `New message from ${sender}`
            : known.is_direct
              ? `${sender} (direct message)`
              : `${sender} in #${known.name}`,
          text: data.message.text,
        });
      };
      socket.onclose = () => {
        if (!stopped) retry = setTimeout(connect, 2000);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const totalUnread = Object.values(unread).reduce((sum, n) => sum + n, 0);
  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) RealTimeChat` : 'RealTimeChat';
  }, [totalUnread]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    const ws = socketRef.current;
    if (!text || ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ content: text }));
    setInputText('');
    setShowEmojiPicker(false);
  };

  const openDirect = async (other) => {
    setSidebarOpen(false);
    const existing = directChannels.find((c) => c.name === other.username);
    if (existing) {
      setChannelId(existing.id);
      return;
    }
    const { ok, data } = await api('/dms/', { method: 'POST', body: { user_id: other.id } });
    if (!ok) return;
    setChannels((prev) =>
      prev.some((c) => c.id === data.channel.id) ? prev : [...prev, data.channel]
    );
    setChannelId(data.channel.id);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setChannelError('');
    const { ok, data } = await api('/channels/', {
      method: 'POST',
      body: { name: newChannel, workspace_id: currentWorkspaceId },
    });
    if (ok) {
      setChannels((prev) => [...prev, data.channel]);
      setChannelId(data.channel.id);
      setNewChannel('');
    } else {
      setChannelError(errorMessages(data).join(' '));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File sharing : coming soon.`);
    }
  };

  // Ajoute l'emoji cliqué dans le champ de texte
  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false); // Optionnel : ferme le panneau après sélection
  };

  const inputIconClass = "h-5 w-5 text-[var(--ink-muted)] cursor-pointer hover:text-[var(--ink)] transition-colors";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--bg)] text-[var(--ink)] font-sans">
      
      {/* 1. BARRE LATÉRALE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[var(--surface)] flex flex-col border-r border-[var(--line-strong)] transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-5 border-b border-[var(--line-strong)]">
          <h2 className="m-0 text-lg font-bold tracking-wide text-[var(--ink)]">RealTimeChat</h2>
        </div>
        
        <div className="flex-1 px-2.5 py-4 overflow-y-auto space-y-6">
          {/* Group channels */}
          <div>
            <p className="text-xs text-[var(--ink-muted)] uppercase tracking-widest pl-2.5 mb-2 font-semibold">Channels</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {groupChannels.length === 0 && (
                <li className="px-3 py-2 text-sm text-[var(--ink-muted)]">
                  No channels yet: ask an admin to add you to a workspace.
                </li>
              )}
              {groupChannels.map((channel) => (
                <li
                  key={channel.id}
                  onClick={() => { setChannelId(channel.id); setSidebarOpen(false); }}
                  className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors flex items-center justify-between ${
                    channelId === channel.id
                      ? "bg-[var(--accent)] font-bold text-[var(--on-accent)] shadow-sm"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span># {channel.name}</span>
                  <UnreadBadge count={unread[channel.id]} />
                </li>
              ))}
            </ul>

            {currentWorkspaceId && (
              <form onSubmit={handleCreateChannel} className="mt-3 px-2.5">
                <input
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="+ New channel"
                  maxLength={100}
                  aria-label="New channel name"
                  className="w-full px-3 py-2 rounded-md text-sm bg-[var(--surface-raised)] text-[var(--ink)] placeholder-[var(--ink-muted)]"
                />
                {channelError && (
                  <p role="alert" className="mt-1 text-xs text-red-300">{channelError}</p>
                )}
              </form>
            )}
          </div>

          <div>
            <p className="text-xs text-[var(--ink-muted)] uppercase tracking-widest pl-2.5 mb-2 font-semibold">Direct messages</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {users.length === 0 && (
                <li className="px-3 py-2 text-sm text-[var(--ink-muted)]">No colleagues yet.</li>
              )}
              {users.map((u) => {
                const dm = directChannels.find((c) => c.name === u.username);
                const selected = dm !== undefined && dm.id === channelId;
                return (
                  <li
                    key={u.id}
                    onClick={() => openDirect(u)}
                    className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors flex items-center justify-between ${
                      selected
                        ? "bg-[var(--accent)] font-bold text-[var(--on-accent)] shadow-sm"
                        : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span>@ {u.username}</span>
                    <UnreadBadge count={dm ? unread[dm.id] : 0} />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--line-strong)]">
          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent text-[var(--ink)] border-[var(--line-strong)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] transition-colors font-semibold cursor-pointer"
          >
            Log out
          </Button>
        </div>
      </div>

      {/* 2. ZONE DE DISCUSSION PRINCIPALE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg)]">
        <div className="p-3 md:p-5 border-b border-[var(--line-strong)] flex items-center gap-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h3 className="m-0 text-lg font-semibold tracking-wide text-[var(--ink)] truncate">{activeLabel}</h3>
        </div>

        <ScrollArea className="flex-1 p-5">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[70%] ${
                  msg.sender === user?.username ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-xs text-[var(--ink-muted)] mb-1">
                  {msg.sender} • {msg.time}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl leading-relaxed text-sm shadow-sm ${
                  msg.sender === user?.username 
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
                  title="Insert emoji"
                />                
              </div>

              {/* Champ Input */}
              <Input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeLabel}`}
                className="w-full h-full pl-12 pr-12 bg-[var(--surface)] border-[var(--line-strong)] text-[var(--ink)] placeholder-[var(--ink-muted)]/50 focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0 rounded-lg"
              />

              {/* Icône Fichier / Trombone */}
              <Paperclip 
                onClick={() => fileInputRef.current.click()} 
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${inputIconClass}`} 
                title="Attach a file"
              />
              
            </div>

            {/* Bouton Envoyer */}
            <Button 
              type="submit"
              className="h-11 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold rounded-lg transition-all cursor-pointer flex items-center"
            >
              <Send className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>

      </div>

      {toast && (
        <button
          type="button"
          onClick={() => { setChannelId(toast.channelId); setToast(null); setSidebarOpen(false); }}
          className="fixed bottom-24 right-4 z-50 max-w-xs text-left p-4 rounded-xl shadow-2xl bg-[var(--surface)] border border-[var(--line-strong)] cursor-pointer"
        >
          <p className="m-0 text-xs font-semibold text-[var(--ink-muted)]">{toast.title}</p>
          <p className="m-0 mt-1 text-sm text-[var(--ink)] line-clamp-2">{toast.text}</p>
        </button>
      )}

    </div>
  );
}

export default Chat;
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, X, Send, ArrowLeft } from 'lucide-react';

export default function ChatWidget() {
  const { currentUser } = useAuth();
  const { chats, sendMessage, activeChatUser, setActiveChatUser } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeChatUser) setIsOpen(true);
  }, [activeChatUser]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, chats, activeChatUser]);

  if (!currentUser) return null;

  const myChats = chats.filter(c => c.senderId === currentUser.id || c.receiverId === currentUser.id);
  const contactIdsRaw = [...new Set(myChats.map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId))];
  const contactIds = ['sys_support', ...contactIdsRaw.filter(id => id !== 'sys_support')];
  
  const activeMessages = activeChatUser 
    ? myChats.filter(c => (c.senderId === activeChatUser.id && c.receiverId === currentUser.id) || 
                          (c.senderId === currentUser.id && c.receiverId === activeChatUser.id)).sort((a,b) => a.timestamp - b.timestamp)
    : [];

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;
    
    try {
      sendMessage(activeChatUser.id, inputText);
      setInputText('');
    } catch (err) {
      console.error("Chat Send Error:", err);
      alert("Oops! Could not send message.");
    }
  };

  const unreadCount = myChats.filter(c => c.receiverId === currentUser.id && !c.read).length;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', position: 'relative', pointerEvents: 'auto' }}
        >
          <MessageSquare size={28} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--error)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{ width: 350, height: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', pointerEvents: 'auto', background: 'rgba(20,20,30,0.95)' }}>
          
          <div style={{ padding: '1rem', background: 'var(--accent-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeChatUser && (
                <button onClick={() => setActiveChatUser(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem', borderRadius: '50%' }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {activeChatUser ? `Chat with ${activeChatUser.name}` : 'Conversations'}
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20}/></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'transparent' }}>
            {!activeChatUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {contactIds.map(uid => {
                  const isSupport = uid === 'sys_support';
                  let latestMsg = myChats.filter(c => c.senderId === uid || c.receiverId === uid).sort((a,b) => b.timestamp - a.timestamp)[0];
                  
                  if (!latestMsg && isSupport) {
                    latestMsg = { timestamp: Date.now(), text: "Need help? Message our support bot.", read: true, receiverId: currentUser.id };
                  } else if (!latestMsg) return null;

                  const isUnread = latestMsg.receiverId === currentUser.id && !latestMsg.read;
                  const counterpartName = isSupport ? 'CommuteIQ Support' : (latestMsg.senderName === currentUser.name ? latestMsg.receiverName || 'User' : latestMsg.senderName || 'User');
                  
                  return (
                    <button key={uid} onClick={() => setActiveChatUser({ id: uid, name: counterpartName })} style={{ width: '100%', padding: '1rem', background: isUnread ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-surface-elevated)', border: `1px solid ${isUnread ? 'var(--accent-primary)' : 'var(--border-glass)'}`, borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: isUnread ? 700 : 500, color: isSupport ? 'var(--accent-secondary)' : 'white', fontSize: '0.9rem' }}>
                        <span>{counterpartName} {isSupport && '🤖'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(latestMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {latestMsg.senderId === currentUser.id ? 'You: ' : ''}{latestMsg.text}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {activeChatUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.9rem' }}>Type a message below to say hello!</div>
                ) : (
                  activeMessages.map(msg => {
                    const isMine = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%', background: isMine ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)', color: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', borderBottomRightRadius: isMine ? 2 : 12, borderBottomLeftRadius: isMine ? 12 : 2, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem', wordBreak: 'break-word' }}>{msg.text}</div>
                        <div style={{ fontSize: '0.65rem', color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textAlign: 'right' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} style={{ height: 1 }} />
              </div>
            )}
          </div>

          {activeChatUser && (
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  autoFocus
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Message..." 
                  style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none', fontSize: '0.9rem' }} 
                />
                <button type="submit" disabled={!inputText.trim()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: inputText.trim() ? 'var(--accent-secondary)' : 'var(--bg-surface-elevated)', color: inputText.trim() ? 'black' : 'var(--text-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

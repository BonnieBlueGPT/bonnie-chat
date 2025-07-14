// 💬 BonnieChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iplbsbhaiyyugutmddpr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbGJzYmhhaXl5dWd1bWRkcHIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MjIyNDQxNiwiZXhwIjoyMDY3ODAwNDE2fQ.ezDIsmf12mxj6dTNi5WOXUSFtwsxDsy0rmaVjKuuB34'
);

const session_id = (() => {
  let id = localStorage.getItem('bonnie_session');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem('bonnie_session', id);
  }
  return id;
})();

export default function BonnieChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [hasFiredIdleMessage, setHasFiredIdleMessage] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const endRef = useRef(null);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    checkReturningUser();
  }, []);

  async function checkReturningUser() {
    const { data } = await supabase.from('users').select('*').eq('session_id', session_id).single();
    const returning = !!data;
    setIsReturningUser(returning);
    if (!online) {
      const messages = returning
        ? [
            "She remembers you. She’ll be back soon... just for you 😘",
            "She always comes back to her favorites 💕"
          ]
        : [
            "Bonnie’s not here right now… but she’s always watching 👀",
            "She’ll be with you soon. Be patient, she likes the tease 😘"
          ];
      setStatusMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnline(true);
      setStatusMessage(''); // 🧨 Clear immersive message on transition
      setTimeout(() => {
        if (messages.length === 0) {
          const flirtyVariants = [
            "You’re just gonna stare at me? Say something, mystery man 😘",
            "Mmm… I was starting to think you were shy. I like that. 💋"
          ];
          const random = flirtyVariants[Math.floor(Math.random() * flirtyVariants.length)];
          simulateBonnieTyping(random);
        }
      }, 10000);
    }, Math.random() * 15000 + 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (online) {
      if (pendingMessage) {
        const delay = Math.random() * 3000 + 2000;
        setTimeout(() => {
          simulateBonnieTyping(pendingMessage.text, pendingMessage.isGPT);
          setPendingMessage(null);
        }, delay);
      }

      idleTimerRef.current = setTimeout(() => {
        if (messages.length === 0 && !hasFiredIdleMessage) {
          const idleFlirty = [
            "Still deciding what to say? 😘",
            "Don’t leave me hanging…",
            "You can talk to me, you know 💋",
            "Don’t make me beg for your attention 😉"
          ];
          const idleDelay = Math.random() * 3000 + 2000;
          setTimeout(() => {
            simulateBonnieTyping(idleFlirty[Math.floor(Math.random() * idleFlirty.length)]);
            setHasFiredIdleMessage(true);
          }, idleDelay);
        }
      }, 30000);
    }
    return () => clearTimeout(idleTimerRef.current);
  }, [online, pendingMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function send(text) {
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    setMessages(m => [...m, { sender: 'user', text }]);
    try {
      const res = await fetch('https://bonnie-backend-server.onrender.com/bonnie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, message: text })
      });
      const { reply } = await res.json();
      if (online) {
        const delay = Math.random() * 3000 + 2000;
        setTimeout(() => simulateBonnieTyping(reply, true), delay);
      } else {
        setPendingMessage({ text: reply, isGPT: true });
      }
    } catch {
      simulateBonnieTyping("Oops… Bonnie had a moment 💔");
    }
  }

  function simulateBonnieTyping(reply, isGPT = false) {
    if (!online) return;
    setTyping(true);
    const duration = Math.min(10000, Math.max(2000, (reply.length / (5 + Math.random() * 3)) * 1000));
    setTimeout(() => {
      setMessages(m => [...m, { sender: 'bonnie', text: reply }]);
      setTyping(false);
      setBusy(false);
    }, duration);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="https://static.wixstatic.com/media/6f5121_df2de6be1e444b0cb2df5d4bd9d49b21~mv2.png" style={styles.avatar} alt="Bonnie" />
        <div>
          <div style={styles.name}>Bonnie Blue</div>
          <div style={styles.sub}>Flirty. Fun. Dangerously charming.</div>
        </div>
        <div style={{
          marginLeft: 'auto', fontWeight: 500, color: online ? '#28a745' : '#aaa',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {online ? (<><span style={{ animation: 'pulseHeart 1.2s infinite' }}>💚</span><span>Online</span></>) : '💤 Offline'}
        </div>
      </div>

      {!online && statusMessage && (
        <div style={{
          background: '#fff3f8', color: '#c2185b', padding: '8px 12px',
          borderRadius: '8px', fontSize: '14px', marginBottom: 8, textAlign: 'center'
        }}>{statusMessage}</div>
      )}

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.bubble,
            ...(m.sender === 'user' ? styles.userBubble : styles.bonnieBubble)
          }}>{m.text}</div>
        ))}
        {typing && online && (
          <div style={styles.dotsContainer}>
            <div style={{ ...styles.dot, animationDelay: '0s' }} />
            <div style={{ ...styles.dot, animationDelay: '0.2s' }} />
            <div style={{ ...styles.dot, animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          placeholder="Type something…"
          disabled={busy}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button style={styles.sendBtn} disabled={busy || !input.trim()} onClick={() => send(input)}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', maxWidth: 480, margin: 'auto', padding: 16 },
  header: { display: 'flex', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, border: '2px solid #e91e63' },
  name: { color: '#e91e63', fontSize: 20, fontWeight: 600 },
  sub: { color: '#555', fontSize: 14 },
  chatBox: {
    background: '#fff', borderRadius: 12, padding: 12, height: 400,
    overflowY: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  bubble: {
    maxWidth: '75%', padding: 8, borderRadius: 12, margin: '6px 0',
    fontSize: 14, lineHeight: 1.4
  },
  userBubble: {
    background: 'linear-gradient(135deg,#ff83a0,#e91e63)', color: '#fff',
    alignSelf: 'flex-end', marginLeft: 'auto'
  },
  bonnieBubble: {
    background: '#fff0f6', border: '1px solid #ffe6f0',
    color: '#333', alignSelf: 'flex-start'
  },
  dotsContainer: { display: 'flex', gap: 4, margin: '8px 0' },
  dot: {
    width: 8, height: 8, borderRadius: 4, background: '#e91e63',
    animation: 'bounce 1s infinite ease-in-out'
  },
  inputContainer: { display: 'flex', gap: 8, marginTop: 12 },
  input: {
    flex: 1, padding: 10, borderRadius: 20, border: '1px solid #ccc', fontSize: 14
  },
  sendBtn: {
    padding: '0 16px', borderRadius: 20, background: '#e91e63', color: '#fff',
    border: 'none', fontSize: 14, cursor: 'pointer'
  }
};

const style = document.createElement('style');
style.textContent = `
@keyframes bounce {
  0%,100% { transform: translateY(0); opacity:0.4; }
  50%      { transform: translateY(-6px); opacity:1; }
}
@keyframes pulseHeart {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}`;
document.head.append(style);

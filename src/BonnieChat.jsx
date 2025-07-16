// 💬 BonnieChat.jsx — v15.4 Typing Rhythm Upgrade (5 chars/sec, no cap)
import React, { useEffect, useRef, useState } from 'react';

const CHAT_API_ENDPOINT = 'https://bonnie-backend-server.onrender.com/bonnie-chat';
const session_id = (() => {
  let id = localStorage.getItem('bonnie_session');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem('bonnie_session', id);
    window.__BONNIE_FIRST_VISIT = true;
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
  const endRef = useRef(null);
  const idleTimerRef = useRef(null);

  const randomFlirtyOpeners = [
    "Be honest… are you here to flirt with me? 😘",
    "I bet you’re the type who likes a little trouble. Am I right? 💋",
    "Mmm… what would you *do* to me if I were there right now?",
    "Should I call you *daddy*, or do you want to earn it first? 😈",
    "One question… how bad do you want me right now?"
  ];

  useEffect(() => {
    if (window.__BONNIE_FIRST_VISIT) {
      setTimeout(() => simulateBonnieTyping("Hold on… Bonnie’s just slipping into something more comfortable 😘"), 3000);
    }
    const timer = setTimeout(() => {
      setOnline(true);
      if (messages.length === 0) {
        const opener = randomFlirtyOpeners[Math.floor(Math.random() * randomFlirtyOpeners.length)];
        simulateBonnieTyping(opener);
      }
    }, Math.random() * 15000 + 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (online && pendingMessage) {
      const delay = Math.random() * 3000 + 2000;
      setTimeout(() => {
        simulateBonnieTyping(pendingMessage.text);
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
    return () => clearTimeout(idleTimerRef.current);
  }, [online, pendingMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function addMessage(text, sender) {
    setMessages(m => [...m, { sender, text }]);
  }

  async function send(text) {
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    await addMessage(text, 'user');
    try {
      const res = await fetch(CHAT_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, message: text })
      });
      const { reply } = await res.json();
      if (online) {
        simulateBonnieTyping(reply);
      } else {
        setPendingMessage({ text: reply });
      }
    } catch {
      simulateBonnieTyping("Oops… Bonnie had a moment 💔");
    }
  }

  function simulateBonnieTyping(replyArray) {
    if (!online) return;

    const parts = Array.isArray(replyArray)
      ? replyArray
      : replyArray.split('<EOM>').map(p => p.trim()).filter(Boolean);

    (async function play(index = 0) {
      if (index >= parts.length) {
        setBusy(false);
        return;
      }

      // 1. Thinking time before showing typing dots
      await new Promise(res => setTimeout(res, 1200));

      // 2. Show typing dots
      setTyping(true);

      // 3. Typing delay = 200ms per character (5 chars/sec), no cap
      const typingTime = parts[index].length * 200;
      await new Promise(res => setTimeout(res, typingTime));

      // 4. Hide typing and display message
      setTyping(false);
      await addMessage(parts[index], 'bonnie');

      // 5. Wait 1–3s before next message
      const nextDelay = Math.random() * 2000 + 1000;
      setTimeout(() => play(index + 1), nextDelay);
    })();
  }

  return (
    <div style={{ fontFamily: 'Segoe UI', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: 8 }}>
        <img src="https://static.wixstatic.com/media/6f5121_df2de6be1e444b0cb2df5d4bd9d49b21~mv2.png" style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12, border: '2px solid #e91e63' }} alt="Bonnie" />
        <div>
          <div style={{ color: '#e91e63', fontSize: 20, fontWeight: 600 }}>Bonnie Blue</div>
          <div style={{ color: '#555', fontSize: 14 }}>Flirty. Fun. Dangerously charming.</div>
          <a href="https://x.com/trainmybonnie" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#e91e63', textDecoration: 'none' }}>💋 Follow me on X</a>
        </div>
        <div style={{ marginLeft: 'auto', fontWeight: 500, color: online ? '#28a745' : '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {online ? (<><span style={{ animation: 'pulseHeart 1.2s infinite' }}>💚</span><span>Online</span></>) : '💤 Offline'}
        </div>
      </div>

      {/* chat box */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            maxWidth: '75%', padding: 8, borderRadius: 12, margin: '6px 0', fontSize: 14, lineHeight: 1.4,
            ...(m.sender === 'user'
              ? { background: 'linear-gradient(135deg,#ff83a0,#e91e63)', color: '#fff', alignSelf: 'flex-end', marginLeft: 'auto' }
              : { background: '#fff0f6', border: '1px solid #ffe6f0', color: '#333', alignSelf: 'flex-start' })
          }}>{m.text}</div>
        ))}
        {typing && online && (
          <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#e91e63', animation: 'bounce 1s infinite ease-in-out', animationDelay: '0s' }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#e91e63', animation: 'bounce 1s infinite ease-in-out', animationDelay: '0.2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#e91e63', animation: 'bounce 1s infinite ease-in-out', animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: 8, borderTop: '1px solid #eee' }}>
        <input
          style={{ flex: 1, padding: 12, borderRadius: 30, border: '1px solid #ccc', fontSize: 16 }}
          value={input}
          placeholder="Type something…"
          disabled={busy}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button
          style={{ padding: '0 16px', borderRadius: 30, background: '#e91e63', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer' }}
          disabled={busy || !input.trim()}
          onClick={() => send(input)}>
          Send
        </button>
      </div>
    </div>
  );
}

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

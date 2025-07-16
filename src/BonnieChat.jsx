// 💬 BonnieChat.jsx — Structured [1]/[2]/[3] Reply Playback Upgrade v2
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

  useEffect(() => {
    if (window.__BONNIE_FIRST_VISIT) {
      setTimeout(() => simulateBonnieTyping("Hold on… Bonnie’s just slipping into something more comfortable 😘"), 3000);
    }
    const timer = setTimeout(() => {
      setOnline(true);
      if (messages.length === 0) {
        simulateBonnieTyping("Be honest… are you here to flirt with me? 😘");
      }
    }, Math.random() * 15000 + 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (online && pendingMessage) {
      setTimeout(() => {
        simulateBonnieTyping(pendingMessage.text, pendingMessage.isGPT);
        setPendingMessage(null);
      }, Math.random() * 3000 + 2000);
    }
    idleTimerRef.current = setTimeout(() => {
      if (messages.length === 0 && !hasFiredIdleMessage) {
        setTimeout(() => {
          simulateBonnieTyping("Still deciding what to say? 😘");
          setHasFiredIdleMessage(true);
        }, Math.random() * 3000 + 2000);
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
        simulateBonnieTyping(reply, true);
      } else {
        setPendingMessage({ text: reply, isGPT: true });
      }
    } catch {
      simulateBonnieTyping("Oops… Bonnie had a moment 💔");
    }
  }

  function simulateBonnieTyping(reply, isGPT = false) {
    if (!online) return;
    const numberedPattern = /(?:Message\s*[1-3]:|\[\d\])/;
    const parts = reply.split(/(?:Message\s*[1-3]:|\[\d\])/).filter(p => p.trim());

    if (isGPT && parts.length >= 2) {
      const charsPerSecond = 5;
      console.log("💖 BONNIE SPLIT REPLY DEBUG 💖\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📜 Full Original:", reply);
      console.log("🪄 Format Used: Numbered");
      parts.forEach((p, i) => console.log(`${i === 0 ? '🔹' : i === 1 ? '🔸' : '❤️'} ${i + 1}: \"${p.trim()}\"`));
      console.log("⌨️ Typing Sequence:", "min 1s → dots → 5cps → send w/ 1.5s delay");

      (async function play(index = 0) {
        if (index >= parts.length) return setBusy(false);

        const preDelay = 1000 + Math.random() * 2000; // min 1s max 3s
        await new Promise(r => setTimeout(r, preDelay));
        setTyping(true);

        const text = parts[index].trim();
        const typingTime = (text.length / charsPerSecond) * 1000;
        const minDots = 1500;
        await new Promise(r => setTimeout(r, Math.max(minDots, typingTime)));

        setTyping(false);
        await addMessage(text, 'bonnie');

        if (index < parts.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
          play(index + 1);
        } else {
          setBusy(false);
        }
      })();
      return;
    }

    setTyping(true);
    const duration = Math.min(10000, Math.max(2000, (reply.length / (5 + Math.random() * 3)) * 1000));
    setTimeout(async () => {
      setTyping(false);
      await addMessage(reply, 'bonnie');
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
          <a href="https://x.com/trainmybonnie" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#e91e63', textDecoration: 'none' }}>💋 Follow me on X</a>
        </div>
        <div style={{ marginLeft: 'auto', fontWeight: 500, color: online ? '#28a745' : '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {online ? (<><span style={{ animation: 'pulseHeart 1.2s infinite' }}>💚</span><span>Online</span></>) : '💤 Offline'}
        </div>
      </div>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.bubble, ...(m.sender === 'user' ? styles.userBubble : styles.bonnieBubble) }}>{m.text}</div>
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
        <input style={styles.input} value={input} placeholder="Type something…" disabled={busy} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} />
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
  chatBox: { background: '#fff', borderRadius: 12, padding: 12, height: 400, overflowY: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  bubble: { maxWidth: '75%', padding: 8, borderRadius: 12, margin: '6px 0', fontSize: 14, lineHeight: 1.4 },
  userBubble: { background: 'linear-gradient(135deg,#ff83a0,#e91e63)', color: '#fff', alignSelf: 'flex-end', marginLeft: 'auto' },
  bonnieBubble: { background: '#fff0f6', border: '1px solid #ffe6f0', color: '#333', alignSelf: 'flex-start' },
  dotsContainer: { display: 'flex', gap: 4, margin: '8px 0' },
  dot: { width: 8, height: 8, borderRadius: 4, background: '#e91e63', animation: 'bounce 1s infinite ease-in-out' },
  inputContainer: { display: 'flex', gap: 8, marginTop: 12 },
  input: { flex: 1, padding: 10, borderRadius: 20, border: '1px solid #ccc', fontSize: 14 },
  sendBtn: { padding: '0 16px', borderRadius: 20, background: '#e91e63', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer' }
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

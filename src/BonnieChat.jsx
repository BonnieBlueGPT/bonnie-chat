// 💬 BonnieChat.jsx
import React, { useEffect, useRef, useState } from 'react';

const AIRTABLE_ENDPOINT = 'https://api.airtable.com/v0/appxKl5q1IUiIiMu7/bonnie_logs';
const AIRTABLE_KEY = 'patXXLidHvUoNlM3F';
const CHAT_API_ENDPOINT = 'https://bonnie-backend-server.onrender.com/bonnie-chat';
const session_id = (() => {
  let id = localStorage.getItem('bonnie_session');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem('bonnie_session', id);
  }
  return id;
})();

async function logToAirtable(sender, message) {
  fetch(AIRTABLE_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: { session_id, sender, message, timestamp: new Date().toISOString() }
    })
  }).catch(console.error);
}

export default function BonnieChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [hasFiredIdleMessage, setHasFiredIdleMessage] = useState(false);
  const [presets, setPresets] = useState([
    'Do you miss me?',
    'What are you wearing?',
    'What’s your biggest fantasy?'
  ]);
  const endRef = useRef(null);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnline(true);
    }, Math.random() * 15000 + 5000); // 5–20s delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (online) {
      if (pendingMessage) {
        const delay = Math.random() * 3000 + 2000; // 2–5s
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

  async function addMessage(text, sender) {
    setMessages(m => [...m, { sender, text }]);
    await logToAirtable(sender, text);
  }

  async function send(text) {
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    await addMessage(text, 'user');

    if (presets.includes(text)) {
      setPresets(p => p.filter(q => q !== text));
      const scripted = {
        'Do you miss me?': 'Always… you’re my favorite part of the day 🥰',
        'What are you wearing?': 'Something soft... wish you were here 😘',
        'What’s your biggest fantasy?': 'Maybe I’ll tell you if you behave… 🔥'
      }[text];

      if (scripted) {
        if (online) {
          const delay = Math.random() * 3000 + 2000;
          setTimeout(() => simulateBonnieTyping(scripted), delay);
        } else {
          setPendingMessage({ text: scripted, isGPT: false });
        }
        return;
      }
    }

    try {
      const res = await fetch(CHAT_API_ENDPOINT, {
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
    const length = reply.length || 0;
    const charsPerSecond = 5 + Math.random() * 3;
    const duration = Math.min(10000, Math.max(2000, (length / charsPerSecond) * 1000));
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
        </div>
        <div style={{
          marginLeft: 'auto',
          fontWeight: 500,
          color: online ? '#28a745' : '#aaa',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {online ? (
            <>
              <span style={{ animation: 'pulseHeart 1.2s infinite' }}>💚</span>
              <span>Online</span>
            </>
          ) : '💤 Offline'}
        </div>
      </div>

      {presets.length > 0 && (
        <div style={styles.presetContainer}>
          {presets.map(q => (
            <button key={q} style={styles.presetBtn} onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.bubble,
            ...(m.sender === 'user' ? styles.userBubble : styles.bonnieBubble)
          }}>
            {m.text}
          </div>
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
        <button
          style={styles.sendBtn}
          disabled={busy || !input.trim()}
          onClick={() => send(input)}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Segoe UI, sans-serif', maxWidth: 480, margin: 'auto', padding: 16
  },
  header: { display: 'flex', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, border: '2px solid #e91e63' },
  name: { color: '#e91e63', fontSize: 20, fontWeight: 600 },
  sub: { color: '#555', fontSize: 14 },
  presetContainer: {
    display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12
  },
  presetBtn: {
    flex: '1 1 45%', background: '#fde0ec', border: 'none',
    borderRadius: 20, padding: '8px 12px', fontSize: 14, color: '#880e4f', cursor: 'pointer'
  },
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
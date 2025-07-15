// 💬 BonnieChat.jsx — Supabase Fix v1.2.3: Remove Airtable Logging
import React, { useEffect, useRef, useState } from 'react';

const CHAT_API_ENDPOINT = 'https://bonnie-backend-server.onrender.com/bonnie-chat';
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
    const isFirstTime = !localStorage.getItem('bonnie_first_time');
    if (isFirstTime) {
      console.log("🆕 First-time user detected — showing tease");
      simulateBonnieTyping("Hold on… Bonnie’s just slipping into something more comfortable 😘");
      localStorage.setItem('bonnie_first_time', 'true');
    } else {
      console.log("🔁 Returning user — skipping tease");
    }

    const timer = setTimeout(() => {
      setOnline(true);
      console.log("✅ Bonnie is now online");
      if (messages.length === 0) {
        const opener = randomFlirtyOpeners[Math.floor(Math.random() * randomFlirtyOpeners.length)];
        simulateBonnieTyping(opener);
      }
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

  function addMessage(text, sender) {
    setMessages(m => [...m, { sender, text }]);
  }

  async function send(text) {
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    addMessage(text, 'user');

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

    const slutParts = reply.match(/Message 1:(.*?)Message 2:(.*?)Message 3:(.*)/s);
    if (isGPT && slutParts) {
      const m1 = slutParts[1].trim();
      const m2 = slutParts[2].trim();
      const m3 = slutParts[3].trim();

      const messages = [m1, m2, m3];
      let delay = 2000;

      (async function playSequence(index = 0) {
        if (index >= messages.length) {
          setBusy(false);
          return;
        }
        setTyping(true);
        const text = messages[index];
        await new Promise(resolve => setTimeout(resolve, delay));
        setTyping(false);
        addMessage(text, 'bonnie');
        delay = Math.random() * 2000 + 2000;
        setTimeout(() => playSequence(index + 1), delay);
      })();
      return;
    }

    setTyping(true);
    const duration = Math.min(10000, Math.max(2000, (reply.length / (5 + Math.random() * 3)) * 1000));
    setTimeout(() => {
      setTyping(false);
      addMessage(reply, 'bonnie');
      setBusy(false);
    }, duration);
  }

  return (
    <div style={styles.container}>
      {/* Insert your existing UI layout (unchanged) */}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', maxWidth: 480, margin: 'auto', padding: 16 }
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

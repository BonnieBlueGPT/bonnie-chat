// 💬 BonnieChat.jsx — Slut Mode v1.2.2: Debugging + First-Time Tease Fix
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
      console.log("👗 Tease triggered");
    } else {
      console.log("🔁 Returning user — skipping tease");
    }

    const timer = setTimeout(() => {
      setOnline(true);
      console.log("✅ Bonnie is now online");
      if (messages.length === 0) {
        const opener = randomFlirtyOpeners[Math.floor(Math.random() * randomFlirtyOpeners.length)];
        console.log("💋 Random opener:", opener);
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

  async function addMessage(text, sender) {
    setMessages(m => [...m, { sender, text }]);
    await logToAirtable(sender, text);
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
        await addMessage(text, 'bonnie');
        delay = Math.random() * 2000 + 2000;
        setTimeout(() => playSequence(index + 1), delay);
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
      {/* UI rendering — unchanged */}
    </div>
  );
}

const styles = {
  // your existing styles unchanged
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

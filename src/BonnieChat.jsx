// BonnieChat.jsx — v15 GPT-Fusion EOM Reader Upgrade
import React, { useEffect, useRef, useState } from 'react';
import './BonnieDashboard.css';

const BonnieChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setTyping] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, sender = 'user') => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    const userMessage = input.trim();
    addMessage(userMessage, 'user');
    setInput('');
    setBusy(true);
    simulateBonnieTyping('...', 'typing');

    try {
      const session_id = localStorage.getItem('bonnie_user') || `guest_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('bonnie_user', session_id);

      const res = await fetch('https://bonnie-backend-server.onrender.com/bonnie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, message: userMessage })
      });
      const data = await res.json();
      const reply = data.reply || '...';

      if (reply.includes('<EOM>')) {
        const parts = reply.split('<EOM>').map(p => p.trim()).filter(Boolean);
        for (let i = 0; i < parts.length; i++) {
          setTyping(true);
          await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
          setTyping(false);
          await addMessage(parts[i], 'bonnie');
          await new Promise(r => setTimeout(r, 1000 + Math.random() * 1200));
        }
        setBusy(false);
        return;
      }

      const duration = Math.min(10000, Math.max(2000, (reply.length / (5 + Math.random() * 3)) * 1000));
      setTimeout(() => {
        setTyping(false);
        addMessage(reply, 'bonnie');
        setBusy(false);
      }, duration);
    } catch (err) {
      setTyping(false);
      addMessage('Oops… something broke 😢 Try again?', 'bonnie');
      setBusy(false);
    }
  };

  const simulateBonnieTyping = (text, sender) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (text !== '...') addMessage(text, sender);
    }, 1500);
  };

  return (
    <div className="bonnie-chat-container">
      <div className="bonnie-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`bonnie-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="bonnie-message bonnie typing">Bonnie is typing...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="bonnie-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
        />
        <button type="submit" disabled={isBusy}>Send</button>
      </form>
    </div>
  );
};

export default BonnieChat;
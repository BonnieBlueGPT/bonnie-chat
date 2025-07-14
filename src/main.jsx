import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BonnieChat from './BonnieChat.jsx';
import Dashboard from './BonnieDashboard.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<BonnieChat />} />
        <Route path="/secret123" element={<Dashboard />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

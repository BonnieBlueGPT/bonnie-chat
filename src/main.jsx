import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BonnieChat from './BonnieChat.jsx';
import BonnieDashboard from './BonnieDashboard.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BonnieChat />} />
        <Route path="/secret123" element={<BonnieDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

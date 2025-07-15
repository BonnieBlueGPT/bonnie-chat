import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iplbsbhaiyyugutmddpr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbGJzYmhhaXl5dWd1dG1kZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjQ0MTYsImV4cCI6MjA2NzgwMDQxNn0.ezDIsmf12mxj6dTNi5WOXUSFtwsxDsy0rmaVjKuuB34'
);

const BonnieDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeSessions, setActiveSessions] = useState(0);
  const [todayUsers, setTodayUsers] = useState(0);
  const [todayMessages, setTodayMessages] = useState(0);
  const [currentChatDuration, setCurrentChatDuration] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('bonnie_memory')
        .select('*')
        .gte('created_at', today.toISOString());

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      const sessions = new Map();
      let messages = 0;
      let activeCount = 0;
      let latestSessionTime = null;

      data.forEach(entry => {
        sessions.set(entry.session_id, true);
        messages++;
        if (entry.created_at) {
          const msgTime = new Date(entry.created_at).getTime();
          if (!latestSessionTime || msgTime > latestSessionTime) {
            latestSessionTime = msgTime;
          }
        }
      });

      const sessionArray = [...sessions.keys()];
      setTodayUsers(sessionArray.length);
      setTodayMessages(messages);
      setActiveSessions(sessionArray.length > 0 ? 1 : 0);

      if (latestSessionTime) {
        const durationMs = Date.now() - latestSessionTime;
        const durationMin = Math.floor(durationMs / 60000);
        setCurrentChatDuration(`${durationMin} minute${durationMin !== 1 ? 's' : ''} long`);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold mb-6">Bonnie Activity</h1>

      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-center space-x-2 text-lg">
          <span className="text-green-500">●</span>
          <span>Bonnie is {isOnline ? 'online' : 'offline'}</span>
        </div>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-center space-x-2 text-lg">
          <span className="text-white">💬</span>
          <span>{activeSessions > 0 ? `${activeSessions} active session now` : 'No one talking to Bonnie'}</span>
        </div>
      </div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-900 rounded-2xl p-4 shadow-lg text-center">
          <div className="text-sm text-zinc-400">People talked to Bonnie today</div>
          <div className="text-2xl font-bold">{todayUsers}</div>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 shadow-lg text-center">
          <div className="text-sm text-zinc-400">Messages sent</div>
          <div className="text-2xl font-bold">{todayMessages}</div>
        </div>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center space-x-2 text-lg">
          <span className="text-white">⏱️</span>
          <span>Current chat: {currentChatDuration || 'Not active'}</span>
        </div>
      </div>
    </div>
  );
};

export default BonnieDashboard;
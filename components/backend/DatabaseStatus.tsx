'use client';

import { useState, useEffect } from 'react';

interface DatabaseStatusProps {
  className?: string;
}

export default function DatabaseStatus({ className = '' }: DatabaseStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkDatabaseStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/cards');
      const data = await response.json();
      
      // Check if we're getting real data or fallback data
      if (data.source === 'database') {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkDatabaseStatus();
    // Check every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50';
      case 'disconnected': return 'text-amber-600 bg-amber-50';
      case 'checking': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Database Connected';
      case 'disconnected': return 'Using Fallback Data';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor()} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'disconnected' ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`} />
      <span>{getStatusText()}</span>
      {lastChecked && (
        <span className="text-xs opacity-70">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
      <button 
        onClick={checkDatabaseStatus}
        className="ml-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
        title="Refresh status"
      >
        ↻
      </button>
    </div>
  );
}

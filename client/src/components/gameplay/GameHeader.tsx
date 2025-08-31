import { Badge } from '../shared/Badge';

interface GameHeaderProps {
  wordLength: number;
  isConnected: boolean;
  timeRemaining: number;
}

export function GameHeader({ wordLength, isConnected, timeRemaining }: GameHeaderProps) {
  return (
    <div className="header">
      <div>
        <h1 className="title">TikTok Wordle</h1>
        <p style={{ margin: '0.5rem 0', color: '#94a3b8' }}>Live Interactive Word Game</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge>Length: {wordLength}</Badge>
        
        <Badge variant={isConnected ? 'connected' : 'disconnected'}>
          {isConnected ? '🟢 Live' : '🔴 Connecting...'}
        </Badge>
        
        {isConnected && (
          <Badge 
            variant={timeRemaining <= 5 ? 'urgent' : 'timer'}
            style={{
              backgroundColor: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              borderColor: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              color: timeRemaining <= 5 ? '#ef4444' : '#3b82f6'
            }}
          >
            ⏱️ {timeRemaining}s
          </Badge>
        )}
      </div>
    </div>
  );
}
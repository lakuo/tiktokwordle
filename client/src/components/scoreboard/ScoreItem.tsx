import { Winner } from '../../types';
import { Badge } from '../shared/Badge';

interface ScoreItemProps {
  playerName: string;
  winCount: number;
  playerIndex: number;
  playerData?: { name: string; avatar: string | null };
  lastWinner?: Winner;
}

export function ScoreItem({ playerName, winCount, playerIndex, playerData, lastWinner }: ScoreItemProps) {
  const isLastWinner = playerName === lastWinner?.name;
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div 
      className="score-item"
      style={{ 
        backgroundColor: isLastWinner ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>
          {getRankIcon(playerIndex)}
        </span>
        
        {playerData?.avatar ? (
          <img 
            src={playerData.avatar} 
            alt={playerName}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(147, 51, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#a855f7'
          }}>
            {playerName.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div>
          <div style={{ fontWeight: 'bold' }}>{playerName}</div>
          {isLastWinner && (
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>⚡ Latest Winner</div>
          )}
        </div>
      </div>
      
      <Badge 
        style={{ 
          backgroundColor: isLastWinner ? 'rgba(16, 185, 129, 0.2)' : undefined 
        }}
      >
        {winCount} {winCount === 1 ? 'win' : 'wins'}
      </Badge>
    </div>
  );
}
import { Player } from '../../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatar({ player, size = 'md', className = '' }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: { width: '24px', height: '24px', fontSize: '12px' },
    md: { width: '32px', height: '32px', fontSize: '14px' },
    lg: { width: '40px', height: '40px', fontSize: '16px' }
  };

  const sizeStyle = sizeClasses[size];

  if (player.avatar) {
    return (
      <img 
        src={player.avatar} 
        alt={player.name}
        className={className}
        style={{
          ...sizeStyle,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <div 
      className={className}
      style={{
        ...sizeStyle,
        borderRadius: '50%',
        backgroundColor: 'rgba(147, 51, 234, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#a855f7'
      }}
    >
      {player.name.charAt(0).toUpperCase()}
    </div>
  );
}
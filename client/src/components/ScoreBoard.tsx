import React from 'react';
import { Crown, Medal, Trophy, Zap } from 'lucide-react';
import { scoreItemVariants, scoreBadgeVariants, iconContainerVariants } from '../lib/styles';
import { cn } from '../lib/utils';

export function Scoreboard({
  scores,
  lastWinnerName
}: {
  scores: Record<string, number>;
  lastWinnerName?: string;
}) {
  const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <div className="h-5 w-5 flex items-center justify-center text-purple-300 font-bold text-sm">#{index + 1}</div>;
    }
  };

  const getVariants = (index: number, isWinner: boolean) => {
    if (isWinner) return { rank: 'winner' as const, badge: 'winner' as const, icon: 'winner' as const };
    if (index < 3) return { rank: 'top' as const, badge: 'top' as const, icon: 'top' as const };
    return { rank: 'normal' as const, badge: 'normal' as const, icon: 'normal' as const };
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="space-y-3">
          <div className={iconContainerVariants({ variant: 'success' }) + " w-12 h-12 mx-auto rounded-full flex items-center justify-center"}>
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <p className="text-emerald-200 font-medium">No winners yet!</p>
          <p className="text-sm text-emerald-300/70">Be the first to guess correctly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(([name, score], index) => {
        const isWinner = name === lastWinnerName;
        const variants = getVariants(index, isWinner);
        
        return (
          <div
            key={name}
            className={scoreItemVariants({ rank: variants.rank, panel: 'glass' })}
          >
            <div className="flex items-center space-x-3">
              <div className={cn("flex-shrink-0", iconContainerVariants({ variant: variants.icon }))}>
                {getRankIcon(index)}
              </div>
              <div>
                <p className={cn(
                  'font-medium truncate max-w-32',
                  isWinner ? 'text-emerald-100' : index < 3 ? 'text-yellow-100' : 'text-purple-100'
                )}>
                  {name}
                </p>
                {isWinner && (
                  <div className="flex items-center space-x-1 text-emerald-300 text-xs">
                    <Zap className="h-3 w-3" />
                    <span>Latest Winner</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={scoreBadgeVariants({ variant: variants.badge })}>
                {score} {score === 1 ? 'win' : 'wins'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

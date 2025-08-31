import React from 'react';
import { Trophy, Sparkles, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function WinnerModal({
  visible,
  name,
  avatar,
  word
}: {
  visible: boolean;
  name: string;
  avatar?: string | null;
  word: string;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop with particles effect */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="h-4 w-4 text-yellow-400 opacity-60" />
          </div>
        ))}
      </div>

      {/* Main modal */}
      <div className="relative z-10 animate-winner-pop">
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 rounded-3xl shadow-2xl border-4 border-yellow-400/50 min-w-96 text-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur-xl opacity-50 scale-110" />
          
          <div className="relative space-y-6">
            {/* Header with trophy */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-lg scale-150" />
                <div className="relative p-4 bg-yellow-400/20 rounded-full border-2 border-yellow-300/50">
                  <Trophy className="h-12 w-12 text-yellow-300" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Winner info */}
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-4">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name}
                    className="w-16 h-16 rounded-full border-4 border-yellow-300/70 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-4 border-yellow-300/70 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                    {name}
                  </h2>
                  <p className="text-yellow-200 font-medium text-lg">
                    🎉 Winner! 🎉
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-yellow-100 text-sm font-medium mb-2">Correct Word:</p>
                <div className="flex justify-center space-x-2">
                  {word.split('').map((letter, i) => (
                    <div 
                      key={i}
                      className="w-12 h-12 bg-emerald-700/80 border-2 border-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Celebration text */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white drop-shadow-lg">
                🌟 Congratulations! 🌟
              </p>
              <p className="text-yellow-200/90 font-medium">
                You solved it perfectly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

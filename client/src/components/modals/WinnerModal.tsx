interface WinnerModalProps {
  visible: boolean;
  winnerName: string;
  targetWord: string;
}

export function WinnerModal({ visible, winnerName, targetWord }: WinnerModalProps) {
  if (!visible) return null;
  
  const isTimeout = winnerName === "Time's up!";
  
  return (
    <div className="winner-modal">
      <h2>{isTimeout ? "Time's up!" : `${winnerName} wins!`}</h2>
      <p>Word: {targetWord}</p>
    </div>
  );
}
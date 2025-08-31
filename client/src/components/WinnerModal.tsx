import React from "react";

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
    <div className="winner">
      {avatar ? <img src={avatar} alt={name} /> : null}
      <div>
        <div className="name">{name} wins</div>
        <div className="word">Word: {word}</div>
      </div>
    </div>
  );
}

import React from "react";

export function Scoreboard({
  scores,
  lastWinnerName
}: {
  scores: Record<string, number>;
  lastWinnerName?: string;
}) {
  const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="scoreboard">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th style={{ textAlign: "right" }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, score]) => (
            <tr
              key={name}
              className={name === lastWinnerName ? "row-winner" : ""}
            >
              <td>{name}</td>
              <td style={{ textAlign: "right" }}>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

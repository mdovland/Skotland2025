import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { players as initialPlayers } from '../data/initialData';
import './PlayerManagement.css';

const PlayerManagement: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    } else {
      localStorage.setItem('players', JSON.stringify(initialPlayers));
    }
  }, []);

  const updateHandicap = (playerId: string, newHandicap: number) => {
    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, handicap: newHandicap } : player
    );
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
  };

  return (
    <div className="player-management">
      <h2>Player Handicaps</h2>
      <div className="players-grid">
        {players.map(player => (
          <div key={player.id} className="player-card">
            <div className="player-name">{player.name}</div>
            <div className="handicap-input">
              <label>Handicap:</label>
              <input
                type="number"
                min="0"
                max="54"
                step="0.1"
                value={player.handicap}
                onChange={(e) => updateHandicap(player.id, parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManagement;
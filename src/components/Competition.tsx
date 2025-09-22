import React, { useState, useEffect } from 'react';
import { players } from '../data/initialData';
import { Player, RoundScore, HoleScore, SpecialShot } from '../types';
import { calculateStablefordPoints } from '../utils/stableford';
import './Competition.css';

const Competition: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2025-09-25');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [specialShots, setSpecialShots] = useState<SpecialShot[]>([]);
  const [currentRound, setCurrentRound] = useState<HoleScore[]>(
    Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      strokes: 0,
      par: 4,
      stablefordPoints: 0
    }))
  );

  useEffect(() => {
    const savedScores = localStorage.getItem('roundScores');
    const savedSpecialShots = localStorage.getItem('specialShots');
    if (savedScores) setRoundScores(JSON.parse(savedScores));
    if (savedSpecialShots) setSpecialShots(JSON.parse(savedSpecialShots));
  }, []);

  useEffect(() => {
    localStorage.setItem('roundScores', JSON.stringify(roundScores));
  }, [roundScores]);

  useEffect(() => {
    localStorage.setItem('specialShots', JSON.stringify(specialShots));
  }, [specialShots]);

  const handleScoreChange = (hole: number, strokes: number) => {
    const player = players.find(p => p.id === selectedPlayer);
    if (!player) return;

    const updatedScores = currentRound.map(score => {
      if (score.hole === hole) {
        const points = strokes > 0 ? calculateStablefordPoints(strokes, score.par, player.handicap, hole) : 0;
        return { ...score, strokes, stablefordPoints: points };
      }
      return score;
    });
    setCurrentRound(updatedScores);
  };

  const saveRound = () => {
    if (!selectedPlayer) return;

    const totalStrokes = currentRound.reduce((sum, hole) => sum + hole.strokes, 0);
    const totalPoints = currentRound.reduce((sum, hole) => sum + hole.stablefordPoints, 0);
    const frontNinePoints = currentRound.slice(0, 9).reduce((sum, hole) => sum + hole.stablefordPoints, 0);
    const backNinePoints = currentRound.slice(9).reduce((sum, hole) => sum + hole.stablefordPoints, 0);

    const newScore: RoundScore = {
      playerId: selectedPlayer,
      courseId: selectedDate,
      date: selectedDate,
      scores: currentRound,
      totalStrokes,
      totalStablefordPoints: totalPoints,
      frontNinePoints,
      backNinePoints
    };

    const existingIndex = roundScores.findIndex(
      s => s.playerId === selectedPlayer && s.date === selectedDate
    );

    if (existingIndex >= 0) {
      const updated = [...roundScores];
      updated[existingIndex] = newScore;
      setRoundScores(updated);
    } else {
      setRoundScores([...roundScores, newScore]);
    }

    alert('Round saved successfully!');
  };

  const addSpecialShot = (type: 'closestToPin' | 'longestDrive', hole: number, distance: number) => {
    if (!selectedPlayer) return;

    const newShot: SpecialShot = {
      playerId: selectedPlayer,
      courseId: selectedDate,
      date: selectedDate,
      type,
      hole,
      distance
    };

    setSpecialShots([...specialShots, newShot]);
  };

  const getLeaderboard = (type: 'front9' | 'back9' | 'fullRound') => {
    const dayScores = roundScores.filter(s => s.date === selectedDate);

    return players.map(player => {
      const score = dayScores.find(s => s.playerId === player.id);
      let points = 0;

      if (score) {
        switch(type) {
          case 'front9': points = score.frontNinePoints; break;
          case 'back9': points = score.backNinePoints; break;
          case 'fullRound': points = score.totalStablefordPoints; break;
        }
      }

      return { player, points };
    }).sort((a, b) => b.points - a.points);
  };

  const getOverallLeaderboard = () => {
    return players.map(player => {
      const totalPoints = roundScores
        .filter(s => s.playerId === player.id)
        .reduce((sum, round) => sum + round.totalStablefordPoints, 0);

      return { player, points: totalPoints };
    }).sort((a, b) => b.points - a.points);
  };

  return (
    <div className="competition">
      <h2>Competition Scoring</h2>

      <div className="controls">
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
          <option value="2025-09-25">Sept 25 - Kilspindie</option>
          <option value="2025-09-26">Sept 26 - Dunbar</option>
          <option value="2025-09-27">Sept 27 - Gullane</option>
        </select>

        <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
          <option value="">Select Player</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
      </div>

      {selectedPlayer && (
        <div className="score-entry">
          <h3>Enter Scores</h3>
          <div className="holes-grid">
            {currentRound.map(hole => (
              <div key={hole.hole} className="hole-entry">
                <label>Hole {hole.hole}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={hole.strokes || ''}
                  onChange={(e) => handleScoreChange(hole.hole, parseInt(e.target.value) || 0)}
                />
                <span className="points">{hole.stablefordPoints} pts</span>
              </div>
            ))}
          </div>
          <button onClick={saveRound} className="save-btn">Save Round</button>
        </div>
      )}

      <div className="leaderboards">
        <div className="leaderboard">
          <h3>Front 9 - {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {getLeaderboard('front9').map((entry, index) => (
                <tr key={entry.player.id}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard">
          <h3>Back 9 - {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {getLeaderboard('back9').map((entry, index) => (
                <tr key={entry.player.id}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard">
          <h3>Full Round - {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {getLeaderboard('fullRound').map((entry, index) => (
                <tr key={entry.player.id}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard overall">
          <h3>Overall 3-Day Competition</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Total Points</th>
                <th>Prize</th>
              </tr>
            </thead>
            <tbody>
              {getOverallLeaderboard().map((entry, index) => (
                <tr key={entry.player.id} className={index === 0 ? 'winner' : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                  <td>{index === 0 ? '400 SEK' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Competition;
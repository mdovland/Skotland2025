import React, { useState, useEffect } from 'react';
import { players } from '../data/initialData';
import { RoundScore, HoleScore, SpecialShot } from '../types';
import { FirebaseDataService } from '../firebase/dataService';
import './Competition.css';

const courseNames: { [key: string]: string } = {
  '2025-09-25': 'Kilspindie',
  '2025-09-26': 'Dunbar',
  '2025-09-27': 'Gullane'
};

const Competition: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2025-09-25');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  // Initialize all possible scores with zeros
  const initializeAllScores = (): RoundScore[] => {
    const allScores: RoundScore[] = [];
    const dates = ['2025-09-25', '2025-09-26', '2025-09-27'];

    players.forEach(player => {
      dates.forEach(date => {
        const blankScores = Array.from({ length: 18 }, (_, i) => ({
          hole: i + 1,
          strokes: 0,
          par: 4,
          stablefordPoints: 0
        }));

        allScores.push({
          playerId: player.id,
          courseId: date,
          date: date,
          scores: blankScores,
          totalStrokes: 0,
          totalStablefordPoints: 0,
          frontNinePoints: 0,
          backNinePoints: 0
        });
      });
    });

    return allScores;
  };

  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [specialShots, setSpecialShots] = useState<SpecialShot[]>([]);
  const [ctpPlayer, setCtpPlayer] = useState<string>('');
  const [ldPlayer, setLdPlayer] = useState<string>('');
  const [currentRound, setCurrentRound] = useState<HoleScore[]>(
    Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      strokes: 0,
      par: 4,
      stablefordPoints: 0
    }))
  );

  useEffect(() => {
    let unsubscribeRoundScores: (() => void) | undefined;
    let unsubscribeSpecialShots: (() => void) | undefined;

    const initializeFirebase = async () => {
      try {
        // Initialize with default data if needed
        const initialScores = initializeAllScores();
        await FirebaseDataService.initializeData(initialScores);

        // Subscribe to real-time updates
        unsubscribeRoundScores = FirebaseDataService.subscribeToRoundScores((scores) => {
          setRoundScores(scores);
        });

        unsubscribeSpecialShots = FirebaseDataService.subscribeToSpecialShots((shots) => {
          setSpecialShots(shots);
        });
      } catch (error) {
        console.error('Firebase initialization error:', error);
        // Fallback to localStorage if Firebase fails
        const savedScores = localStorage.getItem('roundScores');
        if (savedScores) {
          setRoundScores(JSON.parse(savedScores));
        } else {
          const initialScores = initializeAllScores();
          setRoundScores(initialScores);
        }
      }
    };

    initializeFirebase();

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeRoundScores) unsubscribeRoundScores();
      if (unsubscribeSpecialShots) unsubscribeSpecialShots();
    };
  }, []);

  // Keep localStorage as backup but primary storage is Firebase
  useEffect(() => {
    if (roundScores.length > 0) {
      localStorage.setItem('roundScores', JSON.stringify(roundScores));
    }
  }, [roundScores]);

  useEffect(() => {
    if (specialShots.length > 0) {
      localStorage.setItem('specialShots', JSON.stringify(specialShots));
    }
  }, [specialShots]);

  useEffect(() => {
    // Load saved special shots for current date
    const ctp = specialShots.find(s => s.date === selectedDate && s.type === 'closestToPin');
    const ld = specialShots.find(s => s.date === selectedDate && s.type === 'longestDrive');
    setCtpPlayer(ctp?.playerId || '');
    setLdPlayer(ld?.playerId || '');
  }, [selectedDate, specialShots]);

  // Load scores when player or date changes
  useEffect(() => {
    if (selectedPlayer && selectedDate && roundScores.length > 0) {
      const existingScore = roundScores.find(s => s.playerId === selectedPlayer && s.date === selectedDate);

      if (existingScore) {
        // Create a completely new array to force re-render
        const newCurrentRound = existingScore.scores.map(score => ({ ...score }));
        setCurrentRound(newCurrentRound);
      }
    } else if (!selectedPlayer) {
      // Clear form when no player selected
      setCurrentRound(Array.from({ length: 18 }, (_, i) => ({
        hole: i + 1,
        strokes: 0,
        par: 4,
        stablefordPoints: 0
      })));
    }
  }, [selectedPlayer, selectedDate, roundScores]);

  const handlePointsChange = (hole: number, points: number) => {
    const updatedScores = currentRound.map(score => {
      if (score.hole === hole) {
        return { ...score, stablefordPoints: points };
      }
      return score;
    });
    setCurrentRound(updatedScores);
  };

  const saveRound = async () => {
    if (!selectedPlayer) return;

    try {
      const totalPoints = currentRound.reduce((sum, hole) => sum + hole.stablefordPoints, 0);
      const frontNinePoints = currentRound.slice(0, 9).reduce((sum, hole) => sum + hole.stablefordPoints, 0);
      const backNinePoints = currentRound.slice(9).reduce((sum, hole) => sum + hole.stablefordPoints, 0);

      const newScore: RoundScore = {
        playerId: selectedPlayer,
        courseId: selectedDate,
        date: selectedDate,
        scores: currentRound,
        totalStrokes: 0,
        totalStablefordPoints: totalPoints,
        frontNinePoints,
        backNinePoints
      };

      const existingIndex = roundScores.findIndex(
        s => s.playerId === selectedPlayer && s.date === selectedDate
      );

      let updatedScores: RoundScore[];
      if (existingIndex >= 0) {
        updatedScores = [...roundScores];
        updatedScores[existingIndex] = newScore;
      } else {
        updatedScores = [...roundScores, newScore];
      }

      // Save to Firebase (this will trigger real-time updates for all users)
      await FirebaseDataService.saveRoundScores(updatedScores);

      alert('Round saved successfully! 🏌️‍♂️');
    } catch (error) {
      console.error('Error saving round:', error);
      alert('Error saving round. Please try again.');
    }
  };

  const saveSpecialShot = async (type: 'closestToPin' | 'longestDrive', playerId: string) => {
    if (!playerId) return;

    try {
      const updatedShots = specialShots.filter(s => !(s.date === selectedDate && s.type === type));

      const newShot: SpecialShot = {
        playerId,
        courseId: selectedDate,
        date: selectedDate,
        type
      };

      const finalShots = [...updatedShots, newShot];

      // Save to Firebase (this will trigger real-time updates for all users)
      await FirebaseDataService.saveSpecialShots(finalShots);

      if (type === 'closestToPin') {
        setCtpPlayer(playerId);
      } else {
        setLdPlayer(playerId);
      }
    } catch (error) {
      console.error('Error saving special shot:', error);
      alert('Error saving special shot. Please try again.');
    }
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

  const courseName = courseNames[selectedDate];

  return (
    <div className="competition">
      <h2>Competition Scoring</h2>
      <div style={{background: 'red', color: 'white', padding: '20px', fontSize: '20px', textAlign: 'center'}}>
        🚨 DEBUG VERSION - CODE IS LOADING! 🚨
      </div>

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
        <div className="score-entry" key={`${selectedPlayer}-${selectedDate}`}>
          <h3>Enter Stableford Points - {courseName}</h3>
          <div style={{padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '12px'}}>
            DEBUG: Player={selectedPlayer}, Date={selectedDate}, DataLoaded={roundScores.length},
            CurrentRoundPoints={currentRound.reduce((sum, h) => sum + h.stablefordPoints, 0)}
          </div>
          <div className="holes-grid">
            {currentRound.map(hole => (
              <div key={hole.hole} className="hole-entry">
                <label>Hole {hole.hole}</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={hole.stablefordPoints || ''}
                  onChange={(e) => handlePointsChange(hole.hole, parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="total-display">
            <span>Front 9: {currentRound.slice(0, 9).reduce((sum, h) => sum + h.stablefordPoints, 0)} pts</span>
            <span>Back 9: {currentRound.slice(9).reduce((sum, h) => sum + h.stablefordPoints, 0)} pts</span>
            <span>Total: {currentRound.reduce((sum, h) => sum + h.stablefordPoints, 0)} pts</span>
          </div>
          <button onClick={saveRound} className="save-btn">Save Round</button>
        </div>
      )}

      <div className="special-competitions">
        <div className="special-comp">
          <h3>Closest to Pin - {courseName}</h3>
          <select
            value={ctpPlayer}
            onChange={(e) => saveSpecialShot('closestToPin', e.target.value)}
          >
            <option value="">Select Winner</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          {ctpPlayer && (
            <div className="winner-display">
              Winner: {players.find(p => p.id === ctpPlayer)?.name} (400 SEK)
            </div>
          )}
        </div>

        <div className="special-comp">
          <h3>Longest Drive - {courseName}</h3>
          <select
            value={ldPlayer}
            onChange={(e) => saveSpecialShot('longestDrive', e.target.value)}
          >
            <option value="">Select Winner</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          {ldPlayer && (
            <div className="winner-display">
              Winner: {players.find(p => p.id === ldPlayer)?.name} (400 SEK)
            </div>
          )}
        </div>
      </div>

      <div className="leaderboards">
        <div className="leaderboard">
          <h3>Front 9 - {courseName}</h3>
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
                <tr key={entry.player.id} className={index === 0 && entry.points > 0 ? 'winner' : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard">
          <h3>Back 9 - {courseName}</h3>
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
                <tr key={entry.player.id} className={index === 0 && entry.points > 0 ? 'winner' : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard">
          <h3>Full Round - {courseName}</h3>
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
                <tr key={entry.player.id} className={index === 0 && entry.points > 0 ? 'winner' : ''}>
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
                <tr key={entry.player.id} className={index === 0 && entry.points > 0 ? 'winner' : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.player.name}</td>
                  <td>{entry.points}</td>
                  <td>{index === 0 && entry.points > 0 ? '400 SEK' : '-'}</td>
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
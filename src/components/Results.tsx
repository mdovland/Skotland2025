import React, { useState, useEffect, useCallback } from 'react';
import { players } from '../data/initialData';
import { RoundScore, SpecialShot } from '../types';
import { FirebaseDataService } from '../firebase/dataService';
import './Results.css';

const courseNames: { [key: string]: string } = {
  '2025-09-25': 'Kilspindie',
  '2025-09-26': 'Dunbar',
  '2025-09-27': 'Gullane'
};

interface CompetitionWinner {
  date: string;
  course: string;
  competition: string;
  winner: string;
  prize: number;
}

const Results: React.FC = () => {
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [specialShots, setSpecialShots] = useState<SpecialShot[]>([]);
  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [playerTotals, setPlayerTotals] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let unsubscribeRoundScores: (() => void) | undefined;
    let unsubscribeSpecialShots: (() => void) | undefined;

    const initializeFirebase = async () => {
      try {
        // Subscribe to real-time updates
        unsubscribeRoundScores = FirebaseDataService.subscribeToRoundScores((scores) => {
          setRoundScores(scores || []);
        });

        unsubscribeSpecialShots = FirebaseDataService.subscribeToSpecialShots((shots) => {
          setSpecialShots(shots || []);
        });
      } catch (error) {
        console.error('Firebase initialization error in Results:', error);
        // Fallback to localStorage if Firebase fails
        const savedScores = localStorage.getItem('roundScores');
        const savedSpecialShots = localStorage.getItem('specialShots');
        if (savedScores) setRoundScores(JSON.parse(savedScores));
        if (savedSpecialShots) setSpecialShots(JSON.parse(savedSpecialShots));
      }
    };

    initializeFirebase();

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeRoundScores) unsubscribeRoundScores();
      if (unsubscribeSpecialShots) unsubscribeSpecialShots();
    };
  }, []);

  const calculateWinners = useCallback(() => {
    const allWinners: CompetitionWinner[] = [];
    const totals: { [key: string]: number } = {};

    // Initialize totals
    players.forEach(player => {
      totals[player.id] = 0;
    });

    // Process each day
    ['2025-09-25', '2025-09-26', '2025-09-27'].forEach(date => {
      const dayScores = roundScores.filter(s => s.date === date);
      const course = courseNames[date];

      // Only calculate winners if ALL 8 players have submitted scores for this day
      if (dayScores.length === players.length) {
        // Front 9 winner
        const front9Scores = dayScores.map(s => ({
          playerId: s.playerId,
          points: s.frontNinePoints
        })).sort((a, b) => b.points - a.points);

        if (front9Scores[0]?.points > 0) {
          allWinners.push({
            date,
            course,
            competition: 'Front 9',
            winner: players.find(p => p.id === front9Scores[0].playerId)?.name || '',
            prize: 400
          });
          totals[front9Scores[0].playerId] += 400;
        }

        // Back 9 winner
        const back9Scores = dayScores.map(s => ({
          playerId: s.playerId,
          points: s.backNinePoints
        })).sort((a, b) => b.points - a.points);

        if (back9Scores[0]?.points > 0) {
          allWinners.push({
            date,
            course,
            competition: 'Back 9',
            winner: players.find(p => p.id === back9Scores[0].playerId)?.name || '',
            prize: 400
          });
          totals[back9Scores[0].playerId] += 400;
        }

        // Full Round winner
        const fullRoundScores = dayScores.map(s => ({
          playerId: s.playerId,
          points: s.totalStablefordPoints
        })).sort((a, b) => b.points - a.points);

        if (fullRoundScores[0]?.points > 0) {
          allWinners.push({
            date,
            course,
            competition: 'Full Round',
            winner: players.find(p => p.id === fullRoundScores[0].playerId)?.name || '',
            prize: 400
          });
          totals[fullRoundScores[0].playerId] += 400;
        }
      }

      // Closest to Pin (can be determined independently)
      const ctp = specialShots.find(s => s.date === date && s.type === 'closestToPin');
      if (ctp) {
        allWinners.push({
          date,
          course,
          competition: 'Closest to Pin',
          winner: players.find(p => p.id === ctp.playerId)?.name || '',
          prize: 400
        });
        totals[ctp.playerId] += 400;
      }

      // Longest Drive (can be determined independently)
      const ld = specialShots.find(s => s.date === date && s.type === 'longestDrive');
      if (ld) {
        allWinners.push({
          date,
          course,
          competition: 'Longest Drive',
          winner: players.find(p => p.id === ld.playerId)?.name || '',
          prize: 400
        });
        totals[ld.playerId] += 400;
      }
    });

    // Overall 3-Day Competition - only if ALL players have completed ALL 3 rounds
    const totalRoundsNeeded = players.length * 3; // 8 players × 3 days = 24 rounds
    if (roundScores.length === totalRoundsNeeded) {
      const overallScores = players.map(player => {
        const totalPoints = roundScores
          .filter(s => s.playerId === player.id)
          .reduce((sum, round) => sum + round.totalStablefordPoints, 0);
        return { playerId: player.id, points: totalPoints };
      }).sort((a, b) => b.points - a.points);

      if (overallScores[0]?.points > 0) {
        allWinners.push({
          date: 'Overall',
          course: '3-Day Total',
          competition: 'Overall Champion',
          winner: players.find(p => p.id === overallScores[0].playerId)?.name || '',
          prize: 400
        });
        totals[overallScores[0].playerId] += 400;
      }
    }

    setWinners(allWinners);
    setPlayerTotals(totals);
  }, [roundScores, specialShots]);

  useEffect(() => {
    calculateWinners();
  }, [calculateWinners]);

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Overall') return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getPlayerSummary = () => {
    return players
      .map(player => ({
        name: player.name,
        total: playerTotals[player.id] || 0
      }))
      .filter(p => p.total > 0)
      .sort((a, b) => b.total - a.total);
  };

  const getCompletionStatus = () => {
    const daysCompleted = ['2025-09-25', '2025-09-26', '2025-09-27'].filter(date => {
      const dayScores = roundScores.filter(s => s.date === date);
      return dayScores.length === players.length;
    }).length;

    const totalRoundsCompleted = roundScores.length;
    const totalRoundsNeeded = players.length * 3;

    return {
      daysCompleted,
      roundsCompleted: totalRoundsCompleted,
      roundsNeeded: totalRoundsNeeded,
      isComplete: totalRoundsCompleted === totalRoundsNeeded
    };
  };

  const status = getCompletionStatus();

  return (
    <div className="results">
      <h2>Competition Results</h2>

      <div className="completion-status">
        <div className="status-card">
          <h4>Competition Progress</h4>
          <div className="progress-info">
            <div>Days Completed: {status.daysCompleted} / 3</div>
            <div>Rounds Entered: {status.roundsCompleted} / {status.roundsNeeded}</div>
            {!status.isComplete && (
              <div className="warning-text">
                ⚠️ Winners will be determined when all players have submitted scores
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="results-container">
        <div className="winners-section">
          <h3>🏆 Competition Winners</h3>
          <table className="winners-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Competition</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner, index) => (
                <tr key={index} className={winner.date === 'Overall' ? 'overall-row' : ''}>
                  <td>{formatDate(winner.date)}</td>
                  <td>{winner.course}</td>
                  <td>{winner.competition}</td>
                  <td className="winner-name">{winner.winner}</td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-results">No competitions completed yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="money-section">
          <h3>💰 Prize Money Summary</h3>
          <div className="money-cards">
            {getPlayerSummary().map(player => (
              <div key={player.name} className="money-card">
                <div className="player-name">{player.name}</div>
                <div className="player-total">{player.total} SEK</div>
                <div className="wins-count">
                  {winners.filter(w => w.winner === player.name).length} wins
                </div>
              </div>
            ))}
            {getPlayerSummary().length === 0 && (
              <div className="no-results">No prize money awarded yet</div>
            )}
          </div>

          <div className="totals-section">
            <div className="total-pot">
              <h4>Total Prize Pool</h4>
              <div className="amount">
                {Object.values(playerTotals).reduce((sum, val) => sum + val, 0)} SEK
              </div>
            </div>
            <div className="competitions-completed">
              <h4>Competitions Completed</h4>
              <div className="amount">{winners.length} / 16</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
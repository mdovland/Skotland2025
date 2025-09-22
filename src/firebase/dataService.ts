import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from './config';
import { RoundScore, SpecialShot } from '../types';

export class FirebaseDataService {
  // Save round scores to Firebase
  static async saveRoundScores(roundScores: RoundScore[]): Promise<void> {
    try {
      await set(ref(database, 'roundScores'), roundScores);
      console.log('Round scores saved to Firebase');
    } catch (error) {
      console.error('Error saving round scores:', error);
      throw error;
    }
  }

  // Save special shots to Firebase
  static async saveSpecialShots(specialShots: SpecialShot[]): Promise<void> {
    try {
      await set(ref(database, 'specialShots'), specialShots);
      console.log('Special shots saved to Firebase');
    } catch (error) {
      console.error('Error saving special shots:', error);
      throw error;
    }
  }

  // Get round scores from Firebase
  static async getRoundScores(): Promise<RoundScore[]> {
    try {
      const snapshot = await get(ref(database, 'roundScores'));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting round scores:', error);
      return [];
    }
  }

  // Get special shots from Firebase
  static async getSpecialShots(): Promise<SpecialShot[]> {
    try {
      const snapshot = await get(ref(database, 'specialShots'));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting special shots:', error);
      return [];
    }
  }

  // Listen to round scores changes in real-time
  static subscribeToRoundScores(callback: (scores: RoundScore[]) => void): () => void {
    const roundScoresRef = ref(database, 'roundScores');

    const unsubscribe = onValue(roundScoresRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => off(roundScoresRef, 'value', unsubscribe);
  }

  // Listen to special shots changes in real-time
  static subscribeToSpecialShots(callback: (shots: SpecialShot[]) => void): () => void {
    const specialShotsRef = ref(database, 'specialShots');

    const unsubscribe = onValue(specialShotsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => off(specialShotsRef, 'value', unsubscribe);
  }

  // Initialize with default data if needed
  static async initializeData(initialRoundScores: RoundScore[]): Promise<void> {
    try {
      // Check if data already exists
      const existingScores = await this.getRoundScores();

      if (existingScores.length === 0) {
        // No data exists, initialize with default scores
        await this.saveRoundScores(initialRoundScores);
        console.log('Initialized Firebase with default data');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }
}
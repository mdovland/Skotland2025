import { ref, remove } from 'firebase/database';
import { database } from './config';

export class FirebaseAdmin {
  // Clear all data from Firebase database
  static async resetDatabase(): Promise<void> {
    try {
      console.log('Clearing all data from Firebase...');

      // Remove all round scores
      await remove(ref(database, 'roundScores'));
      console.log('Cleared round scores');

      // Remove all special shots
      await remove(ref(database, 'specialShots'));
      console.log('Cleared special shots');

      console.log('Database reset complete! 🎉');

    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }
}

// Add to window for easy console access
(window as any).resetDatabase = FirebaseAdmin.resetDatabase;
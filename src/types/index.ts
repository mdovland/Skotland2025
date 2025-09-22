export interface Player {
  id: string;
  name: string;
  handicap: number;
}

export interface Flight {
  direction: 'outbound' | 'return';
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export interface Course {
  date: string;
  name: string;
  pickupTime: string;
  teeOffTime: string;
  returnTime: string;
  startTime: string;
  endTime: string;
}

export interface Hotel {
  name: string;
  address: string;
  phone: string;
}

export interface TripInfo {
  flights: Flight[];
  hotel: Hotel;
  courses: Course[];
  driverPhone: string;
}

export interface HoleScore {
  hole: number;
  strokes: number;
  par: number;
  stablefordPoints: number;
}

export interface RoundScore {
  playerId: string;
  courseId: string;
  date: string;
  scores: HoleScore[];
  totalStrokes: number;
  totalStablefordPoints: number;
  frontNinePoints: number;
  backNinePoints: number;
}

export interface SpecialShot {
  playerId: string;
  courseId: string;
  date: string;
  type: 'closestToPin' | 'longestDrive';
  distance?: number;
  hole?: number;
}

export interface Competition {
  id: string;
  name: string;
  date?: string;
  type: 'front9' | 'back9' | 'fullRound' | 'closestToPin' | 'longestDrive' | 'overall';
  entryFee: number;
  prizeMoney: number;
  winnerId?: string;
}

export interface LeaderboardEntry {
  playerId: string;
  score: number;
  rank: number;
}
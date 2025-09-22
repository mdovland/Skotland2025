import { Player, TripInfo, Competition } from '../types';

export const players: Player[] = [
  { id: '1', name: 'Peter Dahl', handicap: 0 },
  { id: '2', name: 'Johan Dahl', handicap: 0 },
  { id: '3', name: 'Johan Dahlgren', handicap: 0 },
  { id: '4', name: 'Michael Dovland', handicap: 0 },
  { id: '5', name: 'Fredrik Andersson', handicap: 0 },
  { id: '6', name: 'Fredrik Käck', handicap: 0 },
  { id: '7', name: 'Toni Bukaki', handicap: 0 },
  { id: '8', name: 'Magnus Agren', handicap: 0 },
];

export const tripInfo: TripInfo = {
  flights: [
    {
      direction: 'outbound',
      from: 'Stockholm',
      fromCode: 'ARN',
      to: 'Edinburgh',
      toCode: 'EDI',
      date: '2025-09-24',
      departureTime: '11:10',
      arrivalTime: '12:30',
      duration: '2h 20min'
    },
    {
      direction: 'return',
      from: 'Edinburgh',
      fromCode: 'EDI',
      to: 'Stockholm',
      toCode: 'ARN',
      date: '2025-09-28',
      departureTime: '11:45',
      arrivalTime: '14:55',
      duration: '2h 10min'
    }
  ],
  hotel: {
    name: 'Golf Lodge B&B',
    address: '53 Dirleton Avenue, North Berwick, East Lothian, EH39 4BL',
    phone: '+44 1620 892 457'
  },
  courses: [
    {
      date: '2025-09-25',
      name: 'Kilspindie Golf Club',
      startTime: '10:30',
      endTime: '16:30'
    },
    {
      date: '2025-09-26',
      name: 'Dunbar Golf Club',
      startTime: '11:30',
      endTime: '17:30'
    },
    {
      date: '2025-09-27',
      name: 'Gullane Golf Club No2',
      startTime: '12:24',
      endTime: '18:30'
    }
  ]
};

export const competitions: Competition[] = [
  // Daily competitions for Sept 25
  { id: 'front9-25', name: 'Front 9 - Sept 25', date: '2025-09-25', type: 'front9', entryFee: 50, prizeMoney: 400 },
  { id: 'back9-25', name: 'Back 9 - Sept 25', date: '2025-09-25', type: 'back9', entryFee: 50, prizeMoney: 400 },
  { id: 'full-25', name: 'Full Round - Sept 25', date: '2025-09-25', type: 'fullRound', entryFee: 50, prizeMoney: 400 },
  { id: 'ctp-25', name: 'Closest to Pin - Sept 25', date: '2025-09-25', type: 'closestToPin', entryFee: 50, prizeMoney: 400 },
  { id: 'ld-25', name: 'Longest Drive - Sept 25', date: '2025-09-25', type: 'longestDrive', entryFee: 50, prizeMoney: 400 },

  // Daily competitions for Sept 26
  { id: 'front9-26', name: 'Front 9 - Sept 26', date: '2025-09-26', type: 'front9', entryFee: 50, prizeMoney: 400 },
  { id: 'back9-26', name: 'Back 9 - Sept 26', date: '2025-09-26', type: 'back9', entryFee: 50, prizeMoney: 400 },
  { id: 'full-26', name: 'Full Round - Sept 26', date: '2025-09-26', type: 'fullRound', entryFee: 50, prizeMoney: 400 },
  { id: 'ctp-26', name: 'Closest to Pin - Sept 26', date: '2025-09-26', type: 'closestToPin', entryFee: 50, prizeMoney: 400 },
  { id: 'ld-26', name: 'Longest Drive - Sept 26', date: '2025-09-26', type: 'longestDrive', entryFee: 50, prizeMoney: 400 },

  // Daily competitions for Sept 27
  { id: 'front9-27', name: 'Front 9 - Sept 27', date: '2025-09-27', type: 'front9', entryFee: 50, prizeMoney: 400 },
  { id: 'back9-27', name: 'Back 9 - Sept 27', date: '2025-09-27', type: 'back9', entryFee: 50, prizeMoney: 400 },
  { id: 'full-27', name: 'Full Round - Sept 27', date: '2025-09-27', type: 'fullRound', entryFee: 50, prizeMoney: 400 },
  { id: 'ctp-27', name: 'Closest to Pin - Sept 27', date: '2025-09-27', type: 'closestToPin', entryFee: 50, prizeMoney: 400 },
  { id: 'ld-27', name: 'Longest Drive - Sept 27', date: '2025-09-27', type: 'longestDrive', entryFee: 50, prizeMoney: 400 },

  // Overall competition
  { id: 'overall', name: 'Overall 3-Day Competition', type: 'overall', entryFee: 50, prizeMoney: 400 }
];
export function calculateStablefordPoints(
  strokes: number,
  par: number,
  handicap: number,
  strokeIndex: number
): number {
  const strokesReceived = Math.floor(handicap / 18) + (strokeIndex <= (handicap % 18) ? 1 : 0);
  const netScore = strokes - strokesReceived;
  const scoreRelativeToPar = netScore - par;

  if (scoreRelativeToPar <= -2) return Math.max(5, 2 - scoreRelativeToPar);
  if (scoreRelativeToPar === -1) return 3;
  if (scoreRelativeToPar === 0) return 2;
  if (scoreRelativeToPar === 1) return 1;
  return 0;
}

export function calculateHandicapStrokes(handicap: number, strokeIndex: number): number {
  const baseStrokes = Math.floor(handicap / 18);
  const remainingStrokes = handicap % 18;
  return baseStrokes + (strokeIndex <= remainingStrokes ? 1 : 0);
}
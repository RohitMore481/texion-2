/**
 * In a real application, safety score would be determined via crime API / neighborhood context.
 * We generate a deterministic mock score based on the property's coordinates.
 */

export const getSafetyScore = (lat, lng) => {
  // Deterministic fake score between 65 and 99
  const seed = (Math.abs(lat) + Math.abs(lng)) * 10000;
  const score = 65 + (seed % 34);
  
  let label = 'Good';
  let color = 'var(--success)';
  
  if (score > 85) {
    label = 'Excellent';
  } else if (score < 75) {
    label = 'Average';
    color = 'var(--warning)';
  }

  return {
    score: Math.round(score),
    label,
    color,
    description: `Based on area reviews and local proximity context.`
  };
};

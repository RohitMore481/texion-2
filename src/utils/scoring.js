// scoring.js - Mock algorithms for calculating property metrics

const CITY_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi Center (Connaught Place)

// Calculate distance in km using Haversine formula
function getDistanceFromCenter(lat, lng) {
  const R = 6371; // km
  const dLat = (lat - CITY_CENTER.lat) * Math.PI / 180;
  const dLng = (lng - CITY_CENTER.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(CITY_CENTER.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculatePriceAccuracy(askingPrice, propertyLat, propertyLng) {
  // Baseline rent calculation: Base 60,000 at center, drops 2000 per km away, min 10000
  const distanceFromCenter = getDistanceFromCenter(propertyLat, propertyLng);
  let expectedPrice = 60000 - (distanceFromCenter * 2000);
  if (expectedPrice < 10000) expectedPrice = 10000;

  // Calculate deviation percentage
  const difference = Math.abs(askingPrice - expectedPrice);
  const deviationPercent = difference / expectedPrice;

  // Scale of 10 (0% deviation = 10/10, >100% deviation = 1/10)
  let score = 10 - (deviationPercent * 10);
  if (score < 1) score = 1;
  if (score > 10) score = 10;

  return {
    score: score.toFixed(1), // e.g. "8.5"
    expectedPrice: Math.round(expectedPrice),
    isOverpriced: askingPrice > (expectedPrice * 1.1)
  };
}

export function calculateSafetyRating(propertyLat, propertyLng) {
  // Deterministic pseudo-random safety based on coordinates
  // Mix lat/lng and map it to a 3.0 to 5.0 scale
  const seed = (propertyLat * 1000) + (propertyLng * 1000);
  const randomFactor = Math.abs(Math.sin(seed));
  
  // Base 3.0 + up to 2.0 based on pseudo-random
  const rating = 3.0 + (randomFactor * 2.0);
  
  return rating.toFixed(1); // e.g., "4.2"
}

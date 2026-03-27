/**
 * Simulates a distance matrix API request to Google Maps or Mapbox.
 * In a real app, this would use google.maps.DistanceMatrixService.
 * Here we use Haversine distance to estimate a realistic commute time.
 */

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistanceKM(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
}

export const getCommuteInfo = (origin, destination) => {
  if (!origin || !destination) return { time: 0, distance: 0 };
  
  const distKm = calculateDistanceKM(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Estimate: average speed in city traffic is about ~20km/h
  // Also add baseline 5 minutes overhead
  const timeHours = distKm / 20; 
  const timeMinutes = Math.round((timeHours * 60) + 5);
  
  return {
    distance: distKm.toFixed(1), // in km
    time: timeMinutes // in minutes
  };
};

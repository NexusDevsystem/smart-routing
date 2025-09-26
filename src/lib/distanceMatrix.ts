import type { Stop } from '@/lib/types';

const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

export async function calculateDistanceMatrix(
  stops: Stop[],
  origin: Stop | null = null
): Promise<{
  distances: number[][]; // meters
  durations: number[][]; // seconds
}> {
  const allStops = origin ? [origin, ...stops] : stops;
  const n = allStops.length;
  
  const distances: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  const durations: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  
  const service = new google.maps.DistanceMatrixService();
  
  // Process in batches of 10 origins x 10 destinations
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < n; i += BATCH_SIZE) {
    const origins = allStops.slice(i, Math.min(i + BATCH_SIZE, n));
    
    for (let j = 0; j < n; j += BATCH_SIZE) {
      const destinations = allStops.slice(j, Math.min(j + BATCH_SIZE, n));
      
      // Rate limit
      await rateLimit();
      
      try {
        const result = await service.getDistanceMatrix({
          origins: origins.map((s) => ({ lat: s.lat, lng: s.lng })),
          destinations: destinations.map((s) => ({ lat: s.lat, lng: s.lng })),
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        });
        
        result.rows.forEach((row, originIdx) => {
          row.elements.forEach((element, destIdx) => {
            const globalOriginIdx = i + originIdx;
            const globalDestIdx = j + destIdx;
            
            if (element.status === 'OK') {
              distances[globalOriginIdx][globalDestIdx] = element.distance.value;
              durations[globalOriginIdx][globalDestIdx] = element.duration.value;
            } else {
              // For same point or error, use 0
              distances[globalOriginIdx][globalDestIdx] =
                globalOriginIdx === globalDestIdx ? 0 : Infinity;
              durations[globalOriginIdx][globalDestIdx] =
                globalOriginIdx === globalDestIdx ? 0 : Infinity;
            }
          });
        });
      } catch (error) {
        console.error('Error calculating distance matrix:', error);
        throw new Error('Failed to calculate distances. Please try again.');
      }
    }
  }
  
  return { distances, durations };
}
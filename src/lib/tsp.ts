import type { Stop } from '@/lib/types';
import { formatTime } from '@/lib/format';

const EARTH_RADIUS_KM = 6371;

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

interface TimeWindowViolation {
  stopId: string;
  arrivalTime: string;
  windowStart: string;
  windowEnd: string;
  minutesLate: number;
}

function calculateTimeWindowViolations(
  stops: Stop[],
  durations: number[][], // seconds
  startTime: Date = new Date()
): TimeWindowViolation[] {
  const violations: TimeWindowViolation[] = [];
  let currentTime = startTime.getTime();
  
  for (let i = 1; i < stops.length; i++) {
    const stop = stops[i];
    
    // Add travel time
    currentTime += durations[i - 1][i] * 1000; // convert seconds to milliseconds
    
    if (stop.windowStart || stop.windowEnd) {
      const arrivalTime = new Date(currentTime);
      const arrivalHours = arrivalTime.getHours();
      const arrivalMinutes = arrivalTime.getMinutes();
      const arrivalTimeStr = formatTime(`${arrivalHours}:${arrivalMinutes}`);
      
      if (stop.windowStart) {
        const [windowStartHours, windowStartMinutes] = stop.windowStart.split(':').map(Number);
        const windowStartDate = new Date(currentTime);
        windowStartDate.setHours(windowStartHours, windowStartMinutes, 0, 0);
        
        if (currentTime < windowStartDate.getTime()) {
          // If arrived early, wait until window start
          currentTime = windowStartDate.getTime();
        }
      }
      
      if (stop.windowEnd) {
        const [windowEndHours, windowEndMinutes] = stop.windowEnd.split(':').map(Number);
        const windowEndDate = new Date(currentTime);
        windowEndDate.setHours(windowEndHours, windowEndMinutes, 0, 0);
        
        if (currentTime > windowEndDate.getTime()) {
          violations.push({
            stopId: stop.id,
            arrivalTime: arrivalTimeStr,
            windowStart: stop.windowStart || '',
            windowEnd: stop.windowEnd,
            minutesLate: Math.round((currentTime - windowEndDate.getTime()) / (1000 * 60))
          });
        }
      }
    }
  }
  
  return violations;
}

function nearestNeighbor(distances: number[][], start: number = 0): number[] {
  const n = distances.length;
  const visited = new Array(n).fill(false);
  const route = [start];
  visited[start] = true;
  
  while (route.length < n) {
    const last = route[route.length - 1];
    let nextCity = -1;
    let minDist = Infinity;
    
    for (let i = 0; i < n; i++) {
      if (!visited[i] && distances[last][i] < minDist) {
        minDist = distances[last][i];
        nextCity = i;
      }
    }
    
    visited[nextCity] = true;
    route.push(nextCity);
  }
  
  return route;
}

function twoOpt(route: number[], distances: number[][], maxIterations: number = 100): number[] {
  let best = [...route];
  let improved = true;
  let iterations = 0;
  
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        const oldDist = distances[route[i - 1]][route[i]] + distances[route[j]][route[j + 1]];
        const newDist = distances[route[i - 1]][route[j]] + distances[route[i]][route[j + 1]];
        
        if (newDist < oldDist) {
          // Reverse the segment between i and j
          const newRoute = [...best];
          const segment = newRoute.slice(i, j + 1).reverse();
          newRoute.splice(i, segment.length, ...segment);
          
          best = newRoute;
          improved = true;
        }
      }
    }
  }
  
  return best;
}

export interface OptimizationResult {
  route: number[];
  totalDistanceMeters: number;
  totalDurationSec: number;
  violations: TimeWindowViolation[];
}

export function optimizeRoute(
  stops: Stop[],
  distances: number[][],
  durations: number[][],
  returnToStart: boolean = true,
  maxIterations: number = 100
): OptimizationResult {
  // Create initial route using Nearest Neighbor
  let route = nearestNeighbor(distances);
  
  // Improve route using 2-opt
  route = twoOpt(route, distances, maxIterations);
  
  // If returnToStart, add origin as last stop
  if (returnToStart) {
    route.push(0);
  }
  
  // Calculate total distance and duration
  let totalDistanceMeters = 0;
  let totalDurationSec = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    totalDistanceMeters += distances[route[i]][route[i + 1]];
    totalDurationSec += durations[route[i]][route[i + 1]];
  }
  
  // Check time window violations
  const violations = calculateTimeWindowViolations(
    route.map(i => stops[i]),
    durations
  );
  
  return {
    route,
    totalDistanceMeters,
    totalDurationSec,
    violations
  };
}
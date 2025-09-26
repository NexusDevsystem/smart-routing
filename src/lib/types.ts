interface Stop {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  windowStart?: string; // HH:mm
  windowEnd?: string; // HH:mm
}

interface Plan {
  id: string;
  name: string;
  createdAt: string;
  city: string;
  origin: Stop;
  returnToStart: boolean;
  stops: Stop[];
  totalDistanceMeters: number;
  totalDurationSec: number;
  version: number;
}

interface HistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  city: string;
  stopsCount: number;
  totalDistanceMeters: number;
  totalDurationSec: number;
  version: number;
}

export type { Stop, Plan, HistoryEntry };
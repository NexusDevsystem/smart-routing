import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Stop, Plan } from '@/lib/types';

import { DeliveryPricing, DeliveryCalculation } from '@/lib/deliveryPricing';

interface RouteState {
  stops: Stop[];
  origin: Stop | null;
  returnToStart: boolean;
  totalDistanceMeters: number;
  totalDurationSec: number;
  loading: boolean;
  optimizing: boolean;
  deliveryPrice: DeliveryCalculation | null;
  pricing: DeliveryPricing;
  addStop: (stop: Stop) => void;
  updateStop: (stopId: string, stop: Partial<Stop>) => void;
  removeStop: (stopId: string) => void;
  setStops: (stops: Stop[]) => void;
  setOrigin: (origin: Stop | null) => void;
  setReturnToStart: (returnToStart: boolean) => void;
  clearStops: () => void;
  reorderStops: (oldIndex: number, newIndex: number) => void;
  setOptimizing: (optimizing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setRouteMetrics: (metrics: { distance: number; duration: number }) => void;
  loadPlan: (plan: Plan) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      stops: [],
      origin: null,
      returnToStart: true,
      totalDistanceMeters: 0,
      totalDurationSec: 0,
      loading: false,
      optimizing: false,
      deliveryPrice: null,
      pricing: {
        baseFee: 5.00,
        pricePerKm: 2.00,
        minDistance: 1.5,
        rushHourFee: 20,
      },
      
      addStop: (stop) =>
        set((state) => ({
          stops: [...state.stops, stop],
        })),
        
      updateStop: (stopId, updatedStop) =>
        set((state) => ({
          stops: state.stops.map((stop) =>
            stop.id === stopId ? { ...stop, ...updatedStop } : stop
          ),
        })),
        
      removeStop: (stopId) =>
        set((state) => ({
          stops: state.stops.filter((stop) => stop.id !== stopId),
        })),
        
      setStops: (stops) => set({ stops }),
      
      setOrigin: (origin) => set({ origin }),
      
      setReturnToStart: (returnToStart) => set({ returnToStart }),
      
      clearStops: () =>
        set({
          stops: [],
          totalDistanceMeters: 0,
          totalDurationSec: 0,
        }),
        
      reorderStops: (oldIndex, newIndex) => {
        const stops = [...get().stops];
        const [removed] = stops.splice(oldIndex, 1);
        stops.splice(newIndex, 0, removed);
        set({ stops });
      },
      
      setOptimizing: (optimizing) => set({ optimizing }),
      
      setLoading: (loading) => set({ loading }),
      
      setRouteMetrics: ({ distance, duration }) =>
        set({
          totalDistanceMeters: distance,
          totalDurationSec: duration,
        }),
        
      loadPlan: (plan) =>
        set({
          origin: plan.origin,
          stops: plan.stops,
          returnToStart: plan.returnToStart,
          totalDistanceMeters: plan.totalDistanceMeters,
          totalDurationSec: plan.totalDurationSec,
        }),
    }),
    {
      name: 'route-store',
    }
  )
);
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useRouteStore } from '@/store/useRouteStore';
import { toast } from 'sonner';
import { GOOGLE_MAPS_OPTIONS, LIBRARIES } from '@/lib/geocode';

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 }; // São Paulo
const DEFAULT_ZOOM = 12;

export default function GoogleMapsComponent() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const { stops, origin, loading } = useRouteStore();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  useEffect(() => {
    // Initialize DirectionsRenderer
    if (isLoaded && !directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
      });
    }
  }, [isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
        },
        () => {
          // Fallback to default center if geolocation fails
          map.setCenter(DEFAULT_CENTER);
        }
      );
    }
  }, []);

  // Update directions when stops change
  useEffect(() => {
    if (!isLoaded || !mapRef.current || stops.length < 2) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const waypoints = stops.slice(1, -1).map((stop) => ({
      location: new google.maps.LatLng(stop.lat, stop.lng),
      stopover: true,
    }));

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(stops[0].lat, stops[0].lng),
      destination: new google.maps.LatLng(stops[stops.length - 1].lat, stops[stops.length - 1].lng),
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false, // We handle optimization ourselves
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(mapRef.current);
          directionsRendererRef.current.setDirections(result);
        }
      } else {
        toast.error('Erro ao traçar a rota');
        console.error('Directions error:', status);
      }
    });
  }, [isLoaded, stops]);

  if (loadError) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] rounded-2xl bg-muted flex items-center justify-center">
        Erro ao carregar o Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] rounded-2xl bg-muted flex items-center justify-center">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerClassName="w-full h-full rounded-2xl"
        zoom={DEFAULT_ZOOM}
        center={DEFAULT_CENTER}
        options={GOOGLE_MAPS_OPTIONS}
        onLoad={onMapLoad}
      >
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={{ lat: stop.lat, lng: stop.lng }}
            label={{
              text: `${index + 1}`,
              className: 'marker-label',
            }}
            title={stop.label}
          />
        ))}
        {origin && (
          <Marker
            position={{ lat: origin.lat, lng: origin.lng }}
            label={{
              text: 'O',
              className: 'marker-label',
            }}
            title="Origem"
          />
        )}
      </GoogleMap>
    </div>
  );
}
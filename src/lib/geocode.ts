import { LoadScriptProps } from '@react-google-maps/api';

const LIBRARIES: LoadScriptProps['libraries'] = ['places', 'geometry'];
const GOOGLE_MAPS_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  scrollwheel: true,
  gestureHandling: 'greedy' as const,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const GEOCODING_OPTIONS = {
  componentRestrictions: { country: 'BR' },
  region: 'br',
};

let _googleMapsService: google.maps.DistanceMatrixService | null = null;
let _geocoder: google.maps.Geocoder | null = null;

function getDistanceMatrixService(): google.maps.DistanceMatrixService {
  if (!_googleMapsService) {
    _googleMapsService = new google.maps.DistanceMatrixService();
  }
  return _googleMapsService;
}

function getGeocoder(): google.maps.Geocoder {
  if (!_geocoder) {
    _geocoder = new google.maps.Geocoder();
  }
  return _geocoder;
}

export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  address: string;
  city: string;
}> {
  const geocoder = getGeocoder();
  
  try {
    const response = await geocoder.geocode({
      address,
      ...GEOCODING_OPTIONS,
    });
    
    if (!response.results[0]) {
      throw new Error('Endereço não encontrado');
    }
    
    const result = response.results[0];
    const location = result.geometry.location;
    
    const cityComponent = result.address_components.find(
      (c) =>
        c.types.includes('administrative_area_level_2') ||
        c.types.includes('locality')
    );
    
    return {
      lat: location.lat(),
      lng: location.lng(),
      address: result.formatted_address,
      city: cityComponent?.long_name || 'Cidade desconhecida',
    };
  } catch (error) {
    throw new Error(`Erro ao geocodificar endereço: ${error}`);
  }
}

export async function getDistanceMatrix(
  origins: google.maps.LatLngLiteral[],
  destinations: google.maps.LatLngLiteral[]
): Promise<{
  distances: number[][]; // meters
  durations: number[][]; // seconds
}> {
  const service = getDistanceMatrixService();
  
  try {
    const response = await service.getDistanceMatrix({
      origins,
      destinations,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    });
    
    const distances: number[][] = [];
    const durations: number[][] = [];
    
    response.rows.forEach((row, i) => {
      distances[i] = [];
      durations[i] = [];
      
      row.elements.forEach((element, j) => {
        if (element.status === 'OK') {
          distances[i][j] = element.distance.value;
          durations[i][j] = element.duration.value;
        } else {
          // For same point or error, use 0
          distances[i][j] = i === j ? 0 : Infinity;
          durations[i][j] = i === j ? 0 : Infinity;
        }
      });
    });
    
    return { distances, durations };
  } catch (error) {
    throw new Error(`Erro ao obter matriz de distâncias: ${error}`);
  }
}

export { LIBRARIES, GOOGLE_MAPS_OPTIONS, GEOCODING_OPTIONS };
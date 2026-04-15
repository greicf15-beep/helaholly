import React, { useState, useEffect } from 'react';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { StoreLocation } from '../types';

// Custom Polyline component because @vis.gl/react-google-maps doesn't export one directly
function Polyline(props: google.maps.PolylineOptions) {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!polyline) {
      setPolyline(new google.maps.Polyline(props));
    }

    return () => {
      if (polyline) polyline.setMap(null);
    };
  }, [polyline]);

  useEffect(() => {
    if (polyline) {
      polyline.setOptions(props);
      polyline.setMap(map);
    }
  }, [polyline, map, props]);

  return null;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== '';

interface StoreMapProps {
  userLocation: { lat: number; lng: number } | null;
  selectedStore: StoreLocation | null;
  onStoreSelect?: (store: StoreLocation) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  isAddressConfirmed?: boolean;
}

function MapContent({ userLocation, selectedStore, onLocationChange, isAddressConfirmed }: StoreMapProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[] | null>(null);

  useEffect(() => {
    if (!map || !routesLib) return;
    
    console.log('Initializing Directions Service and Renderer');
    const ds = new routesLib.DirectionsService();
    const dr = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: '#C2A378', // Beige/Tan
        strokeWeight: 8,
        strokeOpacity: 1.0,
      },
    });
    
    setDirectionsService(ds);
    setDirectionsRenderer(dr);

    return () => {
      dr.setMap(null);
    };
  }, [map, routesLib]);

  // Auto-center on user location when it's first captured
  useEffect(() => {
    if (!map || !userLocation) return;
    
    map.setCenter(userLocation);
    if (!selectedStore) {
      map.setZoom(15);
    }
  }, [userLocation, map]);

  // Draw route and fit bounds when both locations are available
  useEffect(() => {
    if (!userLocation || !selectedStore || !map) return;

    if (!isAddressConfirmed) {
      if (directionsRenderer) directionsRenderer.setMap(null);
      setRoutePath(null);
      map.setCenter(userLocation);
      map.setZoom(17);
      return;
    }

    // If directions service is not available yet or fails, we'll use a straight line as fallback
    if (!directionsService || !directionsRenderer) {
      setRoutePath([userLocation, { lat: selectedStore.lat, lng: selectedStore.lng }]);
      return;
    }

    console.log('Requesting route...', {
      from: userLocation,
      to: { lat: selectedStore.lat, lng: selectedStore.lng }
    });

    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: selectedStore.lat, lng: selectedStore.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log('Route result status:', status);
        if (status === 'OK' && result) {
          console.log('Route found! Setting directions.');
          setRoutePath(null); // Clear fallback path
          directionsRenderer.setMap(map);
          directionsRenderer.setDirections(result);
          
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(userLocation);
          bounds.extend({ lat: selectedStore.lat, lng: selectedStore.lng });
          map.fitBounds(bounds, {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
          });
        } else {
          console.warn('Route request failed (likely API not enabled). Using straight line fallback.', status);
          setRoutePath([userLocation, { lat: selectedStore.lat, lng: selectedStore.lng }]);
          
          // Still fit bounds for the fallback line
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(userLocation);
          bounds.extend({ lat: selectedStore.lat, lng: selectedStore.lng });
          map.fitBounds(bounds, {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
          });
        }
      }
    );
  }, [directionsService, directionsRenderer, userLocation, selectedStore, map, isAddressConfirmed]);

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onLocationChange) {
      onLocationChange({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  };

  return (
    <>
      {/* User Marker */}
      {userLocation && (
        <Marker 
          position={userLocation} 
          title="Tu Ubicación (Puedes moverme)"
          draggable={true}
          onDragEnd={handleDragEnd}
        />
      )}

      {/* Selected Store Marker */}
      {selectedStore && (
        <Marker
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          title={selectedStore.name}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
          }}
        />
      )}

      {/* Fallback Polyline if Directions API fails */}
      {routePath && (
        <Polyline
          path={routePath}
          strokeColor="#C2A378"
          strokeWeight={8}
          strokeOpacity={1.0}
        />
      )}
    </>
  );
}

export function StoreMap({ userLocation, selectedStore, onStoreSelect, onLocationChange, isAddressConfirmed }: StoreMapProps) {
  if (!hasValidKey) {
    return (
      <div className="w-full h-64 bg-holly-cream rounded-[30px] flex items-center justify-center p-8 text-center border-2 border-dashed border-holly-orange/20">
        <div className="max-w-md">
          <h3 className="text-xl font-display font-bold text-holly-brown mb-4 uppercase">Google Maps API Key Required</h3>
          <p className="text-[11px] text-holly-brown/60 font-sans font-medium leading-relaxed uppercase tracking-widest">
            Para ver el mapa y las sedes cercanas, por favor configura tu API Key de Google Maps en los Secrets de AI Studio con el nombre <code className="bg-holly-orange/10 px-1 rounded text-holly-orange">GOOGLE_MAPS_PLATFORM_KEY</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[30px] overflow-hidden shadow-xl border-4 border-white relative">
      <Map
        defaultCenter={{ lat: 10.6667, lng: -71.6167 }}
        defaultZoom={11}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
      >
        <MapContent 
          userLocation={userLocation} 
          selectedStore={selectedStore}
          onLocationChange={onLocationChange}
          isAddressConfirmed={isAddressConfirmed}
        />
      </Map>
    </div>
  );
}

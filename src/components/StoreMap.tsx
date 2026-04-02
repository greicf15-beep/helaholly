import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { HOLLYWOOD_STORES } from '../constants';
import { StoreLocation } from '../types';
import { motion } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== '';

interface StoreMapProps {
  userLocation: { lat: number; lng: number } | null;
  selectedStore: StoreLocation | null;
  onStoreSelect?: (store: StoreLocation) => void;
}

function MapContent({ userLocation, selectedStore }: StoreMapProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    const ds = new routesLib.DirectionsService();
    const dr = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#e1a139',
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });
    
    setDirectionsService(ds);
    setDirectionsRenderer(dr);

    return () => {
      dr.setMap(null);
    };
  }, [routesLib, map]);

  // Auto-center on user location when it's first captured
  useEffect(() => {
    if (!map || !userLocation) return;
    
    // Jump to user location immediately for feedback
    map.setCenter(userLocation);
    
    // If no store is selected, zoom in closer to the user
    if (!selectedStore) {
      map.setZoom(15);
    }
  }, [userLocation, map]);

  // Draw route and fit bounds when both locations are available
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !userLocation || !selectedStore || !map) {
      if (directionsRenderer) directionsRenderer.setMap(null);
      return;
    }

    directionsRenderer.setMap(map);
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: selectedStore.lat, lng: selectedStore.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          
          // Fit bounds to show both markers
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
  }, [directionsService, directionsRenderer, userLocation, selectedStore, map]);

  return (
    <>
      {/* User Marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation} title="Tu Ubicación">
          <div className="relative">
            <div className="absolute -inset-4 bg-holly-orange/20 rounded-full animate-ping" />
            <Pin background="#e1a139" glyphColor="#fff" scale={1.2} />
          </div>
        </AdvancedMarker>
      )}

      {/* Selected Store Marker */}
      {selectedStore && (
        <AdvancedMarker
          key={selectedStore.id}
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          title={selectedStore.name}
        >
          <Pin 
            background="#8B4513" 
            glyphColor="#fff"
            scale={1.3}
          />
        </AdvancedMarker>
      )}
    </>
  );
}

export function StoreMap({ userLocation, selectedStore, onStoreSelect }: StoreMapProps) {
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
    <div className="w-full h-80 rounded-[30px] overflow-hidden shadow-xl border-4 border-white relative">
      <Map
        defaultCenter={{ lat: 10.6667, lng: -71.6167 }}
        defaultZoom={11}
        mapId="HOLLYWOOD_MAP_ID"
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
      >
        <MapContent 
          userLocation={userLocation} 
          selectedStore={selectedStore}
        />
      </Map>
    </div>
  );
}

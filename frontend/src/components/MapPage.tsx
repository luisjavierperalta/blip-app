import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibHVpc2phdmllcnBlcmFsdGEiLCJhIjoiY21ic29rdmEwMG56MzJsc2RoeXQxNGh0YyJ9.QNMq88qX9wiOSsOEZHFfMw';

const MapPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // New York coordinates
      zoom: 9
    });

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapPage; 
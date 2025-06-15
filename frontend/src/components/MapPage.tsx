import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import styled from 'styled-components';
import MessageButton from './MessageButton';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibHVpc2phdmllcnBlcmFsdGEiLCJhIjoiY21ic29rdmEwMG56MzJsc2RoeXQxNGh0YyJ9.QNMq88qX9wiOSsOEZHFfMw';

const PopupContent = styled.div`
  padding: 8px;
  min-width: 200px;
`;

const UserInfo = styled.div`
  margin-bottom: 8px;
`;

const UserName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #333;
`;

const UserActivity = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const pulseKeyframes = `
  0% { box-shadow: 0 0 0 0 rgba(255,107,0,0.4); }
  70% { box-shadow: 0 0 0 30px rgba(255,107,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,107,0,0); }
`;

const FilterBar = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 10px;
  background: rgba(255,255,255,0.85);
  border-radius: 22px;
  box-shadow: 0 2px 8px rgba(30,40,80,0.10);
  padding: 8px 18px;
`;

const FilterBtn = styled.button<{active?: boolean}>`
  background: ${p => p.active ? 'rgba(255,102,0,0.12)' : 'transparent'};
  border: none;
  color: ${p => p.active ? '#ff6600' : '#888'};
  font-size: 1rem;
  font-weight: 700;
  border-radius: 18px;
  padding: 6px 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
`;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MapPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [filter, setFilter] = useState<'300m' | '25km' | '1000km'>('300m');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const location = useLocation();
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const polylineId = 'private-route-polyline';
  const distanceLabelId = 'private-route-distance-label';

  // Fetch nearby users from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const fetchNearbyUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('location', '!=', null),
          where('uid', '!=', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNearbyUsers(users);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching nearby users:', error);
        setError('Error loading nearby users');
      }
    };

    fetchNearbyUsers();
  }, [currentUser]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Start tracking location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15
          });

          // Add marker for current user
          marker.current = new mapboxgl.Marker({
            color: "#FF6B00"
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);

          // Draw pulse circle for selected radius
          drawPulseCircle(map.current!, longitude, latitude, filter);

          // Update current user's location in Firebase
          if (currentUser) {
            const userRef = collection(db, 'users');
            const userDoc = doc(userRef, currentUser.uid);
            updateDoc(userDoc, {
              location: {
                latitude,
                longitude,
                lastUpdated: serverTimestamp()
              }
            });
          }
        },
        (error) => {
          setError('Error getting location: ' + error.message);
        },
        {
          enableHighAccuracy: true
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [currentUser]);

  // Redraw pulse circle when filter or location changes
  useEffect(() => {
    if (!map.current || !currentLocation) return;
    drawPulseCircle(map.current, currentLocation.longitude, currentLocation.latitude, filter);
  }, [filter, currentLocation]);

  // Filter users by distance
  const filterRadius = filter === '300m' ? 300 : filter === '25km' ? 25000 : 1000000;
  const filteredNearbyUsers = nearbyUsers.filter(user => {
    if (!user.location || !currentLocation) return false;
    const d = getDistanceFromLatLonInMeters(currentLocation.latitude, currentLocation.longitude, user.location.latitude, user.location.longitude);
    return d <= filterRadius;
  });

  // Update markers when filtered users change
  useEffect(() => {
    if (!map.current) return;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    filteredNearbyUsers.forEach(user => {
      if (!user.location) return;
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${user.photoURL || 'https://via.placeholder.com/32'})`;
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="popup-content">
            <div class="user-info">
              <h3>${user.displayName || 'Anonymous User'}</h3>
              <p>Activity: ${user.activity || 'No activity'}</p>
            </div>
            <div class="message-button">
              <button onclick="window.startChat('${user.uid}', '${user.displayName || 'Anonymous User'}')">Message</button>
            </div>
          </div>
        `);
      const marker = new mapboxgl.Marker(el)
        .setLngLat([user.location.longitude, user.location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [filteredNearbyUsers]);

  // Draw pulse circle function
  function drawPulseCircle(map, lng, lat, filter) {
    // Remove existing circle if any
    if (map.getSource('pulse-circle')) {
      map.removeLayer('pulse-circle-layer');
      map.removeSource('pulse-circle');
    }
    const radius = filter === '300m' ? 0.3 : filter === '25km' ? 25 : 1000; // in km
    map.addSource('pulse-circle', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }]
      }
    });
    map.addLayer({
      id: 'pulse-circle-layer',
      type: 'circle',
      source: 'pulse-circle',
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, radius * 1000 / 0.075] // scale for zoom
          ],
          base: 2
        },
        'circle-color': '#FF6B00',
        'circle-opacity': 0.18,
        'circle-blur': 0.6
      }
    });
  }

  // Helper to draw or update the orange polyline
  function drawPrivateRoute(map, start, end) {
    // Remove existing polyline if any
    if (map.getSource(polylineId)) {
      map.removeLayer(polylineId);
      map.removeSource(polylineId);
    }
    const lineGeoJSON = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ]
      }
    };
    map.addSource(polylineId, {
      type: 'geojson',
      data: lineGeoJSON
    });
    map.addLayer({
      id: polylineId,
      type: 'line',
      source: polylineId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff6600',
        'line-width': 6,
        'line-opacity': 0.95
      }
    });
    // Calculate and set distance
    const d = getDistanceFromLatLonInMeters(start.lat, start.lng, end.lat, end.lng);
    setRouteDistance(d);
  }

  // Real-time polyline update effect
  useEffect(() => {
    if (!map.current) return;
    const state = location.state as any;
    if (state && state.showPrivateRoute && state.routeData) {
      // Listen for geolocation updates
      let watchId: number | null = null;
      function updateRoute(pos) {
        const { latitude, longitude } = pos.coords;
        const start = { lat: latitude, lng: longitude };
        const end = state.routeData.end;
        drawPrivateRoute(map.current!, start, end);
      }
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(updateRoute, undefined, { enableHighAccuracy: true });
        // Draw initial route from last known location
        if (currentLocation) {
          drawPrivateRoute(map.current, { lat: currentLocation.latitude, lng: currentLocation.longitude }, state.routeData.end);
        }
      }
      return () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (map.current && map.current.getSource(polylineId)) {
          map.current.removeLayer(polylineId);
          map.current.removeSource(polylineId);
        }
      };
    }
  }, [location.state, currentLocation]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <FilterBar>
        <FilterBtn active={filter==='300m'} onClick={()=>setFilter('300m')}>Within 300m</FilterBtn>
        <FilterBtn active={filter==='25km'} onClick={()=>setFilter('25km')}>Within 25km</FilterBtn>
        <FilterBtn active={filter==='1000km'} onClick={()=>setFilter('1000km')}>EU-wide (1000km)</FilterBtn>
      </FilterBar>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {routeDistance !== null && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff6600',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: 18,
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px rgba(255,102,0,0.18)',
          zIndex: 20
        }}>
          {routeDistance < 1000
            ? `${Math.round(routeDistance)} m to destination`
            : `${(routeDistance/1000).toFixed(2)} km to destination`}
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default MapPage; 
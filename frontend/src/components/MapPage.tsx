import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import styled from 'styled-components';
import MessageButton from './MessageButton';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

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

const MapPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
          
          // Center map on user's location
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

  // Update markers when nearby users change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for nearby users
    nearbyUsers.forEach(user => {
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
  }, [nearbyUsers]);

  return (
    <div style={{ width: '100%', height: '100vh' }} ref={mapContainer}>
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
import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';
import { User } from '../types';

export const useLocationTracking = (user: User | null) => {
    const watcherRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        let mounted = true;

        const startTracking = async () => {
            if (!user) {
                stopTracking();
                return;
            }

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Location permission denied');
                    return;
                }

                // Connect to WebSocket service
                await LocationService.connect();

                // Send immediate update on start
                const currentLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
                if (mounted && currentLoc) {
                    console.log('Sending initial location update:', currentLoc.coords);
                    LocationService.sendLocation(currentLoc.coords.latitude, currentLoc.coords.longitude);
                }

                // Start watching with 1 minute interval
                watcherRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 60000, // 1 minute
                        distanceInterval: 100, // Minimum 100 meters to save battery if not moving much
                    },
                    (newLoc) => {
                        console.log('Sending background location update:', newLoc.coords);
                        LocationService.sendLocation(newLoc.coords.latitude, newLoc.coords.longitude);
                    }
                );

            } catch (error) {
                console.error('Error starting location tracking:', error);
            }
        };

        const stopTracking = () => {
            if (watcherRef.current) {
                watcherRef.current.remove();
                watcherRef.current = null;
            }
            LocationService.disconnect();
        };

        startTracking();

        return () => {
            mounted = false;
            stopTracking();
        };
    }, [user]); // Re-run when user auth state changes
};

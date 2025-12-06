import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';
import { GuardianService } from '../services/GuardianService';

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [protectedLocations, setProtectedLocations] = useState<{ [key: number]: { latitude: number, longitude: number, name: string } }>({});

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            await LocationService.connect();

            // Start watching position
            Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 15000,
                    distanceInterval: 50,
                },
                (newLoc) => {
                    setLocation(newLoc);
                    // Location sending is now handled globally in useLocationTracking
                }
            );

            // Fetch who I am protecting and subscribe
            try {
                const protectionList = await GuardianService.getProtectingUsers();
                if (Array.isArray(protectionList)) {
                    protectionList.forEach((user: any) => {
                        LocationService.subscribeToUser(user.id, (loc) => {
                            if (loc && loc.latitude && loc.longitude) {
                                setProtectedLocations(prev => ({
                                    ...prev,
                                    [user.id]: { latitude: loc.latitude, longitude: loc.longitude, name: user.name }
                                }));
                            }
                        });
                    });
                }
            } catch (e) {
                console.error("Error fetching protected users", e);
            }

        })();

        return () => {
            LocationService.disconnect();
        };
    }, []);

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Waiting for location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
            >
                {/* Protected Users Locations */}
                {Object.entries(protectedLocations).map(([id, loc]) => (
                    <Marker
                        key={id}
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        title={loc.name}
                        description={`Tracking ${loc.name}`}
                        pinColor="purple"
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { flex: 1 },
    text: { color: '#fff', textAlign: 'center', marginTop: 50 },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Linking, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';
import { GuardianService } from '../services/GuardianService';
import { COLORS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProtectedUserLoc {
    latitude: number;
    longitude: number;
    name: string;
    lastUpdate?: string;
}

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [protectedLocations, setProtectedLocations] = useState<{ [key: number]: ProtectedUserLoc }>({});
    const [mapRef, setMapRef] = useState<MapView | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            // Get initial location for map centering
            const currentLoc = await Location.getCurrentPositionAsync({});
            setLocation(currentLoc);

            // Connect WS
            await LocationService.connect();

            // Local watch for UI only (to show blue dot smoothy) - handled by showsUserLocation
            // We just need one read to center map

            fetchProtectedUsers();
        })();

        return () => {
            LocationService.disconnect();
        };
    }, []);

    const fetchProtectedUsers = async () => {
        try {
            const protectionList = await GuardianService.getProtectingUsers();
            if (Array.isArray(protectionList)) {
                // Initialize state with last known locations
                const initialLocs: { [key: number]: ProtectedUserLoc } = {};
                protectionList.forEach((user: any) => {
                    if (user.lastLatitude && user.lastLongitude) {
                        initialLocs[user.id] = {
                            latitude: user.lastLatitude,
                            longitude: user.lastLongitude,
                            name: user.name,
                            lastUpdate: user.lastLocationUpdate
                        };
                    }

                    // Subscribe for live updates
                    LocationService.subscribeToUser(user.id, (loc) => {
                        if (loc && loc.latitude && loc.longitude) {
                            setProtectedLocations(prev => ({
                                ...prev,
                                [user.id]: {
                                    latitude: loc.latitude,
                                    longitude: loc.longitude,
                                    name: user.name,
                                    lastUpdate: new Date().toISOString()
                                }
                            }));
                        }
                    });
                });
                setProtectedLocations(initialLocs);
            }
        } catch (e) {
            console.error("Error fetching protected users", e);
        }
    };


    const openMaps = (lat: number, lng: number, label: string) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const labelFormatted = encodeURIComponent(label);
        const url = Platform.select({
            ios: `${scheme}${labelFormatted}@${latLng}`,
            android: `${scheme}${latLng}(${labelFormatted})`
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Locating...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={(ref) => setMapRef(ref)}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                userInterfaceStyle="dark"
                customMapStyle={mapStyle}
                mapPadding={{ top: 50, right: 10, bottom: 10, left: 10 }}
                toolbarEnabled={true}
            >
                {/* Protected Users Locations */}
                {Object.entries(protectedLocations).map(([id, loc]) => (
                    <Marker
                        key={id}
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        pinColor={COLORS.neonGreen}
                    >
                        <Callout tooltip onPress={() => openMaps(loc.latitude, loc.longitude, loc.name)}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{loc.name}</Text>
                                <Text style={styles.calloutSubtitle}>
                                    {loc.lastUpdate ? new Date(loc.lastUpdate).toLocaleTimeString() : 'Offline'}
                                </Text>
                                <View style={styles.directionsContainer}>
                                    <Ionicons name="navigate" size={14} color={COLORS.white} />
                                    <Text style={styles.directionsText}>Directions</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#4285F4' }]} />
                    <Text style={styles.legendText}>You</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: COLORS.neonGreen }]} />
                    <Text style={styles.legendText}>Beacons</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.black },
    map: { flex: 1 },
    loadingContainer: { flex: 1, backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: COLORS.neonGreen, marginTop: 10 },

    calloutContainer: {
        backgroundColor: '#1E1E1E', // Dark Gray Surface
        padding: 12,
        borderRadius: 8,
        width: 160,
        alignItems: 'center',
        // Shadow for depth instead of neon border
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: { color: COLORS.white, fontWeight: '600', fontSize: 14, marginBottom: 2 },
    calloutSubtitle: { color: COLORS.mutedText, fontSize: 11, marginBottom: 8 },
    directionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#374151', // Neutral Gray Button
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    directionsText: {
        color: COLORS.white,
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500'
    },

    legendContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendText: { color: '#fff', fontSize: 12 },
});

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#242f3e" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#746855" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#242f3e" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#263c3f" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#6b9a76" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#38414e" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#212a37" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9ca5b3" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#746855" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#1f2835" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#f3d19c" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#17263c" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#515c6d" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#17263c" }]
    }
];

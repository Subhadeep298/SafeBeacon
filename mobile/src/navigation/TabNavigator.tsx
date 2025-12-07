import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import MapScreen from '../screens/MapScreen';
import GuardianScreen from '../screens/GuardianScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { User } from '../types';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    user: User | null;
    onLogout: () => void;
}

export default function TabNavigator({ user, onLogout }: TabNavigatorProps) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.black,
                    borderTopColor: COLORS.darkGreen,
                    borderTopWidth: 1,
                    height: 85, // Increased height for safe area
                    paddingBottom: 20, // More padding for bottom edge
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.neonGreen,
                tabBarInactiveTintColor: COLORS.mutedText,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Map') {
                        iconName = focused ? 'location' : 'location-outline';
                    } else if (route.name === 'Guardians') {
                        iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{ title: 'Live Location' }}
            />
            <Tab.Screen
                name="Guardians"
                component={GuardianScreen}
                options={{ title: 'Watchers' }}
            />
            <Tab.Screen
                name="Settings"
                children={() => <SettingsScreen user={user} onLogout={onLogout} />}
                options={{ title: 'Settings' }}
            />
        </Tab.Navigator>
    );
}

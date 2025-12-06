import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/theme';
import { User } from './src/types';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData: User) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.neonGreen} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" backgroundColor={COLORS.black} />
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: COLORS.black,
                            borderBottomWidth: 1,
                            borderBottomColor: COLORS.neonGreen,
                        },
                        headerTintColor: COLORS.neonGreen,
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                >
                    {user ? (
                        <Stack.Screen name="Home" options={{ headerShown: false }}>
                            {(props) => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
                        </Stack.Screen>
                    ) : (
                        <>
                            <Stack.Screen name="Login" options={{ headerShown: false }}>
                                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
                            </Stack.Screen>
                            <Stack.Screen
                                name="Register"
                                options={{
                                    title: 'Create Account',
                                    headerBackTitle: 'Back',
                                }}
                            >
                                {(props) => <RegisterScreen {...props} onLogin={handleLogin} />}
                            </Stack.Screen>
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

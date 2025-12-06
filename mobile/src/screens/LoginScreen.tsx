import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AntDesign } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { authAPI } from '../services/api';
import { User } from '../types';

interface LoginScreenProps {
    navigation: any;
    onLogin: (user: User) => void;
}

export default function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const { url } = event;
            handleUrl(url);
        };

        const handleUrl = async (url: string | null) => {
            if (!url) return;

            if (url.includes('accessToken')) {
                try {
                    setLoading(true);
                    const params = Linking.parse(url).queryParams;
                    const accessToken = params?.accessToken as string;
                    const refreshToken = params?.refreshToken as string;

                    if (accessToken) {
                        await AsyncStorage.setItem('accessToken', accessToken);
                        if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

                        const profileResponse = await authAPI.getProfile();
                        const user = profileResponse.data;

                        await AsyncStorage.setItem('user', JSON.stringify(user));
                        onLogin(user);
                    }
                } catch (error) {
                    console.error('Deep link error:', error);
                    Alert.alert('Login Failed', 'Could not verify Google login.');
                } finally {
                    setLoading(false);
                }
            }
        };

        Linking.getInitialURL().then(handleUrl);
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login({ email, password });
            const { accessToken, refreshToken, user } = response.data;

            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            onLogin(user);
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid credentials. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const backendUrl = Platform.OS === 'android'
                ? 'http://192.168.29.200.nip.io:8080'
                : 'http://192.168.29.200.nip.io:8080';

            const authUrl = `${backendUrl}/oauth2/authorization/google`;
            const result = await WebBrowser.openBrowserAsync(authUrl);

            if (result.type === 'opened') {
                console.log('Browser opened for Google Login');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open Google Login');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}>SafeBeacon</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.mutedText}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.mutedText}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.black} />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        <AntDesign name="google" size={24} color={COLORS.white} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signupLink}
                        onPress={() => navigation.navigate('Register')}
                        disabled={loading}
                    >
                        <Text style={styles.signupText}>
                            Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding * 1.5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.neonGreen,
        textShadowColor: COLORS.neonGreen,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        marginBottom: 8,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius * 2,
        padding: SIZES.padding * 2,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: SIZES.small,
        color: COLORS.lightText,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.mediumGray,
        borderRadius: SIZES.radius,
        padding: 16,
        fontSize: SIZES.body,
        color: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    button: {
        backgroundColor: COLORS.neonGreen,
        borderRadius: SIZES.radius,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.lightGray,
    },
    dividerText: {
        color: COLORS.mutedText,
        paddingHorizontal: 12,
        fontSize: SIZES.small,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.mediumGray,
        borderRadius: SIZES.radius,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.white,
    },
    signupLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    signupText: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
    },
    signupTextBold: {
        color: COLORS.neonGreen,
        fontWeight: 'bold',
    },
});

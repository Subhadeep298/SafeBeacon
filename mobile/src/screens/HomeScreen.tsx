import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants/theme';
import { User } from '../types';

interface HomeScreenProps {
    user: User;
    onLogout: () => void;
}

export default function HomeScreen({ user, onLogout }: HomeScreenProps) {
    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                        onLogout();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome Back,</Text>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusIndicator} />
                        <Text style={styles.statusText}>System Active</Text>
                    </View>
                    <Text style={styles.statusSubtext}>All safety features enabled</Text>
                </View>

                {/* User Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Account Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    {user?.phone && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user?.phone}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Auth Method</Text>
                        <Text style={styles.infoValue}>{user?.authProvider}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        padding: SIZES.padding * 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
        marginBottom: 4,
    },
    userName: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    logoutButton: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: '600',
        fontSize: SIZES.small,
    },
    statusCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.neonGreen,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.neonGreen,
        marginRight: 12,
    },
    statusText: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: '600',
    },
    statusSubtext: {
        fontSize: SIZES.small,
        color: COLORS.mutedText,
        marginLeft: 20,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
    },
    cardTitle: {
        fontSize: SIZES.h4,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    infoLabel: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
    },
    infoValue: {
        fontSize: SIZES.body,
        color: COLORS.white,
        fontWeight: '500',
    },
});

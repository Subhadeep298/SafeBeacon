import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, Clipboard } from 'react-native';
import axios from 'axios';
import { GuardianService } from '../services/GuardianService';
import { authAPI } from '../services/api';
import { User } from '../types';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GuardianScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [guardians, setGuardians] = useState<any[]>([]);
    const [protecting, setProtecting] = useState<any[]>([]);
    const [tab, setTab] = useState<'guardians' | 'protecting'>('guardians');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const myGuardians = await GuardianService.getMyGuardians();
            setGuardians(Array.isArray(myGuardians) ? myGuardians : []);

            const myProtecting = await GuardianService.getProtectingUsers();
            setProtecting(Array.isArray(myProtecting) ? myProtecting : []);

            const profile = await authAPI.getProfile();
            setCurrentUser(profile.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const search = async () => {
        if (!searchQuery) return;
        try {
            const results = await GuardianService.searchUsers(searchQuery);
            setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert('Search Failed', error.response?.data?.message || error.message);
            } else {
                Alert.alert('Error', 'Failed to search users');
            }
        }
    };

    const addGuardian = async (id: number) => {
        try {
            await GuardianService.addGuardian(id);
            Alert.alert('Success', 'Watcher added');
            setSearchResults([]);
            setSearchQuery('');
            loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to add watcher');
        }
    };

    const removeGuardian = async (id: number) => {
        Alert.alert(
            "Remove Watcher",
            "Are you sure you want to remove this watcher?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await GuardianService.removeGuardian(id);
                            loadData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove watcher');
                        }
                    }
                }
            ]
        );
    };

    const copyCode = () => {
        if (currentUser?.guardianCode) {
            Clipboard.setString(currentUser.guardianCode);
            Alert.alert("Copied", "Watcher code copied to clipboard!");
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.codeCard}>
                <View>
                    <Text style={styles.codeLabel}>My Watcher Code</Text>
                    <Text style={styles.codeValue}>{currentUser?.guardianCode || 'Loading...'}</Text>
                </View>
                <TouchableOpacity onPress={copyCode} style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={20} color={COLORS.black} />
                </TouchableOpacity>
            </View>
            <Text style={styles.codeDescription}>
                Share this code with trusted contacts so they can add you as their beacon.
            </Text>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTab('guardians')}
                style={[styles.tab, tab === 'guardians' && styles.activeTab]}
            >
                <Ionicons name="shield-checkmark" size={18} color={tab === 'guardians' ? COLORS.white : COLORS.mutedText} />
                <Text style={[styles.tabText, tab === 'guardians' && styles.activeTabText]}>My Watchers</Text>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTab('protecting')}
                style={[styles.tab, tab === 'protecting' && styles.activeTab]}
            >
                <Ionicons name="people" size={18} color={tab === 'protecting' ? COLORS.white : COLORS.mutedText} />
                <Text style={[styles.tabText, tab === 'protecting' && styles.activeTabText]}>Beacons</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.screenTitle}>Network</Text>
                <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={20} color={COLORS.neonGreen} />
                </TouchableOpacity>
            </View>

            {renderHeader()}
            {renderTabs()}

            {tab === 'guardians' ? (
                <View style={styles.content}>
                    <View style={styles.searchSection}>
                        <Text style={styles.sectionTitle}>Add New Watcher</Text>
                        <View style={styles.searchRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 6-digit code"
                                placeholderTextColor={COLORS.mutedText}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={search}>
                                <Ionicons name="search" size={20} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {searchResults.length > 0 && (
                        <View style={styles.resultContainer}>
                            {searchResults.map((user, index) => (
                                <View key={user?.id || index} style={styles.userCard}>
                                    <View style={styles.userInfo}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.cardTitle}>{user?.name}</Text>
                                            <Text style={styles.cardSubtitle}>Code: {user?.guardianCode}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.addButton} onPress={() => user?.id && addGuardian(user.id)}>
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Trusted Watchers</Text>
                    <FlatList
                        data={guardians}
                        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                        refreshing={loading}
                        onRefresh={loadData}
                        ListEmptyComponent={<Text style={styles.emptyText}>No watchers added yet.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.darkGreen }]}>
                                        <Text style={[styles.avatarText, { color: COLORS.neonGreen }]}>{item?.name?.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>{item?.name || 'Unknown'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => item?.id && removeGuardian(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>My Beacons</Text>
                    <FlatList
                        data={protecting}
                        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                        refreshing={loading}
                        onRefresh={loadData}
                        ListEmptyComponent={<Text style={styles.emptyText}>You are not watching any beacons yet.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: '#4C1D95' }]}>
                                        <Text style={[styles.avatarText, { color: '#A78BFA' }]}>{item?.name?.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>{item?.name || 'Unknown'}</Text>
                                        {item?.lastLocationUpdate ? (
                                            <Text style={styles.cardSubtitle}>
                                                Last seen: {new Date(item.lastLocationUpdate).toLocaleTimeString()}
                                            </Text>
                                        ) : (
                                            <Text style={styles.cardSubtitle}>Location unknown</Text>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="location-outline" size={20} color={COLORS.neonGreen} />
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.black, padding: SIZES.padding },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 20 },
    screenTitle: { color: COLORS.white, fontSize: SIZES.h1, fontWeight: 'bold' },
    refreshButton: { padding: 8, backgroundColor: COLORS.surface, borderRadius: 20 },

    header: { marginBottom: 20 },
    codeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: COLORS.neonGreen,
        borderWidth: 1,
        padding: 15,
        borderRadius: SIZES.radius
    },
    codeLabel: { color: COLORS.neonGreen, fontSize: SIZES.tiny, textTransform: 'uppercase', marginBottom: 5 },
    codeValue: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
    copyButton: { backgroundColor: COLORS.neonGreen, padding: 8, borderRadius: 8 },
    codeDescription: { color: COLORS.mutedText, fontSize: SIZES.small, marginTop: 8 },

    tabContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 4, marginBottom: 20 },
    tab: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: SIZES.radius - 4 },
    activeTab: { backgroundColor: COLORS.mediumGray },
    tabText: { color: COLORS.mutedText, fontWeight: '600', marginLeft: 8 },
    activeTabText: { color: COLORS.white },

    content: { flex: 1 },
    sectionTitle: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold', marginBottom: 15 },

    searchSection: { marginBottom: 20 },
    searchRow: { flexDirection: 'row' },
    input: { flex: 1, backgroundColor: COLORS.surface, color: COLORS.white, padding: 12, borderRadius: SIZES.radius, marginRight: 10, borderWidth: 1, borderColor: COLORS.lightGray },
    searchButton: { backgroundColor: COLORS.neonGreen, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: SIZES.radius },

    resultContainer: { marginBottom: 20 },

    userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: COLORS.surface, marginBottom: 10, borderRadius: SIZES.radius },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.mediumGray, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    cardSubtitle: { color: COLORS.mutedText, fontSize: 12 },

    addButton: { backgroundColor: COLORS.neonGreen, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
    addButtonText: { color: COLORS.black, fontWeight: 'bold', fontSize: 12 },

    emptyText: { color: COLORS.mutedText, textAlign: 'center', marginTop: 20 },
});

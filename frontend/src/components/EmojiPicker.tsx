import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../stores/useThemeStore';
import { Clock, Smile, User, Cat, Coffee, Activity, Plane, Lightbulb, Hash, Flag } from 'lucide-react-native';
// Using a simplified local dataset to avoid large JSON bundle issues in RN unless configured
// In a real prod app, efficient data loading is key. 
// For this demo, I'll generate a comprehensive set or try to load a subset. 
// Actually, let's try to fetch if possible or use a known list. 
// I will populate a representative list for now to ensure UI works, as full unicode array is huge for a single file.
const emojiData: any = require('@emoji-mart/data');

// Pre-compute emoji map outside component
const PRECOMPUTED_EMOJI_MAP: any = {};
if (emojiData && emojiData.categories) {
    emojiData.categories.forEach((cat: any) => {
        PRECOMPUTED_EMOJI_MAP[cat.id] = cat.emojis.map((id: string) => {
            const e = emojiData.emojis[id];
            return e?.skins?.[0]?.native || '';
        }).filter(Boolean);
    });
}

const CATEGORIES = [
    { id: 'frequent', icon: Clock, label: 'Recent' },
    { id: 'people', icon: Smile, label: 'Smileys & People' },
    { id: 'nature', icon: Cat, label: 'Animals & Nature' },
    { id: 'foods', icon: Coffee, label: 'Food & Drink' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'places', icon: Plane, label: 'Travel & Places' },
    { id: 'objects', icon: Lightbulb, label: 'Objects' },
    { id: 'symbols', icon: Hash, label: 'Symbols' },
    { id: 'flags', icon: Flag, label: 'Flags' },
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose?: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const colors = useThemeColors();
    const [category, setCategory] = useState('people');
    const [recent, setRecent] = useState<string[]>([]);

    // No more useMemo heavy lifting here


    useEffect(() => {
        loadRecents();
    }, []);

    const loadRecents = async () => {
        try {
            const stored = await AsyncStorage.getItem('recentEmojis');
            if (stored) setRecent(JSON.parse(stored));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelect = async (emoji: string) => {
        onSelect(emoji);
        // Update recents
        const newRecent = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 30);
        setRecent(newRecent);
        await AsyncStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    };

    const renderCategoryItem = ({ item }: any) => {
        const Icon = item.icon;
        const isActive = category === item.id;
        return (
            <TouchableOpacity
                style={[styles.catBtn, isActive && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                onPress={() => setCategory(item.id)}
            >
                <Icon size={20} color={isActive ? colors.blue : colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    const currentEmojis = category === 'frequent' ? recent : (PRECOMPUTED_EMOJI_MAP[category] || []);

    // Detect dark mode indirectly from colors (simplified)
    const isDark = colors.background === '#000000';

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF',
                borderColor: colors.border,
                // Aligned right, adjacent to the icon logic
                width: 350,
                right: 10, // Align to right edge 
                bottom: 60, // Just above the input bar
            }
        ]}>
            {/* Sidebar */}
            <View style={[styles.sidebar, { borderRightColor: colors.border }]}>
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            </View>

            {/* Emoji Grid */}
            <View style={styles.grid}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF' }]}>
                    {CATEGORIES.find(c => c.id === category)?.label}
                </Text>
                <FlatList
                    data={currentEmojis}
                    key={`grid-${category}`}
                    numColumns={8}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.emojiBtn} onPress={() => handleSelect(item)}>
                            <Text style={styles.emojiText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    getItemLayout={(data, index) => (
                        { length: 40, offset: 40 * index, index }
                    )}
                    removeClippedSubviews={true}
                    initialNumToRender={20}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // Bottom/Right controlled in inline styles now
        height: 320,
        flexDirection: 'row',
        borderWidth: 1, // Full border for popover look
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        zIndex: 2000,
        borderRadius: 16, // All corners rounded
        overflow: 'hidden'
    },
    sidebar: {
        width: 45, // Narrower sidebar
        borderRightWidth: 1,
        alignItems: 'center',
    },
    catBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        marginBottom: 6,
    },
    grid: {
        flex: 1,
    },
    sectionTitle: {
        padding: 8,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.8
    },
    emojiBtn: {
        width: '12.5%', // 8 cols (100 / 8)
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0, // Ensure no inner padding
    },
    emojiText: {
        fontSize: 26, // Slightly larger visual
        // Font Stack for Flags support
        fontFamily: Platform.select({
            web: '"Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", "Twemoji Mozilla", sans-serif',
            default: 'System'
        })
    },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColors } from '../stores/useThemeStore';

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionPillProps {
    onSelect: (emoji: string) => void;
    onCustomPress: () => void;
}

export default function ReactionPill({ onSelect, onCustomPress }: ReactionPillProps) {
    const colors = useThemeColors();
    const isDark = colors.background === '#000000';

    return (
        <View style={[styles.container, {
            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            borderColor: colors.border
        }]}>
            {COMMON_REACTIONS.map(emoji => (
                <TouchableOpacity key={emoji} onPress={() => onSelect(emoji)} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={onCustomPress} style={[styles.emojiBtn, { borderLeftWidth: 0.5, borderLeftColor: colors.border }]}>
                <Plus size={16} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    emojiBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    emojiText: {
        fontSize: 20,
    }
});

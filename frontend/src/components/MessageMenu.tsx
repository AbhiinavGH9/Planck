import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Reply, Copy, Forward, Trash2, Star, Pencil, CheckSquare } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { DropdownMenuItem, DropdownMenuSeparator } from './ui/DropdownMenu';
import { useThemeColors } from '../stores/useThemeStore';

interface MessageMenuProps {
    item: any;
    isMe: boolean;
    colors: any;
    onReply: (item: any) => void;
    onCopy: (text: string) => void;
    onForward: (item: any) => void;
    onDelete: (id: string) => void;
    onStar: (item: any) => void;
    onEdit?: (item: any) => void;
    onSelect?: (item: any) => void;
    onClose: () => void;
}

const MessageMenu = ({ item, isMe, colors, onReply, onCopy, onForward, onDelete, onStar, onEdit, onSelect, onClose }: MessageMenuProps) => {
    // We reuse the styling of DropdownMenuContent here manually since we don't use the Modal wrapper
    // The parent handles positioning
    return (
        <View style={[
            styles.menu,
            {
                backgroundColor: colors.background === '#000000' ? '#1c1c1e' : '#ffffff',
                borderColor: colors.border,
            }
        ]}>
            <DropdownMenuItem onSelect={() => { onReply(item); onClose(); }}>
                <Reply size={16} color={colors.text} />
                {/* We pass string as children usually, but here we want icon+text. DropdownMenuItem handles children rendering if not string */}
                <Text style={[styles.menuText, { color: colors.text }]}>Reply</Text>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => { onStar(item); onClose(); }}>
                <Star size={16} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Star</Text>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => { onCopy(item.text); onClose(); }}>
                <Copy size={16} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Copy</Text>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => { onForward(item); onClose(); }}>
                <Forward size={16} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Forward</Text>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => { onSelect && onSelect(item); onClose(); }}>
                <CheckSquare size={16} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>Select</Text>
            </DropdownMenuItem>

            {isMe && item.type === 'text' && (
                <DropdownMenuItem onSelect={() => { onEdit && onEdit(item); onClose(); }}>
                    <Pencil size={16} color={colors.text} />
                    <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
                </DropdownMenuItem>
            )}

            {isMe && <DropdownMenuSeparator />}

            {isMe && (
                <DropdownMenuItem onSelect={() => { onDelete(item.id); onClose(); }}>
                    <Trash2 size={16} color={Colors.danger} />
                    <Text style={[styles.menuText, { color: Colors.danger }]}>Delete</Text>
                </DropdownMenuItem>
            )}
        </View>
    );
};

export default MessageMenu;

// Re-using styles or defining simplified container styles
import { Text } from 'react-native';

const styles = StyleSheet.create({
    menu: {
        minWidth: 160,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 0 // DropdownMenuItem handles gap if we just pass row? 
        // Wait, DropdownMenuItem implementation:
        // <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}> {children} </View>
        // So we don't need margin left on text.
    }
});

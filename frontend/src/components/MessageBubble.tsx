import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { ChevronDown, CornerDownRight, SmilePlus, Reply, Copy, Forward, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';


interface MessageBubbleProps {
    item: any;
    isMe: boolean;
    onReply: (item: any) => void;
    onCopy: (text: string) => void;
    onForward: (item: any) => void;
    onDelete: (id: string) => void;
    isMenuOpen: boolean;
    onMenuToggle: (id: string | null, measurement?: any) => void;
    onReactionOpen: (item: any, y: number) => void;
    onReactionClick: (id: string, emoji: string) => void;
    onEdit?: (item: any) => void;
    onImagePress?: (url: string) => void;
    isMobile?: boolean;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    onToggleSelection?: (id: string) => void;
}

const MessageBubble = React.memo(({ item, isMe, onReply, onCopy, onForward, onDelete, isMenuOpen, onMenuToggle, onReactionOpen, onReactionClick, onEdit, onImagePress, isMobile, isSelected, isSelectionMode, onToggleSelection }: MessageBubbleProps) => {
    const colors = useThemeColors();
    const { user } = useAuthStore();
    const [aspectRatio, setAspectRatio] = useState(item.aspectRatio || 1);
    const [isHovered, setIsHovered] = useState(false);

    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    const isImage = item.type === 'image';

    const renderImageGrid = () => {
        const images = item.images || [];
        const displayImages = images.slice(0, 4);
        const remaining = images.length - 4;

        return (
            <View style={styles.gridContainer}>
                {displayImages.map((img: any, idx: number) => (
                    <TouchableOpacity
                        key={img.id}
                        style={[styles.gridItem, displayImages.length === 1 && { width: '100%', aspectRatio: img.aspectRatio || 1 }]}
                        onPress={() => onImagePress && onImagePress(img.mediaUrl)}
                    >
                        <Image
                            source={{ uri: img.mediaUrl }}
                            style={styles.gridImage}
                            resizeMode="cover"
                        />
                        {idx === 3 && remaining > 0 && (
                            <View style={styles.gridOverlay}>
                                <Text style={styles.gridOverlayText}>+{remaining}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => isSelectionMode && onToggleSelection ? onToggleSelection(item.id) : null}
            style={[
                styles.bubbleContainer,
                isMe ? styles.bubbleRight : styles.bubbleLeft,
                isSelected && { backgroundColor: 'rgba(29, 171, 97, 0.1)' } // Tint background when selected
            ]}
            // @ts-ignore
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {isSelectionMode && (
                <View style={[styles.selectionCircle, isSelected && { backgroundColor: Colors.primary }]}>
                    {isSelected && <View style={styles.selectionDot} />}
                </View>
            )}
            <View style={[
                styles.bubble,
                isMe ? { backgroundColor: colors.blue } : { backgroundColor: colors.incomingBubble },
                isImage && { padding: 4, borderRadius: 12 },
                item.type === 'image_grid' && { padding: 2, borderRadius: 12 }
            ]}>
                {/* Reply Context */}
                {item.replyTo && (
                    <View style={[
                        styles.replyContainer,
                        { backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    ]}>
                        <View style={[styles.replyBar, { backgroundColor: colors.blue }]} />
                        <View style={{ flex: 1, paddingLeft: 8 }}>
                            <Text style={[styles.replyUser, { color: colors.blue }]}>{item.replyTo.senderName}</Text>
                            <Text style={[styles.replyText, { color: isMe ? '#FFF' : colors.text }]} numberOfLines={1}>{item.replyTo.text}</Text>
                        </View>
                    </View>
                )}

                {/* Content */}
                {item.type === 'image_grid' ? (
                    renderImageGrid()
                ) : isImage ? (
                    <View style={{ maxWidth: 250 }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => onImagePress && onImagePress(item.mediaUrl)}
                        >
                            <Image
                                source={{ uri: item.mediaUrl }}
                                style={[
                                    styles.imageContent,
                                    { aspectRatio: aspectRatio || 1 }
                                ]}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                        {item.text ? (
                            <Text style={[styles.captionText, isMe ? { color: '#FFF' } : { color: colors.text }]}>
                                {item.text}
                            </Text>
                        ) : null}
                    </View>
                ) : item.type === 'contact' ? (
                    // Contact Card Visualization
                    (() => {
                        let contactData;
                        try {
                            contactData = JSON.parse(item.text);
                        } catch (e) {
                            contactData = { username: 'Unknown Contact' };
                        }
                        return (
                            <View style={{ width: 220 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Image
                                        source={{ uri: contactData.avatar || 'https://i.pravatar.cc/100' }}
                                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#ccc' }}
                                    />
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: isMe ? '#FFF' : colors.text }}>{contactData.username}</Text>
                                        <Text style={{ fontSize: 12, opacity: 0.8, color: isMe ? '#FFF' : colors.textSecondary }}>Contact</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={{ backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, alignItems: 'center' }}>
                                    <Text style={{ fontWeight: '600', color: isMe ? '#FFF' : colors.blue }}>Message</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()
                ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <Text style={[styles.msgText, isMe ? { color: colors.outgoingText } : { color: colors.text }]}>
                            {item.text}
                            {item.isEdited && (
                                <Text style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.7 }}> (edited)</Text>
                            )}
                        </Text>
                    </View>
                )}

                {/* Time */}
                <Text style={[styles.timeText, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.textSecondary }, (isImage || item.type === 'image_grid') && { marginRight: 4, marginBottom: 4 }]}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>

                {/* Always Visible Chevron */}
                <TouchableOpacity
                    style={[styles.menuTrigger, { opacity: (isHovered || isMenuOpen) ? 1 : 0.7 }]}
                    onPress={(e) => {
                        // Pass coordinates to lift menu to root
                        onMenuToggle(isMenuOpen ? null : item.id, {
                            y: e.nativeEvent.pageY,
                            isMe: isMe
                        });
                    }}
                >
                    <ChevronDown size={14} color={isMe ? '#FFF' : colors.textSecondary} />
                </TouchableOpacity>

                {/* Reaction Quick Button */}
                {!isSelectionMode && isHovered && (
                    <TouchableOpacity
                        style={[styles.reactionTrigger, isMe ? { left: -30 } : { right: -30 }]}
                        onPress={(e) => onReactionOpen(item, e.nativeEvent.pageY)}
                    >
                        <SmilePlus size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}

                {/* Reactions Display */}
                {item.reactions && Object.keys(item.reactions).length > 0 && (
                    <View style={[
                        styles.reactionsContainer,
                        isMe ? { left: 0, bottom: -20 } : { right: 0, bottom: -20 }
                    ]}>
                        {Object.entries(item.reactions).map(([emoji, users]: [string, any]) => (
                            <TouchableOpacity
                                key={emoji}
                                style={[
                                    styles.reactionBadge,
                                    {
                                        backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#F2F2F7',
                                        borderColor: users.includes(user?.id) ? colors.blue : 'transparent'
                                    }
                                ]}
                                onPress={() => onReactionClick(item.id, emoji)}
                            >
                                <Text style={{ fontSize: 12 }}>{emoji}</Text>
                                {users.length > 1 && <Text style={{ fontSize: 10, marginLeft: 2, color: colors.text }}>{users.length}</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // Custom Comparison Function to avoid re-renders on object ref changes (Polling)
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.text === nextProps.item.text &&
        prevProps.item.mediaUrl === nextProps.item.mediaUrl &&
        prevProps.isMenuOpen === nextProps.isMenuOpen &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isSelectionMode === nextProps.isSelectionMode &&
        JSON.stringify(prevProps.item.reactions) === JSON.stringify(nextProps.item.reactions) &&
        (prevProps.item.type !== 'image_grid' || JSON.stringify(prevProps.item.images) === JSON.stringify(nextProps.item.images))
    );
});

export default MessageBubble;

const styles = StyleSheet.create({
    bubbleContainer: { flexDirection: 'row', marginBottom: 6, width: '100%', position: 'relative' },
    bubbleLeft: { justifyContent: 'flex-start', paddingLeft: 10 },
    bubbleRight: { justifyContent: 'flex-end', paddingRight: 10 },

    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 4,
        borderRadius: 12,
        position: 'relative',
        minWidth: 60,
        // Shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        // Elevation (Android)
        elevation: 1,
    },

    imageContent: { width: 240, borderRadius: 8, backgroundColor: '#ddd' },
    captionText: { marginTop: 4, fontSize: 14, paddingHorizontal: 4 },

    msgText: { fontSize: 15, lineHeight: 18, marginBottom: 2 },
    timeText: { fontSize: 10, alignSelf: 'flex-end', opacity: 0.8 },

    menuTrigger: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },

    replyContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        marginBottom: 6,
        padding: 6,
        overflow: 'hidden'
    },
    replyBar: { width: 4, borderRadius: 2 },
    replyUser: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
    replyText: { fontSize: 12, fontStyle: 'italic' },

    reactionTrigger: {
        position: 'absolute',
        top: '50%',
        marginTop: -14, // Center vertically (approx)
        zIndex: 10,
    },
    reactionsContainer: {
        position: 'absolute',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4
    },
    reactionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
    },
    selectionCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
        marginHorizontal: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFF'
    },
    // Grid Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 240,
        borderRadius: 12,
        overflow: 'hidden',
        gap: 2
    },
    gridItem: {
        width: '49%',
        aspectRatio: 1,
        position: 'relative'
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    gridOverlayText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold'
    }
});

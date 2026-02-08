import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, TextInput, ScrollView, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, Send, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface ImagePreviewModalProps {
    visible: boolean;
    images: any[];
    onClose: () => void;
    onSend: (images: any[], caption: string) => void;
    onAddMore: () => void;
}

export default function ImagePreviewModal({ visible, images, onClose, onSend, onAddMore }: ImagePreviewModalProps) {
    const colors = useThemeColors();
    const [caption, setCaption] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (visible) {
            setSelectedIndex(0);
            setCaption('');
        }
    }, [visible]);

    if (!images || images.length === 0) return null;

    const currentImage = images[selectedIndex];
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    // 16:9 Calculation
    // We want the modal to be 16:9.
    // Let's set a max width (e.g., 90% of screen or 600px)
    const modalWidth = Math.min(screenWidth * 0.95, 600);
    const modalHeight = modalWidth * (9 / 16);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Close Area */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                    <View style={[
                        styles.modalContainer,
                        {
                            width: modalWidth,
                            height: modalHeight + 140, // + Height for footer/thumbnails
                            backgroundColor: colors.card,
                            borderColor: colors.border
                        }
                    ]}>

                        {/* Header / Close */}
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <X size={20} color="#FFF" />
                        </TouchableOpacity>

                        {/* Main Image Area (16:9) */}
                        <View style={[styles.imageArea, { width: modalWidth, height: modalHeight }]}>
                            <Image
                                source={{ uri: currentImage.uri }}
                                style={styles.mainImage}
                                resizeMode="contain"
                            />
                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <TouchableOpacity
                                        style={[styles.navBtn, { left: 10 }]}
                                        onPress={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
                                        disabled={selectedIndex === 0}
                                    >
                                        <ChevronLeft size={24} color={selectedIndex === 0 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.navBtn, { right: 10 }]}
                                        onPress={() => setSelectedIndex(prev => Math.min(images.length - 1, prev + 1))}
                                        disabled={selectedIndex === images.length - 1}
                                    >
                                        <ChevronRight size={24} color={selectedIndex === images.length - 1 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* Thumbnails + Footer */}
                        <View style={styles.footerContainer}>
                            {images.length > 1 && (
                                <View style={styles.thumbnailRow}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                                        {images.map((img, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => setSelectedIndex(index)}
                                                style={[
                                                    styles.thumbnail,
                                                    selectedIndex === index && { borderColor: Colors.primary, borderWidth: 2 }
                                                ]}
                                            >
                                                <Image source={{ uri: img.uri }} style={{ width: 40, height: 40 }} />
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity onPress={onAddMore} style={styles.addBtn}>
                                            <Plus size={20} color={colors.text} />
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            )}

                            {/* Caption & Send */}
                            <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                                    placeholder="Add caption..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={caption}
                                    onChangeText={setCaption}
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, { backgroundColor: Colors.primary }]}
                                    onPress={() => onSend(images, caption)}
                                >
                                    <Send size={18} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject
    },
    modalContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    imageArea: {
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    mainImage: {
        width: '100%',
        height: '100%'
    },
    closeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 20
    },
    navBtn: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8
    },
    footerContainer: {
        flex: 1,
        paddingVertical: 10
    },
    thumbnailRow: {
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 16
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 6,
        marginRight: 8,
        overflow: 'hidden'
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(128,128,128,0.2)'
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: 0.5,
        gap: 10
    },
    input: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 14
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

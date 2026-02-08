import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { X, Download, ChevronLeft, ChevronRight, Share2 } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ImageViewerModalProps {
    visible: boolean;
    images: any[];
    initialIndex: number;
    onClose: () => void;
}

export default function ImageViewerModal({ visible, images, initialIndex, onClose }: ImageViewerModalProps) {
    const colors = useThemeColors();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
        }
    }, [visible, initialIndex]);

    if (!visible || !images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    const handleDownload = async () => {
        if (Platform.OS === 'web') {
            // Web download
            const link = document.createElement('a');
            link.href = currentImage.mediaUrl;
            link.download = `image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to save images.');
                return;
            }

            const fileUri = FileSystem.documentDirectory + `image_${Date.now()}.jpg`;
            const { uri } = await FileSystem.downloadAsync(currentImage.mediaUrl, fileUri);

            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('Saved', 'Image saved to gallery!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    const handleShare = async () => {
        try {
            if (Platform.OS === 'web') {
                navigator.share({ url: currentImage.mediaUrl });
                return;
            }
            await Sharing.shareAsync(currentImage.mediaUrl);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                        <X size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                            <Share2 size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDownload} style={styles.iconBtn}>
                            <Download size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Image */}
                <View style={styles.mainContainer}>
                    <Image
                        source={{ uri: currentImage.mediaUrl }}
                        style={{ width: width, height: height * 0.7 }}
                        resizeMode="contain"
                    />

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <TouchableOpacity
                                style={[styles.navBtn, { left: 10, opacity: currentIndex === 0 ? 0 : 1 }]}
                                onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft size={30} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.navBtn, { right: 10, opacity: currentIndex === images.length - 1 ? 0 : 1 }]}
                                onPress={() => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))}
                                disabled={currentIndex === images.length - 1}
                            >
                                <ChevronRight size={30} color="#FFF" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Thumbnails Strip */}
                {images.length > 1 && (
                    <View style={styles.thumbnailContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                            {images.map((img, idx) => (
                                <TouchableOpacity
                                    key={img.id || idx}
                                    onPress={() => setCurrentIndex(idx)}
                                    style={[
                                        styles.thumbnail,
                                        currentIndex === idx && { borderColor: Colors.primary, borderWidth: 2 }
                                    ]}
                                >
                                    <Image source={{ uri: img.mediaUrl }} style={{ width: '100%', height: '100%' }} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'space-between'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        zIndex: 10
    },
    actions: {
        flexDirection: 'row',
        gap: 15
    },
    iconBtn: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    navBtn: {
        position: 'absolute',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30
    },
    thumbnailContainer: {
        height: 80,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 8,
        overflow: 'hidden',
        backgroundColor: '#333'
    }
});

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, DimensionValue } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';

interface SkeletonProps {
    width: DimensionValue | number;
    height: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonItem = ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
    const colors = useThemeColors();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();

        return () => loop.stop();
    }, []);

    const backgroundColor = colors.background === '#000000' ? '#333' : '#E0E0E0';

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor,
                    opacity,
                },
                style
            ]}
        />
    );
};

export const ChatRowSkeleton = () => {
    return (
        <View style={styles.row}>
            <SkeletonItem width={50} height={50} borderRadius={25} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <SkeletonItem width="40%" height={16} />
                    <SkeletonItem width={40} height={12} />
                </View>
                <SkeletonItem width="70%" height={14} />
            </View>
        </View>
    );
};

export const BubbleSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => {
    return (
        <View style={[styles.bubbleRow, isOwn ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
            <SkeletonItem
                width={Math.random() * (200 - 100) + 100}
                height={40}
                borderRadius={16}
                style={{
                    borderBottomRightRadius: isOwn ? 4 : 16,
                    borderBottomLeftRadius: isOwn ? 16 : 4
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    bubbleRow: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16
    }
});

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';

export const TerminalCursor = () => {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: 10,
                    height: 20,
                    backgroundColor: '#fff',
                    marginLeft: 4,
                },
                animatedStyle
            ]}
        />
    );
};

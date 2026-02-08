import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '../../stores/useThemeStore';
import { Colors } from '../../constants/Colors';

// Context
interface DropdownContextType {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    triggerLayout: { x: number; y: number; width: number; height: number } | null;
    setTriggerLayout: (layout: any) => void;
}

const DropdownContext = createContext<DropdownContextType>({
    visible: false,
    setVisible: () => { },
    triggerLayout: null,
    setTriggerLayout: () => { }
});

// Components
export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [triggerLayout, setTriggerLayout] = useState(null);

    return (
        <DropdownContext.Provider value={{ visible, setVisible, triggerLayout, setTriggerLayout }}>
            {children}
        </DropdownContext.Provider>
    );
};

export const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const { setVisible, setTriggerLayout, visible } = useContext(DropdownContext);
    const triggerRef = useRef<View>(null);

    const handlePress = () => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setTriggerLayout({ x, y, width, height });
            setVisible(!visible);
        });
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onPress: handlePress,
            ref: triggerRef,
            // collapsable: false 
        });
    }

    return (
        <TouchableOpacity ref={triggerRef as any} onPress={handlePress}>
            {children}
        </TouchableOpacity>
    );
};

export const DropdownMenuContent = ({ children, align = 'center', className, style }: { children: React.ReactNode, align?: 'start' | 'center' | 'end', className?: string, style?: ViewStyle }) => {
    const { visible, setVisible, triggerLayout } = useContext(DropdownContext);
    const colors = useThemeColors();

    if (!visible || !triggerLayout) return null;

    // Calculate Position
    let top = triggerLayout.y + triggerLayout.height + 5;
    let left = triggerLayout.x;
    const width = 200; // Default width

    if (align === 'center') {
        left = triggerLayout.x + (triggerLayout.width / 2) - (width / 2);
    } else if (align === 'end') {
        left = triggerLayout.x + triggerLayout.width - width;
    }

    // Safety check for screen bounds (Basic)
    // In a real app, use useWindowDimensions to clamp

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <View style={[
                styles.content,
                {
                    top,
                    left,
                    width,
                    backgroundColor: colors.background === '#000000' ? '#1c1c1e' : '#ffffff',
                    borderColor: colors.border
                },
                style
            ]}>
                {children}
            </View>
        </Modal>
    );
};

export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => {
    return <View>{children}</View>;
};

export const DropdownMenuItem = ({ children, onSelect, disabled }: { children: React.ReactNode, onSelect?: () => void, disabled?: boolean }) => {
    const { setVisible } = useContext(DropdownContext);
    const colors = useThemeColors();

    const handlePress = () => {
        if (disabled) return;
        if (onSelect) onSelect();
        setVisible(false);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.item, disabled && { opacity: 0.5 }]}
            activeOpacity={0.7}
        >
            {/* If children is string, wrap in Text, else render */}
            {typeof children === 'string' ? (
                <Text style={[styles.itemText, { color: colors.text }]}>{children}</Text>
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Hacky way to style icon/text children if passed as fragments */}
                    {children}
                </View>
            )}
        </TouchableOpacity>
    );
};

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => {
    const colors = useThemeColors();
    return (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{children}</Text>
    );
};

export const DropdownMenuSeparator = () => {
    const colors = useThemeColors();
    return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
};

export const DropdownMenuShortcut = ({ children }: { children: string }) => {
    const colors = useThemeColors();
    return (
        <Text style={[styles.shortcut, { color: colors.textSecondary }]}>{children}</Text>
    );
};

// Submenu components (Mock implementation for now, or simple nesting)
export const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;


const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    item: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    itemText: {
        fontSize: 14,
        fontWeight: '500',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 8,
        opacity: 0.7
    },
    separator: {
        height: 1,
        marginVertical: 4,
        marginHorizontal: -4
    },
    shortcut: {
        fontSize: 12,
        opacity: 0.6
    }
});

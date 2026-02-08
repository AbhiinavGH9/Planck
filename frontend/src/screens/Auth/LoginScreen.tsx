import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { TerminalCursor } from '../../components/TerminalCursor';
import { SERVER_URL } from '../../services/api';
import api from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type Step = 'boot' | 'user' | 'pass' | 'avatar' | 'auth' | 'error' | 'success';

interface TerminalLine {
    text: string;
    type: 'output' | 'input' | 'error' | 'success' | 'info' | 'system';
    prefix?: string;
}

export default function LoginScreen() {
    const { login, updateUser } = useAuthStore();
    const [step, setStep] = useState<Step>('boot');
    const [history, setHistory] = useState<TerminalLine[]>([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    // Boot sequence
    useEffect(() => {
        if (step === 'boot') {
            const bootLines = [
                { text: 'Initializing PointOS v3.0...', delay: 100 },
                { text: 'Loading kernel extensions...', delay: 300 },
                { text: 'Mounting /dev/disk1s1 (Read-Only)...', delay: 600 },
                { text: 'Bypassing firewall rules...', delay: 900 },
                { text: 'Establishing secure handshake...', delay: 1200 },
                { text: 'System ready.', delay: 1500 },
            ];

            let timeoutIds: NodeJS.Timeout[] = [];

            bootLines.forEach((line, index) => {
                const id = setTimeout(() => {
                    addToHistory(line.text, 'system');
                    if (index === bootLines.length - 1) {
                        setTimeout(() => {
                            addToHistory('Welcome to the Point Network.', 'info');
                            addToHistory('Please identify yourself.', 'info');
                            setStep('user');
                        }, 500);
                    }
                }, line.delay);
                timeoutIds.push(id);
            });

            return () => timeoutIds.forEach(clearTimeout);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [history, input, step]);

    // Focus input on tap
    const focusInput = () => {
        if (step !== 'boot' && step !== 'auth') {
            inputRef.current?.focus();
        }
    };

    const addToHistory = (text: string, type: TerminalLine['type'] = 'output', prefix?: string) => {
        setHistory(prev => [...prev, { text, type, prefix }]);
    };

    const handleCommand = async () => {
        const cmd = input.trim();
        const currentStep = step;

        // Add user input to history
        let displayInput = cmd;
        if (currentStep === 'pass') displayInput = '*'.repeat(cmd.length);
        addToHistory(displayInput, 'input', getPrompt(currentStep));

        setInput('');

        if (cmd === 'clear') {
            setHistory([]);
            return;
        }

        if (currentStep === 'user') {
            if (!cmd) return;
            setUsername(cmd);
            setStep('pass');
        } else if (currentStep === 'pass') {
            if (!cmd) return;
            setPassword(cmd);
            setStep('avatar');
        } else if (currentStep === 'avatar') {
            if (cmd.toLowerCase() === 'y' || cmd.toLowerCase() === 'yes') {
                await pickImage();
            } else {
                setStep('auth');
                attemptLogin(username, password, null);
            }
        }
    };

    const pickImage = async () => {
        addToHistory('Opening file system...', 'info');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatar(result.assets[0]);
            addToHistory('Image selected: ' + (result.assets[0].fileName || 'image.jpg'), 'success');
            setStep('auth');
            attemptLogin(username, password, result.assets[0]);
        } else {
            addToHistory('Selection canceled.', 'info');
            setStep('auth');
            attemptLogin(username, password, null);
        }
    };

    const attemptLogin = async (u: string, p: string, av: ImagePicker.ImagePickerAsset | null) => {
        addToHistory('Authenticating...', 'info');

        try {
            await login(u, p);
            addToHistory('ACCESS GRANTED.', 'success');

            // Handle avatar upload if exists
            if (av) {
                addToHistory('Uploading avatar...', 'info');
                await uploadAvatar(av);
                addToHistory('Avatar updated.', 'success');
            }

            addToHistory('Starting session...', 'info');
            // Navigation handled by router based on auth state
        } catch (error: any) {
            // Cyberistic Visual Feedbaack for Failure
            addToHistory('Verifying hash...', 'system');
            await new Promise(r => setTimeout(r, 600)); // Suspense

            addToHistory('ACCESS DENIED.', 'error');
            addToHistory('INTRUSION ATTEMPT LOGGED.', 'error');

            await new Promise(r => setTimeout(r, 1000));
            addToHistory('Resetting connection...', 'system');
            await new Promise(r => setTimeout(r, 800));

            // Reset to user step
            setStep('user');
            setUsername('');
            setPassword('');
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        const formData = new FormData();
        const uri = asset.uri;

        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            // @ts-ignore
            formData.append('image', blob, 'profile.jpg');
        } else {
            // @ts-ignore
            formData.append('image', {
                uri: uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            });
        }

        try {
            const res = await fetch(`${SERVER_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                await updateUser({ avatar: data.url });
            }
        } catch (e) {
            addToHistory('Avatar upload failed.', 'error');
            console.error(e);
        }
    };

    const getPrompt = (s: Step) => {
        switch (s) {
            case 'user': return 'login: ';
            case 'pass': return 'password: ';
            case 'avatar': return 'upload avatar? [y/n]: ';
            default: return '';
        }
    };

    // Render helper
    const renderLine = (line: TerminalLine, index: number) => {
        let color = '#aaffaa'; // Default faint green
        let textShadowColor = 'rgba(39, 201, 63, 0.4)';

        if (line.type === 'error') {
            color = '#ff3333';
            textShadowColor = 'rgba(255, 51, 51, 0.6)';
        }
        if (line.type === 'success') {
            color = '#33ff33';
            textShadowColor = 'rgba(51, 255, 51, 0.6)';
        }
        if (line.type === 'info') {
            color = '#88cc88';
            textShadowColor = 'rgba(136, 204, 136, 0.3)';
        }
        if (line.type === 'system') {
            color = '#448844';
            textShadowColor = 'transparent';
        }

        const lineStyle = [
            styles.text,
            { color, textShadowColor, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }
        ];

        if (line.type === 'input') {
            return (
                <View key={index} style={styles.lineRow}>
                    <Text style={[styles.text, styles.prompt]}>{line.prefix}</Text>
                    <Text style={[styles.text, { color: '#ffffff', textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 8 }]}>{line.text}</Text>
                </View>
            );
        }

        return (
            <View key={index} style={styles.lineRow}>
                <Text style={lineStyle}>{line.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.terminalWindow}>
                {/* CRT Scanline/Vignette Overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']}
                    style={styles.crtOverlay}
                    pointerEvents="none"
                />
                <View style={styles.scanline} pointerEvents="none" />

                {/* Window Header */}
                <View style={styles.header}>
                    <View style={styles.buttons}>
                        <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
                        <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
                        <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
                    </View>
                    <Text style={styles.headerTitle}>user — -zsh — 80x24</Text>
                </View>

                {/* Terminal Content */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="always"
                >
                    <TouchableOpacity activeOpacity={1} onPress={focusInput} style={styles.pressArea}>
                        {history.map(renderLine)}

                        {/* Active Input Line */}
                        {(step === 'user' || step === 'pass' || step === 'avatar') && (
                            <View style={styles.inputRow}>
                                <Text style={[styles.text, styles.prompt]}>
                                    {getPrompt(step)}
                                </Text>
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.textInput, styles.text]}
                                    value={input}
                                    onChangeText={setInput}
                                    onSubmitEditing={handleCommand}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry={step === 'pass'}
                                    selectionColor="#33ff33"
                                    autoFocus={true}
                                    blurOnSubmit={false}
                                />
                                {/* Custom Cursor */}
                                {input.length === 0 && (
                                    <View style={styles.cursorContainer}>
                                        <TerminalCursor />
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Loading Indicator */}
                        {step === 'auth' && (
                            <View style={styles.lineRow}>
                                <Text style={[styles.text, { color: '#88cc88' }]}>processing...</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    terminalWindow: {
        width: '100%',
        maxWidth: 600,
        height: '80%',
        backgroundColor: '#0c0c0c', // Darker black
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#000', // Reverted to black
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    crtOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
        zIndex: 10,
    },
    scanline: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.02)',
        zIndex: 11,
        // In a real app we might use a repeating background image or a gradient loop
    },
    header: {
        height: 36,
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    buttons: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    headerTitle: {
        color: '#666',
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        flex: 1,
        textAlign: 'center',
        marginRight: 50,
    },
    content: {
        flex: 1,
        backgroundColor: '#0c0c0c',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    pressArea: {
        minHeight: '100%',
    },
    text: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        lineHeight: 22,
        color: '#33ff33',
        textShadowColor: 'rgba(51, 255, 51, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    prompt: {
        color: '#33ff33',
        fontWeight: 'bold',
        textShadowColor: 'rgba(51, 255, 51, 0.8)',
        textShadowRadius: 12,
    },
    lineRow: {
        flexDirection: 'row',
        marginBottom: 2,
        flexWrap: 'wrap',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    textInput: {
        flex: 1,
        borderWidth: 0,
        outlineStyle: 'none',
        padding: 0,
        margin: 0,
        color: '#fff',
        backgroundColor: 'transparent',
    } as any,
    cursorContainer: {
        // Removed absolute positioning to prevent overlap
        marginLeft: 0,
    }
});

import React from 'react';
import { SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatDetailView from '../../components/ChatDetailView';
import { Colors } from '../../constants/Colors';

export default function ChatDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { chatId, otherUser } = route.params;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            <ChatDetailView
                chatId={chatId}
                otherUser={otherUser}
                onBack={() => navigation.goBack()}
                isMobile={true}
            />
        </SafeAreaView>
    );
}

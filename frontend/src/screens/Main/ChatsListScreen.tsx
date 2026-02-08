import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity, TextInput, SafeAreaView, useWindowDimensions, KeyboardAvoidingView, Platform, Image, PanResponder, Alert, TouchableWithoutFeedback } from 'react-native';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeColors } from '../../stores/useThemeStore';
import { Colors } from '../../constants/Colors';
import ChatRow from '../../components/ChatRow';
import ChatDetailView from '../../components/ChatDetailView';
import ProfileModal from '../../components/ProfileModal';
import FriendFinderModal from '../../components/FriendFinderModal';
import ArchivedChatsModal from '../../components/ArchivedChatsModal';
import StarredMessagesModal from '../../components/StarredMessagesModal';
import AdminPanelModal from '../../components/AdminPanelModal';
import BlockedUsersModal from '../../components/BlockedUsersModal';
import { ChatRowSkeleton } from '../../components/SkeletonLoader';
import SelectChatPlaceholder from '../../components/SelectChatPlaceholder';
import { Search, SquarePen, MoreVertical, Archive, Star, CheckCheck, Ban } from 'lucide-react-native';
import api from '../../services/api';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../components/ui/DropdownMenu';

export default function ChatsListScreen({ navigation }: any) {
    const { chats, fetchChats, chatSettings, fetchChatSettings, toggleChatSetting, blockedUsers, fetchBlockedUsers } = useChatStore();
    const { user } = useAuthStore();
    const colors = useThemeColors();
    const dimensions = useWindowDimensions();
    const isLargeScreen = dimensions.width > 768;

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [friendFinderVisible, setFriendFinderVisible] = useState(false);
    const [archivedVisible, setArchivedVisible] = useState(false);
    const [starredVisible, setStarredVisible] = useState(false);
    const [adminPanelVisible, setAdminPanelVisible] = useState(false);
    const [blockedVisible, setBlockedVisible] = useState(false);

    // Search
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        const init = async () => {
            await fetchChats();
            await fetchChatSettings();
            await fetchBlockedUsers();
            setIsLoading(false);
        };
        init();

    }, []);

    const filteredChats = chats.filter((chat: any) => {
        const settings = chatSettings[chat.id] || {};
        if (settings.isArchived) return false; // Hide archived
        if (searchQuery.length > 0) {
            const otherUser = chat.otherUser?.username || '';
            return otherUser.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    // Sort: Pinned First, then time
    const sortedChats = [...filteredChats].sort((a: any, b: any) => {
        const settingsA = chatSettings[a.id] || {};
        const settingsB = chatSettings[b.id] || {};

        if (settingsA.isPinned && !settingsB.isPinned) return -1;
        if (!settingsA.isPinned && settingsB.isPinned) return 1;

        // If same pin status, sort by time
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    const pinnedChats = sortedChats.filter((c: any) => chatSettings[c.id]?.isPinned);
    const recentChats = sortedChats.filter((c: any) => !chatSettings[c.id]?.isPinned);

    const handleMenuAction = async (chatId: string, action: string) => {
        // setActiveRowMenu(null); // State removed, relying on internal menu state or new dropdown logic

        if (action === 'pin') {
            const current = chatSettings[chatId]?.isPinned || false;
            await toggleChatSetting(chatId, 'isPinned', !current);
        } else if (action === 'archive') {
            const current = chatSettings[chatId]?.isArchived || false;
            await toggleChatSetting(chatId, 'isArchived', !current);
            // Alert.alert("Archived", "Chat moved to Archived Chats.");
        } else if (action === 'mute') {
            const current = chatSettings[chatId]?.isMuted || false;
            await toggleChatSetting(chatId, 'isMuted', !current);
        } else if (action === 'delete') {
            Alert.alert("Delete Chat", "Are you sure? This will delete all messages.", [
                { text: "Cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await api.delete(`/user/chat/${chatId}/clear`);
                            fetchChats();
                        } catch (e) {
                            Alert.alert("Error", "Could not delete chat");
                        }
                    }
                }
            ]);
        }
        fetchChatSettings(); // Refresh UI
    };

    const renderChatList = () => {
        if (isLoading && chats.length === 0) {
            return (
                <View style={{ paddingTop: 10 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <ChatRowSkeleton key={i} />)}
                </View>
            );
        }

        const dms = recentChats.filter((c: any) => c.type === 'private' || !c.type);
        const groups = recentChats.filter((c: any) => c.type === 'group');

        const sections = [];
        if (pinnedChats.length > 0) {
            sections.push({ title: 'Pinned', data: pinnedChats });
        }
        if (dms.length > 0) {
            sections.push({ title: 'Users', data: dms });
        }
        if (groups.length > 0) {
            sections.push({ title: 'Groups', data: groups });
        }

        return (
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: 10 }}>
                        <ChatRow
                            chat={item}
                            isSelected={selectedChatId === item.id}
                            isPinned={chatSettings[item.id]?.isPinned}
                            isMuted={chatSettings[item.id]?.isMuted}
                            isArchived={chatSettings[item.id]?.isArchived}
                            onPress={() => onChatPress(item)}
                        />
                    </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    title === 'Pinned' ? (
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pinned</Text>
                    ) : (
                        <View>
                            {pinnedChats.length > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 10 }]}>Recent</Text>
                        </View>
                    )
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                style={{ flex: 1 }}
            />
        );
    };

    const onChatPress = (chat: any) => {
        // closeAllMenus(); // Removed
        if (isLargeScreen) {
            setSelectedChatId(chat.id);
            setSelectedChatUser(chat.otherUser);
        } else {
            navigation.navigate('ChatDetail', { chatId: chat.id, otherUser: chat.otherUser });
        }
    };

    const renderSearchBar = () => (
        <View style={[styles.searchContainer, {
            backgroundColor: colors.background === '#000000' ? Colors.darkSearchBackground : colors.searchBackground
        }]}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
                placeholder="Search"
                style={[styles.searchInput, { color: colors.text, fontFamily: 'System' }]}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                // @ts-ignore
                // onFocus={closeAllMenus}
                onChangeText={setSearchQuery}
            />
        </View>
    );

    // Sidebar Resizing
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const widthRef = useRef(350);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                widthRef.current = sidebarWidth;
            },
            onPanResponderMove: (_, gestureState) => {
                const newWidth = widthRef.current + gestureState.dx;
                if (newWidth > 250 && newWidth < 600) {
                    setSidebarWidth(newWidth);
                }
            },
        })
    ).current;

    const renderContent = () => (
        <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* Sidebar */}
            <View style={[styles.sidebar, {
                width: sidebarWidth,
                backgroundColor: colors.sidebarBackground,
                borderColor: colors.border,
                ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {})
            }]}>
                {/* BACKDROP FOR MENUS */}


                {isLargeScreen && (
                    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.trafficRed }} />
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.trafficYellow }} />
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.trafficGreen }} />
                    </View>
                )}

                <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, zIndex: 1000 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
                                <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setFriendFinderVisible(true)}>
                                <SquarePen size={20} color={colors.blue} />
                            </TouchableOpacity>
                        </View>

                        {/* More on the RIGHT for both Desktop/Mobile consistency based on new request */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <TouchableOpacity>
                                    <MoreVertical size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onSelect={() => setArchivedVisible(true)}>
                                        <Archive size={16} color={colors.text} />
                                        <Text style={[styles.menuText, { color: colors.text }]}>Archived Chats</Text>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setStarredVisible(true)}>
                                        <Star size={16} color={colors.text} />
                                        <Text style={[styles.menuText, { color: colors.text }]}>Starred Messages</Text>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => { /* Mark logic */ }}>
                                        <CheckCheck size={16} color={colors.text} />
                                        <Text style={[styles.menuText, { color: colors.text }]}>Mark all read</Text>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                {user?.username === 'shuklaji' && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onSelect={() => setAdminPanelVisible(true)}>
                                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>A</Text>
                                                </View>
                                                <Text style={[styles.menuText, { color: colors.text, fontWeight: 'bold' }]}>Admin Panel</Text>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </View>

                    {renderSearchBar()}

                    {/* Blocked Users Pill */}
                    {blockedUsers.length > 0 && (
                        <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.background === '#000000' ? '#2C2C2E' : '#F2F2F7',
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}
                                onPress={() => setBlockedVisible(true)}
                            >
                                <Ban size={12} color={Colors.danger} style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                                    {blockedUsers.length} Blocked User{blockedUsers.length !== 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {renderChatList()}

                {/* Drag Handle */}
                <View
                    {...panResponder.panHandlers}
                    style={[
                        {
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            zIndex: 100,
                            backgroundColor: colors.border
                        },
                        Platform.OS === 'web' ? ({ cursor: 'col-resize' } as any) : {}
                    ]}
                />
            </View>

            {/* Separator */}
            <View style={{ width: 1, backgroundColor: colors.border }} />

            {/* Main Content */}
            {isLargeScreen && (
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                    {selectedChatId && selectedChatUser ? (
                        <ChatDetailView
                            chatId={selectedChatId}
                            otherUser={selectedChatUser}
                            isMobile={false}
                        />
                    ) : (
                        <SelectChatPlaceholder />
                    )}
                </View>
            )}
        </View>
    );

    const renderMobileHeader = () => (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border, zIndex: 2000 }]}>
            {/* BACKDROP FOR MENUS (Mobile specific if layout needs) */}


            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setProfileModalVisible(true)} style={{ marginRight: 12 }}>
                    <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: 'System' }]}>Messages</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => setFriendFinderVisible(true)}>
                    <SquarePen size={28} color={colors.blue} />
                </TouchableOpacity>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <TouchableOpacity>
                            <MoreVertical size={24} color={colors.blue} />
                        </TouchableOpacity>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => setArchivedVisible(true)}>
                                <Archive size={16} color={colors.text} />
                                <Text style={[styles.menuText, { color: colors.text }]}>Archived Chats</Text>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setStarredVisible(true)}>
                                <Star size={16} color={colors.text} />
                                <Text style={[styles.menuText, { color: colors.text }]}>Starred Messages</Text>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { /* Mark logic */ }}>
                                <CheckCheck size={16} color={colors.text} />
                                <Text style={[styles.menuText, { color: colors.text }]}>Mark all read</Text>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        {user?.username === 'shuklaji' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onSelect={() => setAdminPanelVisible(true)}>
                                        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>A</Text>
                                        </View>
                                        <Text style={[styles.menuText, { color: colors.text, fontWeight: 'bold' }]}>Admin Panel</Text>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {!isLargeScreen && renderMobileHeader()}

            {isLargeScreen ? renderContent() : (
                <View style={{ flex: 1 }}>
                    {/* BACKDROP FOR MENUS (Container level for mobile scrollview) */}


                    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        {renderSearchBar()}
                    </View>
                    {renderChatList()}
                </View>
            )}

            <ProfileModal
                visible={profileModalVisible}
                user={user}
                onClose={() => setProfileModalVisible(false)}
            />

            <FriendFinderModal
                visible={friendFinderVisible}
                onClose={() => setFriendFinderVisible(false)}
                navigation={navigation}
            />

            <ArchivedChatsModal
                visible={archivedVisible}
                onClose={() => setArchivedVisible(false)}
                navigation={navigation}
            />

            <StarredMessagesModal
                visible={starredVisible}
                onClose={() => setStarredVisible(false)}
                navigation={navigation}
            />

            <AdminPanelModal
                visible={adminPanelVisible}
                onClose={() => setAdminPanelVisible(false)}
            />

            <BlockedUsersModal
                visible={blockedVisible}
                onClose={() => setBlockedVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sidebar: {
        width: 350,
        borderRightWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 60,
        borderBottomWidth: 1,
        // zIndex: 100 
    },
    headerTitle: { fontSize: 30, fontWeight: 'bold', fontFamily: 'System' },
    searchContainer: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 10,
        alignItems: 'center',
        height: 36,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 6,
        // @ts-ignore
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 16,
        marginBottom: 4,
        marginTop: 10,
        opacity: 0.6,
        textTransform: 'uppercase'
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
        marginVertical: 4
    },


});

import {
  ChatMessage,
  ChatSession,
  createChatSession,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  sendMessageToSession,
} from "@/services/aiApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type UIMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  riskLevel?: string;
  emotion?: string;
};

const COLORS = {
  primary: "#16A36A",
  primaryDark: "#087A4C",
  primaryDeep: "#055B3A",
  primarySoft: "#DFF7EB",
  primarySoft2: "#ECFBF4",
  mint: "#B8EFD4",
  white: "#FFFFFF",
  background: "#F2FBF7",
  backgroundAlt: "#E7F7EF",
  card: "rgba(255,255,255,0.96)",
  text: "#12352A",
  textSecondary: "#638176",
  border: "#D4EBE0",
  danger: "#D94A4A",
  dangerSoft: "#FFF0F0",
  warning: "#D68B1F",
  warningSoft: "#FFF7E7",
  overlay: "rgba(4, 54, 36, 0.34)",
};

const welcomeMessage: UIMessage = {
  id: "welcome",
  role: "ai",
  text: "Chào bạn, mình là Soul AI. Hôm nay trong lòng bạn đang có điều gì muốn được lắng nghe?",
};

const suggestedPrompts = [
  "Hôm nay mình thấy hơi mệt",
  "Mình đang bị áp lực học tập",
  "Mình muốn hiểu cảm xúc của mình",
];

function formatSessionDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getRiskLabel(riskLevel?: string) {
  switch (riskLevel) {
    case "emergency":
      return "Cần hỗ trợ khẩn cấp";
    case "high":
      return "Mức cảnh báo cao";
    case "medium":
      return "Cần chú ý";
    default:
      return null;
  }
}

export default function AIChatScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  const listRef = useRef<FlatList<UIMessage>>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(isDesktop);

  const sidebarVisible = isDesktop || historyOpen;

  const chatWidth = useMemo(() => {
    if (isDesktop) return Math.min(width - 390, 1120);
    if (isTablet) return Math.min(width - 48, 900);
    return width;
  }, [isDesktop, isTablet, width]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setHistoryOpen(true);
    }
  }, [isDesktop]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 120);

    return () => clearTimeout(timeout);
  }, [messages, loading]);

  const convertMessage = (msg: ChatMessage): UIMessage => ({
    id: msg._id,
    role: msg.role === "assistant" ? "ai" : "user",
    text: msg.content,
    riskLevel: msg.riskLevel,
    emotion: msg.emotion,
  });

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await getChatSessions();
      setSessions(data);

      if (data.length > 0) {
        await openSession(data[0]);
      }
    } catch (error) {
      console.log("Load sessions error:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const openSession = async (session: ChatSession) => {
    try {
      setCurrentSession(session);
      const data = await getChatMessages(session._id);
      setMessages(data.length > 0 ? data.map(convertMessage) : [welcomeMessage]);

      if (!isDesktop) {
        setHistoryOpen(false);
      }
    } catch (error) {
      console.log("Open session error:", error);
      Alert.alert("Lỗi", "Không thể mở cuộc trò chuyện này.");
    }
  };

  const handleNewChat = async () => {
    try {
      const session = await createChatSession();
      setSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
      setMessages([welcomeMessage]);
      setInput("");

      if (!isDesktop) {
        setHistoryOpen(false);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện mới.");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert("Xóa cuộc trò chuyện", "Bạn có chắc muốn xóa cuộc trò chuyện này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteChatSession(sessionId);
            const newSessions = sessions.filter((item) => item._id !== sessionId);
            setSessions(newSessions);

            if (currentSession?._id === sessionId) {
              if (newSessions.length > 0) {
                await openSession(newSessions[0]);
              } else {
                setCurrentSession(null);
                setMessages([welcomeMessage]);
              }
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện.");
          }
        },
      },
    ]);
  };

  const handleSend = async (customText?: string) => {
    const value = String(customText ?? input).trim();
    if (!value || loading) return;

    let session = currentSession;

    try {
      if (!session) {
        session = await createChatSession();
        setCurrentSession(session);
        setSessions((prev) => [session!, ...prev]);
      }

      const userMessage: UIMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        text: value,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      const result = await sendMessageToSession(session._id, value);

      const aiMessage: UIMessage = {
        id: result.assistantMessage._id,
        role: "ai",
        text: result.assistantMessage.content,
        riskLevel: result.assistantMessage.riskLevel,
        emotion: result.assistantMessage.emotion,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentSession(result.session);
      setSessions((prev) => {
        const remaining = prev.filter((item) => item._id !== result.session._id);
        return [result.session, ...remaining];
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "ai",
          text: "Mình chưa thể kết nối với máy chủ lúc này. Bạn kiểm tra lại kết nối, token đăng nhập hoặc địa chỉ API nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryPanel = () => (
    <View
      style={[
        styles.sidebar,
        !isDesktop && styles.sidebarMobile,
        isDesktop && styles.sidebarDesktop,
      ]}
    >
      <View style={styles.brandRow}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.brandIcon}
        >
          <MaterialCommunityIcons name="heart-pulse" size={25} color={COLORS.white} />
        </LinearGradient>

        <View style={styles.brandTextWrap}>
          <Text style={styles.brandTitle}>SOUL AI</Text>
          <Text style={styles.brandSubtitle}>Người bạn đồng hành cảm xúc</Text>
        </View>

        {!isDesktop && (
          <TouchableOpacity
            style={styles.sidebarCloseButton}
            onPress={() => setHistoryOpen(false)}
          >
            <MaterialCommunityIcons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <MaterialCommunityIcons name="plus" size={21} color={COLORS.white} />
        <Text style={styles.newChatText}>Cuộc trò chuyện mới</Text>
      </TouchableOpacity>

      <View style={styles.historyTitleRow}>
        <Text style={styles.historyTitle}>Gần đây</Text>
        <Text style={styles.historyCount}>{sessions.length}</Text>
      </View>

      {loadingSessions ? (
        <View style={styles.sidebarLoading}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.sidebarLoadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyHistory}>
          <MaterialCommunityIcons
            name="message-text-outline"
            size={32}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyHistoryText}>Chưa có cuộc trò chuyện nào</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sessionList}
        >
          {sessions.map((item) => {
            const active = currentSession?._id === item._id;

            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.85}
                style={[styles.sessionItem, active && styles.sessionItemActive]}
                onPress={() => openSession(item)}
              >
                <View style={[styles.sessionIcon, active && styles.sessionIconActive]}>
                  <MaterialCommunityIcons
                    name="message-processing-outline"
                    size={18}
                    color={active ? COLORS.white : COLORS.primaryDark}
                  />
                </View>

                <View style={styles.sessionContent}>
                  <View style={styles.sessionTitleRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.sessionTitle, active && styles.sessionTitleActive]}
                    >
                      {item.title || "Cuộc trò chuyện mới"}
                    </Text>
                    <Text style={[styles.sessionDate, active && styles.sessionDateActive]}>
                      {formatSessionDate((item as any).updatedAt)}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.sessionLastMessage,
                      active && styles.sessionLastMessageActive,
                    ]}
                  >
                    {item.lastMessage || "Chưa có tin nhắn"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    handleDeleteSession(item._id);
                  }}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={17}
                    color={active ? "#D7F8E8" : "#86A99B"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.privacyCard}>
        <View style={styles.privacyIcon}>
          <MaterialCommunityIcons name="shield-lock-outline" size={19} color={COLORS.primaryDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>Không gian riêng tư</Text>
          <Text style={styles.privacyText}>Nội dung của bạn được bảo vệ trong SOUL.</Text>
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: UIMessage }) => {
    const isUser = item.role === "user";
    const riskLabel = getRiskLabel(item.riskLevel);

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.avatar}
          >
            <MaterialCommunityIcons name="heart-pulse" size={19} color={COLORS.white} />
          </LinearGradient>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {!isUser && <Text style={styles.messageSender}>SOUL AI</Text>}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.text}
          </Text>

          {!isUser && riskLabel && (
            <View
              style={[
                styles.riskBadge,
                item.riskLevel === "emergency" && styles.riskBadgeEmergency,
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={14}
                color={item.riskLevel === "emergency" ? COLORS.danger : COLORS.warning}
              />
              <Text
                style={[
                  styles.riskText,
                  item.riskLevel === "emergency" && styles.riskTextEmergency,
                ]}
              >
                {riskLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const showSuggestions = messages.length === 1 && messages[0].id === "welcome";

  return (
    <LinearGradient
      colors={["#E8F8F0", "#F6FCF9", "#EAF7F1"]}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E8F8F0" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appShell}>
          {sidebarVisible && renderHistoryPanel()}

          {!isDesktop && historyOpen && (
            <Pressable style={styles.overlay} onPress={() => setHistoryOpen(false)} />
          )}

          <KeyboardAvoidingView
            style={styles.mainArea}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            <View style={[styles.chatContainer, { width: chatWidth }]}> 
              <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                  <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => router.back()}
                  >
                    <MaterialCommunityIcons
                      name="arrow-left"
                      size={23}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>

                  {!isDesktop && (
                    <TouchableOpacity
                      style={styles.headerIconButton}
                      onPress={() => setHistoryOpen(true)}
                    >
                      <MaterialCommunityIcons
                        name="menu"
                        size={24}
                        color={COLORS.text}
                      />
                    </TouchableOpacity>
                  )}

                  <View style={styles.headerIdentity}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.headerAvatar}
                    >
                      <MaterialCommunityIcons
                        name="robot-happy-outline"
                        size={25}
                        color={COLORS.white}
                      />
                    </LinearGradient>

                    <View>
                      <View style={styles.headerNameRow}>
                        <Text style={styles.headerTitle}>Soul AI</Text>
                        <View style={styles.verifiedDot}>
                          <MaterialCommunityIcons
                            name="check"
                            size={10}
                            color={COLORS.white}
                          />
                        </View>
                      </View>
                      <View style={styles.onlineRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Sẵn sàng lắng nghe bạn</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.headerIconButton} onPress={handleNewChat}>
                  <MaterialCommunityIcons
                    name="message-plus-outline"
                    size={23}
                    color={COLORS.primaryDark}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.chatBody}>
                <FlatList
                  ref={listRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMessage}
                  contentContainerStyle={styles.chatContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListHeaderComponent={
                    <View style={styles.welcomeHeader}>
                      <LinearGradient
                        colors={["#DDF7EA", "#F1FCF7"]}
                        style={styles.welcomeIconWrap}
                      >
                        <MaterialCommunityIcons
                          name="sprout"
                          size={29}
                          color={COLORS.primaryDark}
                        />
                      </LinearGradient>
                      <Text style={styles.welcomeTitle}>Một nơi để bạn được lắng nghe</Text>
                      <Text style={styles.welcomeDescription}>
                        Bạn có thể chia sẻ điều đang làm mình vui, buồn, lo lắng hoặc mệt mỏi.
                      </Text>
                    </View>
                  }
                  ListFooterComponent={
                    loading ? (
                      <View style={styles.messageRow}>
                        <LinearGradient
                          colors={[COLORS.primary, COLORS.primaryDark]}
                          style={styles.avatar}
                        >
                          <MaterialCommunityIcons
                            name="heart-pulse"
                            size={19}
                            color={COLORS.white}
                          />
                        </LinearGradient>

                        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                          <View style={styles.typingRow}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.typingText}>Soul AI đang lắng nghe...</Text>
                          </View>
                        </View>
                      </View>
                    ) : null
                  }
                />

                {showSuggestions && (
                  <View style={styles.suggestionSection}>
                    <Text style={styles.suggestionTitle}>Bạn có thể bắt đầu bằng</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.suggestionList}
                    >
                      {suggestedPrompts.map((prompt) => (
                        <TouchableOpacity
                          key={prompt}
                          style={styles.suggestionChip}
                          onPress={() => handleSend(prompt)}
                        >
                          <MaterialCommunityIcons
                            name="leaf"
                            size={15}
                            color={COLORS.primaryDark}
                          />
                          <Text style={styles.suggestionText}>{prompt}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.composerWrap}>
                <View style={styles.composer}>
                  <TouchableOpacity
                    style={styles.composerIconButton}
                    onPress={handleNewChat}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={22}
                      color={COLORS.primaryDark}
                    />
                  </TouchableOpacity>

                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Chia sẻ điều bạn đang nghĩ..."
                    placeholderTextColor="#8EAAA0"
                    style={styles.input}
                    multiline
                    maxLength={2000}
                    returnKeyType="send"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      if (!input.includes("\n")) {
                        handleSend();
                      }
                    }}
                  />

                  <TouchableOpacity style={styles.composerIconButton}>
                    <MaterialCommunityIcons
                      name="microphone-outline"
                      size={21}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.sendButton,
                      (!input.trim() || loading) && styles.sendButtonDisabled,
                    ]}
                    onPress={() => handleSend()}
                    disabled={!input.trim() || loading}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.sendButtonGradient}
                    >
                      <MaterialCommunityIcons
                        name="send"
                        size={19}
                        color={COLORS.white}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <Text style={styles.disclaimer}>
                  Soul AI không thay thế chuyên gia tâm lý hoặc hỗ trợ y tế khẩn cấp.
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
    flexDirection: "row",
  },
  mainArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatContainer: {
    flex: 1,
    maxWidth: 1120,
    backgroundColor: COLORS.card,
    overflow: "hidden",
    borderColor: "rgba(22,163,106,0.10)",
    borderWidth: Platform.OS === "web" ? 1 : 0,
    shadowColor: "#0A6945",
    shadowOpacity: Platform.OS === "web" ? 0.12 : 0,
    shadowRadius: 26,
    elevation: 8,
  },
  topBar: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft2,
    marginRight: 8,
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  verifiedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#38C982",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  chatBody: {
    flex: 1,
    backgroundColor: "#F8FCFA",
  },
  chatContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 26,
    paddingHorizontal: 18,
  },
  welcomeIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  welcomeTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  welcomeDescription: {
    maxWidth: 500,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
    paddingRight: 46,
  },
  messageRowUser: {
    justifyContent: "flex-end",
    paddingRight: 0,
    paddingLeft: 46,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: "500",
  },
  userMessageText: {
    color: COLORS.white,
  },
  riskBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.warningSoft,
  },
  riskBadgeEmergency: {
    backgroundColor: COLORS.dangerSoft,
  },
  riskText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.warning,
  },
  riskTextEmergency: {
    color: COLORS.danger,
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    marginLeft: 9,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  suggestionSection: {
    backgroundColor: "#F8FCFA",
    paddingBottom: 12,
  },
  suggestionTitle: {
    marginLeft: 18,
    marginBottom: 9,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  suggestionList: {
    paddingHorizontal: 18,
    gap: 9,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    marginLeft: 6,
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.primaryDeep,
  },
  composerWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  composerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 7,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 14.5,
    lineHeight: 20,
    color: COLORS.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    overflow: "hidden",
    marginLeft: 4,
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.38,
  },
  disclaimer: {
    textAlign: "center",
    marginTop: 7,
    fontSize: 10.5,
    color: "#8CA59C",
  },
  sidebar: {
    width: 330,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    zIndex: 50,
  },
  sidebarDesktop: {
    position: "relative",
  },
  sidebarMobile: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 310,
    zIndex: 100,
    shadowColor: "#063D29",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 18,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 90,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandTextWrap: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  sidebarCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft2,
  },
  newChatButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  newChatText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  historyCount: {
    marginLeft: 7,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 22,
    backgroundColor: COLORS.primarySoft,
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },
  sidebarLoading: {
    alignItems: "center",
    paddingVertical: 28,
  },
  sidebarLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
  },
  emptyHistoryText: {
    marginTop: 9,
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  sessionList: {
    paddingBottom: 10,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sessionItemActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  sessionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    marginRight: 9,
  },
  sessionIconActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  sessionTitleActive: {
    color: COLORS.white,
  },
  sessionDate: {
    marginLeft: 5,
    fontSize: 9.5,
    color: "#9AB2A9",
  },
  sessionDateActive: {
    color: "#BFE9D6",
  },
  sessionLastMessage: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sessionLastMessageActive: {
    color: "#D1F3E3",
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  privacyCard: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    marginRight: 9,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  privacyText: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },
});
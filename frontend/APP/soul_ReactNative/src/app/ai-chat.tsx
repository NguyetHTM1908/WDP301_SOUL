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
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const welcomeMessage: UIMessage = {
  id: "welcome",
  role: "ai",
  text: "Hi, mình là SOUL AI. Hôm nay bạn cảm thấy thế nào?",
};

export default function AIChatScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([welcomeMessage]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(isWide);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    setSidebarOpen(isWide);
  }, [isWide]);

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

      if (data.length === 0) {
        setMessages([welcomeMessage]);
      } else {
        setMessages(data.map(convertMessage));
      }

      if (!isWide) setSidebarOpen(false);
    } catch (error) {
      console.log("Open session error:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      const session = await createChatSession();

      setSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
      setMessages([welcomeMessage]);

      if (!isWide) setSidebarOpen(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo đoạn chat mới.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert("Xóa đoạn chat", "Bạn có chắc muốn xóa đoạn chat này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
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
            Alert.alert("Lỗi", "Không thể xóa đoạn chat.");
          }
        },
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    let session = currentSession;

    try {
      if (!session) {
        session = await createChatSession();
        setCurrentSession(session);
        setSessions((prev) => [session!, ...prev]);
      }

      const userMessage: UIMessage = {
        id: Date.now().toString(),
        role: "user",
        text: userText,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      const result = await sendMessageToSession(session._id, userText);

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
        const filtered = prev.filter((item) => item._id !== result.session._id);
        return [result.session, ...filtered];
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "ai",
          text: "Mình chưa kết nối được với AI server. Bạn kiểm tra lại backend, token đăng nhập hoặc API URL nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSidebar = () => (
    <View style={[styles.sidebar, !isWide && styles.sidebarMobile]}>
      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Lịch sử trò chuyện</Text>

      {loadingSessions ? (
        <ActivityIndicator color="#009688" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {sessions.map((item) => {
            const active = currentSession?._id === item._id;

            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.sessionItem, active && styles.sessionItemActive]}
                onPress={() => openSession(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.sessionTitle, active && styles.sessionTitleActive]}
                  >
                    {item.title || "New Chat"}
                  </Text>

                  <Text numberOfLines={1} style={styles.sessionLastMessage}>
                    {item.lastMessage || "Chưa có tin nhắn"}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleDeleteSession(item._id)}>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={18}
                    color={active ? "#fff" : "#789"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {sidebarOpen && renderSidebar()}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#123" />
          </TouchableOpacity>

          {!isWide && (
            <TouchableOpacity onPress={() => setSidebarOpen((prev) => !prev)}>
              <MaterialCommunityIcons name="history" size={26} color="#123" />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>SOUL AI</Text>
            <Text style={styles.subtitle}>
              {currentSession?.title || "AI Companion"}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNewChat}>
            <MaterialCommunityIcons name="plus-circle-outline" size={28} color="#009688" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" && styles.userText,
                ]}
              >
                {item.text}
              </Text>

              {item.role === "ai" && item.riskLevel && item.riskLevel !== "low" && (
                <Text style={styles.riskText}>
                  Risk: {item.riskLevel} · Emotion: {item.emotion}
                </Text>
              )}
            </View>
          )}
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#009688" />
            <Text style={styles.loadingText}>SOUL AI đang trả lời...</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#8A9A9A"
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F7FBFA",
  },

  sidebar: {
    width: 310,
    backgroundColor: "#E9FAF4",
    borderRightWidth: 1,
    borderRightColor: "#D3EFE6",
    paddingTop: 54,
    paddingHorizontal: 14,
  },

  sidebarMobile: {
    position: "absolute",
    zIndex: 20,
    left: 0,
    top: 0,
    bottom: 0,
    width: 310,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },

  newChatButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: "#009688",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },

  newChatText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#567",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
  },

  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },

  sessionItemActive: {
    backgroundColor: "#009688",
  },

  sessionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#123",
  },

  sessionTitleActive: {
    color: "#fff",
  },

  sessionLastMessage: {
    fontSize: 12,
    color: "#789",
    marginTop: 4,
  },

  container: {
    flex: 1,
    backgroundColor: "#F7FBFA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    backgroundColor: "#D8F8EC",
    borderBottomWidth: 1,
    borderBottomColor: "#C7EEE4",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#123",
  },

  subtitle: {
    fontSize: 14,
    color: "#009688",
    marginTop: 2,
  },

  chatContent: {
    padding: 18,
    gap: 12,
  },

  messageBubble: {
    maxWidth: "82%",
    padding: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#009688",
    borderTopRightRadius: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1F2D2D",
  },

  userText: {
    color: "#fff",
  },

  riskText: {
    marginTop: 8,
    fontSize: 11,
    color: "#D97706",
    fontWeight: "700",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },

  loadingText: {
    color: "#009688",
    fontSize: 13,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E7EEEE",
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: "#F1F5F4",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#123",
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#009688",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
});
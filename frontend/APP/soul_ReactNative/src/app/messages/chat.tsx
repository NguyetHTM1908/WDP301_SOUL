import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store";
import { getMessages, sendMessage, markAsRead } from "@/api/messageApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { messageStyles as s } from "@/styles/message.styles";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function formatMessageTime(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diff = today.getTime() - msgDate.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function shouldShowDateSeparator(
  messages: any[],
  index: number
): string | null {
  const msg = messages[index];
  if (!msg?.createdAt) return null;
  const msgDate = new Date(msg.createdAt).toDateString();

  if (index === 0) return formatDateSeparator(msg.createdAt);

  const prevDate = new Date(messages[index - 1]?.createdAt).toDateString();
  if (msgDate !== prevDate) return formatDateSeparator(msg.createdAt);

  return null;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { userId, userName, userAvatar } = useLocalSearchParams<{
    userId: string;
    userName: string;
    userAvatar: string;
  }>();

  const token = useAuthStore((state: any) => state.token);
  const currentUser = useAuthStore((state: any) => state.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestMsgCountRef = useRef(0);

  const loadMessages = useCallback(
    async (showLoading = false) => {
      if (!token || !userId) return;
      try {
        if (showLoading) setLoading(true);
        const res = await getMessages(token, userId);
        if (res?.success) {
          const newMessages = res.data || [];
          setMessages(newMessages);
          if (res.conversationId) {
            setConversationId(res.conversationId);
          }

          // Auto-scroll khi có tin nhắn mới
          if (newMessages.length > latestMsgCountRef.current) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
          latestMsgCountRef.current = newMessages.length;

          // Mark as read
          if (res.conversationId) {
            try {
              await markAsRead(token, res.conversationId);
            } catch (e) {
              // silent
            }
          }
        }
      } catch (err) {
        console.warn("Error loading messages:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [token, userId]
  );

  // Initial load
  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  // Polling mỗi 2 giây
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      loadMessages(false);
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !token || !userId || sending) return;

    setSending(true);
    setInputText("");

    try {
      const res = await sendMessage(token, userId, text);
      if (res?.success) {
        // Thêm tin nhắn mới vào cuối
        setMessages((prev) => [...prev, res.data]);
        latestMsgCountRef.current += 1;
        if (res.conversationId) {
          setConversationId(res.conversationId);
        }

        // Scroll xuống cuối
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err: any) {
      console.warn("Error sending message:", err);
      // Khôi phục input nếu lỗi
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const isMe =
      item.senderId === currentUserId ||
      item.senderId?._id === currentUserId;

    const dateSep = shouldShowDateSeparator(messages, index);

    return (
      <View>
        {dateSep && (
          <View style={s.dateSeparator}>
            <Text style={s.dateSeparatorText}>{dateSep}</Text>
          </View>
        )}

        <View
          style={[s.messageRow, isMe ? s.messageRowMe : s.messageRowOther]}
        >
          <View
            style={[
              s.messageBubble,
              isMe ? s.messageBubbleMe : s.messageBubbleOther,
            ]}
          >
            <Text
              style={[
                s.messageText,
                isMe ? s.messageTextMe : s.messageTextOther,
              ]}
            >
              {item.content}
            </Text>
            <Text
              style={[
                s.messageTime,
                isMe ? s.messageTimeMe : s.messageTimeOther,
              ]}
            >
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#006B5C" />
        <Text style={{ marginTop: 12, color: "#6B7C93" }}>
          Đang tải tin nhắn...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={s.chatHeader}>
        <TouchableOpacity
          style={s.chatHeaderBackButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#006B5C"
          />
        </TouchableOpacity>

        {/* Avatar */}
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={s.chatHeaderAvatar} />
        ) : (
          <View style={s.chatHeaderAvatarFallback}>
            <Text style={s.chatHeaderAvatarFallbackText}>
              {getInitials(userName || "")}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={s.chatHeaderInfo}
          onPress={() => router.push(`/profile/${userId}` as any)}
          activeOpacity={0.7}
        >
          <Text style={s.chatHeaderName} numberOfLines={1}>
            {userName || "Người dùng SOUL"}
          </Text>
          <Text style={s.chatHeaderStatus}>Đang hoạt động</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.chatHeaderProfileButton}
          onPress={() => router.push(`/profile/${userId}` as any)}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={22}
            color="#006B5C"
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || `msg-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={s.messagesContainer}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons
              name="hand-wave-outline"
              size={64}
              color="#CBD5E1"
            />
            <Text style={s.emptyText}>Hãy gửi lời chào đầu tiên! 👋</Text>
            <Text style={s.emptySubText}>
              Bắt đầu cuộc trò chuyện với {userName || "người dùng này"}
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={s.inputWrapper}>
          <TextInput
            style={s.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={5000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>

        <TouchableOpacity
          style={[
            s.sendButton,
            (!inputText.trim() || sending) && s.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

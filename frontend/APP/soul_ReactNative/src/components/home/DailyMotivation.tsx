import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTodayQuote } from "@/data/motivationQuotes";

export function DailyMotivation() {
  const quote = getTodayQuote();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const today = new Date();
  const dayOfMonth = today.getDate();
  const dateLabel = today.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <MaterialCommunityIcons name="weather-sunny" size={14} color="#0D9488" />
          <Text style={styles.titleBadgeText}>Hôm nay • Ngày {dayOfMonth}</Text>
        </View>
      </View>

      <View style={[styles.card, { borderLeftColor: quote.accent }]}>
        <View style={styles.imageWrapper}>
          {imageLoading && !imageError && (
            <View style={[styles.imagePlaceholder, { backgroundColor: `${quote.accent}18` }]}>
              <View style={[styles.placeholderIcon, { backgroundColor: `${quote.accent}22` }]}>
                <ActivityIndicator color={quote.accent} size="small" />
              </View>
              <Text style={[styles.placeholderText, { color: quote.accent }]}>
                Đang chuẩn bị một chút dịu dàng...
              </Text>
            </View>
          )}

          {imageError ? (
            <View style={[styles.imagePlaceholder, { backgroundColor: `${quote.accent}18` }]}>
              <MaterialCommunityIcons name="image-off-outline" size={34} color={quote.accent} />
              <Text style={[styles.placeholderText, { color: quote.accent }]}>
                Hôm nay vẫn có điều tốt đẹp ở đây.
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: quote.imageUrl }}
              style={[styles.image, imageLoading && styles.hiddenImage]}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              resizeMode="cover"
            />
          )}

          {!imageError && !imageLoading && <View style={styles.imageOverlay} />}

          {!imageLoading && (
            <View style={[styles.themeChip, { backgroundColor: quote.accent }]}>
              <Text style={styles.themeChipText}>{quote.theme}</Text>
            </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: `${quote.accent}08` }]}>
          <MaterialCommunityIcons
            name="format-quote-open"
            size={28}
            color={quote.accent}
            style={styles.quoteIcon}
          />

          <Text style={styles.quoteText}>{quote.quote}</Text>
          <Text style={[styles.authorText, { color: quote.accent }]}>— {quote.author}</Text>

          <View style={[styles.divider, { backgroundColor: `${quote.accent}30` }]} />

          <View style={styles.promptBox}>
            <MaterialCommunityIcons name="star-four-points-outline" size={15} color={quote.accent} />
            <Text style={styles.promptText}>{quote.prompt}</Text>
          </View>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-outline" size={14} color="#94A3B8" />
            <Text style={styles.dateText}>{dateLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D9488",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  imageWrapper: {
    height: 160,
    backgroundColor: "#E2F2ED",
    position: "relative",
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  placeholderIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hiddenImage: {
    opacity: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  themeChip: {
    position: "absolute",
    bottom: 10,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  themeChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  content: {
    padding: 18,
  },
  quoteIcon: {
    marginBottom: 4,
    opacity: 0.7,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "700",
    color: "#1E293B",
    fontStyle: "italic",
    marginBottom: 12,
  },
  authorText: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  promptBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  promptText: {
    flex: 1,
    color: "#40586A",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

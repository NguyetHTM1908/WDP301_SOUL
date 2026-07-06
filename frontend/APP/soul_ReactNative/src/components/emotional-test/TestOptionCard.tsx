import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";

type Props = {
  icon: string;
  title: string;
  description: string;
  duration: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
};

export default function TestOptionCard({
  icon,
  title,
  description,
  duration,
  onPress,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.disabledCard]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.duration}>⏱ {duration}</Text>
        <View style={[styles.startButton, disabled && styles.disabledButton]}>
          <Text style={styles.startText}>{disabled ? "Soon" : "Start"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 86,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2FBF71",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.65,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EFFFF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D1B38",
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    color: "#4E6B5A",
    lineHeight: 15,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 58,
  },
  duration: {
    fontSize: 11,
    color: "#4E8C63",
  },
  startButton: {
    backgroundColor: "#2FBF71",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  disabledButton: {
    backgroundColor: "#B6DCC4",
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
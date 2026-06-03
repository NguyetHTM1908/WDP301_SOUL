import { Platform } from "react-native";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    android: "http://192.168.110.50:5000/api",
    ios: "http://192.168.110.50:5000/api",
    default: "http://192.168.110.50:5000/api",
  });

console.log("API_BASE_URL =", API_BASE_URL);
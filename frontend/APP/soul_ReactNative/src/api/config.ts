import { Platform } from "react-native";
// chạy 
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    android: "http://10.0.2.2:5000/api", // Android emulator
    ios: "http://localhost:5000/api",    // iOS simulator
    default: "http://localhost:5000/api", // web
  });
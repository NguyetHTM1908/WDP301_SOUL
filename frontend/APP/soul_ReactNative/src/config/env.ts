import { Platform } from "react-native";

// Địa chỉ IP base API động tùy theo nền tảng thiết bị giả lập (Android Emulator dùng 10.0.2.2)
export const API_BASE_URL = Platform.select({
  android: "http://192.168.2.43:5000/api",
  ios: "http://localhost:5000/api",
  default: "http://localhost:5000/api",
});

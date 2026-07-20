import { Platform } from "react-native";

// IP máy tính hiện tại trong mạng LAN (đang chạy backend)
const LOCAL_IP = "192.168.110.101";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    android: `http://${LOCAL_IP}:5000/api`, // Android emulator hoặc thiết bị thật
    ios: `http://${LOCAL_IP}:5000/api`,     // iOS simulator / device
    default: `http://localhost:5000/api`,  // Web
  });

console.log("API_BASE_URL =", API_BASE_URL);
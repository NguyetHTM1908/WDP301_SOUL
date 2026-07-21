// import { Platform } from "react-native";

// export const API_BASE_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   Platform.select({
//     //android: "http://10.12.64.253:5000/api",
//     android: "http://192.168.2.43:5000/api",
//     ios: "http://localhost:5000/api",
//     web: "http://localhost:5000/api",
//     default: "http://localhost:5000/api",
//   });

// console.log("API_BASE_URL =", API_BASE_URL);

import { Platform } from "react-native";

export const API_BASE_URL =
  Platform.select({
    android: "http://192.168.2.43:5000/api",
    ios: "http://localhost:5000/api",
    web: "http://localhost:5000/api",
    default: "http://localhost:5000/api",
  }) ?? "http://localhost:5000/api";

console.log("API_BASE_URL =", API_BASE_URL);
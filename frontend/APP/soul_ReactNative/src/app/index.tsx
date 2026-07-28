import { useEffect } from "react";
import { router } from "expo-router";
import SplashScreen from "./splash";
import { useAuthStore } from "@/store";

export default function IndexGateway() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUser = useAuthStore.getState().user;
      const isLoggedIn = useAuthStore.getState().isLoggedIn;

      if (isLoggedIn || currentUser) {
        if (currentUser?.role === "admin" || currentUser?.role === "administrator") {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        router.replace("/onboarding");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
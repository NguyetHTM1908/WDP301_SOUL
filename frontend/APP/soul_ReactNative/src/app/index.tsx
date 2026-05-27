import { useEffect } from "react";
import { router } from "expo-router";
import SplashScreen from "./splash";

export default function IndexGateway() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2500); // 2.5 seconds of beautiful splash loading

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
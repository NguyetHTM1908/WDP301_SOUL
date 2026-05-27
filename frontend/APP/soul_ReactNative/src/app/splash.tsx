import { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Animated } from "react-native";
import { onboardingStyles as styles } from "@/styles/onboarding.styles";

export default function SplashScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.Image
        source={require("../../assets/images/logo.png")}
        style={[styles.splashLogo, { transform: [{ scale: pulseAnim }] }]}
      />
      <Text style={styles.logoText}>SOUL</Text>
      
      {/* Loading spinner */}
      <ActivityIndicator size="large" color="#0F766E" style={styles.spinner} />
    </View>
  );
}

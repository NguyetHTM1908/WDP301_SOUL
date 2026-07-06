import { useState } from "react";
import { ScrollView, View } from "react-native";
import { styles } from "@/styles/home.styles";

import { HomeHeader } from "@/components/home/HomeHeader";
import { HeroCard } from "@/components/home/HeroCard";
import { DailyMotivation } from "@/components/home/DailyMotivation";
import { QuickActions } from "@/components/home/QuickActions";
import { MoodAnalytics } from "@/components/home/MoodAnalytics";
import { WeeklyInsight } from "@/components/home/WeeklyInsight";
import { CommunityPreview } from "@/components/home/CommunityPreview";
import { EventCard } from "@/components/home/EventCard";
import { BottomNav } from "@/components/home/BottomNav";
import { Sidebar } from "@/components/home/Sidebar";

export default function HomeScreen() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <View style={styles.page}>
      {showSidebar ? (
        <Sidebar onClose={() => setShowSidebar(false)} />
      ) : null}

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <HomeHeader
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar((prev) => !prev)}
        />

        <HeroCard />
        <DailyMotivation />
        <QuickActions />

        <View style={styles.row}>
          <MoodAnalytics />
          <WeeklyInsight />
        </View>

        <View style={styles.row}>
          <CommunityPreview />
          <EventCard />
        </View>

        <BottomNav />
      </ScrollView>
    </View>
  );
}
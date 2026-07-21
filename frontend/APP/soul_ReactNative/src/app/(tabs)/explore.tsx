import { useState } from "react";
import { ScrollView, View } from "react-native";
import { styles } from "@/styles/home.styles";

import { HomeHeader } from "@/components/home/HomeHeader";
import { Sidebar } from "@/components/home/Sidebar";
import { HeroCard } from "@/components/home/HeroCard";
import { QuickActions } from "@/components/home/QuickActions";
import { MoodAnalytics } from "@/components/home/MoodAnalytics";
import { WeeklyInsight } from "@/components/home/WeeklyInsight";
import { CommunityPreview } from "@/components/home/CommunityPreview";
import { EventCard } from "@/components/home/EventCard";
import { BottomNav } from "@/components/home/BottomNav";

export default function ExploreScreen() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <View style={styles.page}>
      {showSidebar && <Sidebar />}

      {/* 1. Header cố định ở trên */}
      <View style={{ paddingHorizontal: 18, paddingTop: 36, paddingBottom: 6, backgroundColor: "#F2FFFB", zIndex: 99 }}>
        <HomeHeader
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          showProfileMenu={false}
          onToggleProfileMenu={() => {}}
          onCloseProfileMenu={() => {}}
        />
      </View>

      {/* 2. Nội dung cuộn ở giữa */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 18 }}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard />
        <QuickActions />

        <View style={styles.row}>
          <MoodAnalytics />
          <WeeklyInsight />
        </View>

        <View style={styles.row}>
          <CommunityPreview />
          <EventCard />
        </View>
      </ScrollView>

      {/* 3. Bottom Navigation cố định ở dưới */}
      <View style={{ paddingHorizontal: 18, paddingBottom: 10, backgroundColor: "#F2FFFB" }}>
        <BottomNav />
      </View>
    </View>
  );
}

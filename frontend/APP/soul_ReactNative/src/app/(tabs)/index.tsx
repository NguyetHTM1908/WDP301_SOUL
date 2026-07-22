import { useState } from "react";
import { ScrollView, View } from "react-native";
import { styles } from "@/styles/home.styles";

import { HomeHeader, ProfileDropdown } from "@/components/home/HomeHeader";
import { DailyMotivation } from "@/components/home/DailyMotivation";
import { QuickActions } from "@/components/home/QuickActions";
import { MoodAnalytics } from "@/components/home/MoodAnalytics";
import { WeeklyInsight } from "@/components/home/WeeklyInsight";
import { CommunityPreview } from "@/components/home/CommunityPreview";
import { EventCard } from "@/components/home/EventCard";
import { BottomNav } from "@/components/home/BottomNav";
import { Sidebar } from "@/components/home/Sidebar";
import { ProfileModals } from "@/components/home/ProfileModals";
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { DiaryPromptCard } from "@/components/home/DiaryPromptCard";

export default function HomeScreen() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // States cho ProfileModals — render ở root để tránh bị clip bởi ScrollView
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <NotificationProvider>
      <View style={styles.page}>
        {showSidebar ? (
          <Sidebar onClose={() => setShowSidebar(false)} />
        ) : null}

        {/* 1. Header cố định ở trên */}
        <View style={{ paddingHorizontal: 18, paddingTop: 36, paddingBottom: 6, backgroundColor: "#F2FFFB", zIndex: 99 }}>
          <HomeHeader
            showSidebar={showSidebar}
            onToggleSidebar={() => setShowSidebar((prev) => !prev)}
            showProfileMenu={showProfileMenu}
            onToggleProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
            onCloseProfileMenu={() => setShowProfileMenu(false)}
          />
        </View>

        {/* 2. Nội dung cuộn ở giữa */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 18 }}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          <DailyMotivation />
          <DiaryPromptCard />
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



        {/* Dropdown profile render ở tầng root — không bị ScrollView hay header clip */}
        {showProfileMenu && (
          <ProfileDropdown
            onClose={() => setShowProfileMenu(false)}
            onEditProfile={() => {
              setShowProfileMenu(false);
              setShowEditProfile(true);
            }}
          />
        )}

        {/* ProfileModals render ở root — không bị clip, truy cập được từ dropdown */}
        <ProfileModals
          showMyProfile={showMyProfile}
          onCloseMyProfile={() => setShowMyProfile(false)}
          showEditProfile={showEditProfile}
          onCloseEditProfile={() => setShowEditProfile(false)}
          onOpenEditProfile={() => setShowEditProfile(true)}
        />
      </View>
    </NotificationProvider>
  );
}
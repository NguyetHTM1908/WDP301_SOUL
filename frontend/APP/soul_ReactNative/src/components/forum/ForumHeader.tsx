import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  filters: string[];
  onCreatePress: () => void;
  onReportsPress?: () => void;
  onBackPress?: () => void;
};

export function ForumHeader({
  search,
  setSearch,
  filter,
  setFilter,
  filters,
  onCreatePress,
  onReportsPress,
  onBackPress,
}: Props) {
  return (
    <View style={s.header}>
      {onBackPress ? (
        <Pressable style={s.backButton} onPress={onBackPress}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#064D3D"
          />
        </Pressable>
      ) : null}

      <View style={s.headerTop}>
        <View style={s.headerTitleWrap}>
          <Text style={s.title}>Healing Forum</Text>
          <Text style={s.subtitle}>
            A safe space to share, support and grow together 🌿
          </Text>
        </View>

        <View style={s.headerActions}>
          <Pressable style={s.bellButton} onPress={onReportsPress}>
            <MaterialCommunityIcons
              name="flag-outline"
              size={24}
              color="#083D34"
            />
          </Pressable>

          <Pressable style={s.plusButton} onPress={onCreatePress}>
            <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={s.searchBox}>
        <MaterialCommunityIcons name="magnify" size={22} color="#7E8F8B" />
        <TextInput
          style={s.searchInput}
          placeholder="Search stories, feelings, hashtags..."
          placeholderTextColor="#7E8F8B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {filters.map((item) => {
          const active = item === filter;

          return (
            <Pressable
              key={item}
              style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>
                {item === "all" ? "All" : `#${item}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
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
};

export function ForumHeader({
  search,
  setSearch,
  filter,
  setFilter,
  filters,
  onCreatePress,
}: Props) {
  return (
    <View style={s.header}>
      <View style={s.decorHeart}>
        <MaterialCommunityIcons
          name="heart-outline"
          size={42}
          color="rgba(0,134,107,0.08)"
        />
      </View>

      <View style={s.headerTop}>
        <View>
          <Text style={s.title}>Healing Forum</Text>
          <Text style={s.subtitle}>
            A safe space to share, support{"\n"}and grow together 🌿
          </Text>
        </View>

        <View style={s.headerActions}>
          <Pressable style={s.bellButton}>
            <MaterialCommunityIcons name="bell-outline" size={26} color="#083D34" />
            <View style={s.redDot} />
          </Pressable>

          <Pressable style={s.plusButton} onPress={onCreatePress}>
            <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
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
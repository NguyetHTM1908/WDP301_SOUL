import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onboardingStyles as styles } from "@/styles/onboarding.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Cấu hình các trang ảnh minh họa Onboarding
const slides = [
  {
    id: 0,
    title: "Explore the community",
    image: require("../../assets/images/onboarding1.png"),
  },
  {
    id: 1,
    title: "Workshop & Meeting",
    image: require("../../assets/images/onboarding2.png"),
  },
  {
    id: 2,
    title: "24/7 consultation and support",
    image: require("../../assets/images/onboarding3.png"),
  },
  {
    id: 3,
    title: "Mood tracking diary",
    image: require("../../assets/images/onboarding4.png"),
  },
];

// Danh sách các thẻ chức năng hiển thị ở hàng ngang phía dưới
const onboardingCards = [
  { id: 0, title: "Explore the\ncommunity", icon: "account-group" },
  { id: 1, title: "Workshop &\nMeeting", icon: "presentation" },
  { id: 2, title: "24/7 consultation\nand support", icon: "chat-processing" },
  { id: 3, title: "Mood tracking\ndiary", icon: "notebook" },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const cardsScrollViewRef = useRef<ScrollView>(null);
  
  // Các thông số kích thước để tính toán cuộn đồng bộ thẻ
  const cardWidth = 180;
  const gap = 16; // Khoảng cách giữa các thẻ (marginHorizontal: 8 * 2)

  // Cấu hình kéo thả nút "Swipe to start"
  const sliderWidth = SCREEN_WIDTH * 0.85;
  const handleWidth = 52;
  const padding = 6;
  const maxDrag = sliderWidth - handleWidth - padding * 2;
  
  const pan = useRef(new Animated.Value(0)).current;

  // Khởi tạo PanResponder xử lý sự kiện kéo nút trượt bắt đầu
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Giới hạn giá trị di chuyển trong khoảng từ 0 đến maxDrag
        let newValue = gestureState.dx;
        if (newValue < 0) newValue = 0;
        if (newValue > maxDrag) newValue = maxDrag;
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Nếu kéo được quá 70% quãng đường trượt, tự động hoàn thành cú trượt
        if (gestureState.dx > maxDrag * 0.7) {
          Animated.timing(pan, {
            toValue: maxDrag,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // Chuyển hướng sang màn hình Đăng nhập (Login) sau khi hoàn thành onboarding
            router.replace("/(auth)/login");
          });
        } else {
          // Ngược lại nảy lò xo về vị trí xuất phát
          Animated.spring(pan, {
            toValue: 0,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Hiệu ứng mờ chữ "Swipe to start" khi trượt nút
  const textOpacity = pan.interpolate({
    inputRange: [0, maxDrag * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Theo dõi cử chỉ vuốt ngang trang ảnh minh họa chính để cập nhật activeIndex
  const handleScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  // Hàm chuyển trang khi nhấn chọn thẻ
  const navigateToPage = (index: number) => {
    // Cuộn ScrollView ảnh minh họa chính đến trang tương ứng
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    // Cập nhật trạng thái active
    setActiveIndex(index);
  };

  // Lắng nghe sự thay đổi của activeIndex để tự động cuộn đồng bộ danh sách thẻ
  useEffect(() => {
    const targetX = activeIndex * (cardWidth + gap);
    cardsScrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      {/* Tiêu đề ứng dụng */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SOUL</Text>
      </View>

      {/* 1. Khu vực cuộn chính chứa ảnh minh họa */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={slide.image} style={styles.illustration} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 2. Khu vực chứa hàng thẻ chức năng cuộn đồng bộ và nhấn chọn được */}
      <View style={styles.cardsRow}>
        <ScrollView
          ref={cardsScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContent}
          // Khóa chức năng kéo tay trực tiếp trên thẻ để người dùng trượt qua trang ảnh minh họa chính
          scrollEnabled={false}
        >
          {onboardingCards.map((card) => {
            const isActive = card.id === activeIndex;
            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => navigateToPage(card.id)}
                style={[
                  styles.card,
                  isActive ? styles.activeCard : styles.inactiveCard,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isActive ? styles.activeIconBg : styles.inactiveIconBg,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={card.icon as any}
                    size={isActive ? 28 : 22}
                    color={isActive ? "#0F766E" : "#8193A5"}
                  />
                </View>
                <Text
                  style={[
                    styles.cardTitle,
                    isActive ? styles.activeCardTitle : styles.inactiveCardTitle,
                  ]}
                >
                  {card.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Dấu chấm hiển thị chỉ số trang (Indicators) */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* 4. Thanh trượt kéo bắt đầu "Swipe to start" */}
      <View style={styles.sliderTrack}>
        <Animated.Text style={[styles.sliderText, { opacity: textOpacity }]}>
          Swipe to start
        </Animated.Text>
        <Animated.View
          style={[
            styles.sliderHandle,
            {
              transform: [{ translateX: pan }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
        </Animated.View>
      </View>
    </View>
  );
}

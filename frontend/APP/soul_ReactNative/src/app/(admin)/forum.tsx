import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import apiClient from "@/services/api";
import { adminForumStyles as s } from "@/styles/adminForum.styles";

type ForumStatus =
  | "all"
  | "pending"
  | "approved"
  | "hidden"
  | "reported"
  | "deleted";

type ForumPostStatus = Exclude<
  ForumStatus,
  "all"
>;

type ForumMedia = {
  url: string;
  type: "image" | "video";
};

type ForumPost = {
  id: string;
  author: string;
  title: string;
  content: string;
  status: ForumPostStatus;
  realStatus?: string;

  reports: number;
  comments: number;

  createdAt: string;
  isAnonymous: boolean;
  isFlagged?: boolean;

  toxicityLevel?: string | null;
  emotionStatus?: string | null;

  hashtags: string[];
  mediaUrls: ForumMedia[];
};

type AdminReport = {
  _id?: string;
  id?: string;

  targetType: "post" | "comment";

  targetId:
    | string
    | {
        _id?: string;
        id?: string;
      };

  reason?: string;
  description?: string | null;

  status:
    | "pending"
    | "dismissed"
    | "action_taken"
    | "appeal_pending"
    | "appeal_accepted"
    | "appeal_rejected";

  createdAt?: string;
};

const filters: {
  label: string;
  value: ForumStatus;
  icon: any;
}[] = [
  {
    label: "Tất cả",
    value: "all",
    icon: "view-grid-outline",
  },
  {
    label: "Chờ duyệt",
    value: "pending",
    icon: "clock-outline",
  },
  {
    label: "Đã duyệt",
    value: "approved",
    icon: "check-circle-outline",
  },
  {
    label: "Bị báo cáo",
    value: "reported",
    icon: "flag-outline",
  },
  {
    label: "Đã ẩn",
    value: "hidden",
    icon: "eye-off-outline",
  },
  {
    label: "Đã xóa",
    value: "deleted",
    icon: "trash-can-outline",
  },
];

function getPostId(item: any): string {
  return (
    item?._id?.toString?.() ||
    item?.id?.toString?.() ||
    item?._id ||
    item?.id ||
    ""
  );
}

function getReportTargetId(
  report: AdminReport
): string {
  const targetId = report?.targetId;

  if (!targetId) {
    return "";
  }

  if (typeof targetId === "string") {
    return targetId;
  }

  return (
    targetId?._id?.toString?.() ||
    targetId?.id?.toString?.() ||
    targetId?._id ||
    targetId?.id ||
    ""
  );
}

function formatDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBackendOrigin(): string {
  const configuredApiUrl =
    process.env.EXPO_PUBLIC_API_URL;

  if (configuredApiUrl) {
    return configuredApiUrl
      .replace(/\/api\/?$/, "")
      .replace(/\/+$/, "");
  }

  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  return "http://10.12.64.253:5000";
}

function getMediaUrl(url?: string): string {
  if (!url) {
    return "";
  }

  const normalizedUrl = String(url).trim();

  if (!normalizedUrl) {
    return "";
  }

  if (
    normalizedUrl.startsWith("http://") ||
    normalizedUrl.startsWith("https://") ||
    normalizedUrl.startsWith("data:") ||
    normalizedUrl.startsWith("blob:")
  ) {
    return normalizedUrl;
  }

  const backendOrigin = getBackendOrigin();

  return `${backendOrigin}/${normalizedUrl.replace(
    /^\/+/,
    ""
  )}`;
}

function getAuthorName(item: any): string {
  if (item?.isAnonymous) {
    return (
      item?.displayAuthor?.fullName ||
      item?.anonymousName ||
      item?.authorId?.anonymousAlias ||
      "Ẩn danh SOUL"
    );
  }

  return (
    item?.displayAuthor?.fullName ||
    item?.authorId?.fullName ||
    item?.author?.fullName ||
    "Người dùng SOUL"
  );
}

function mapApiPostToForumPost(
  item: any,
  reportCountFromApi = 0
): ForumPost {
  const id = getPostId(item);

  const storedReportCount = Number(
    item?.statistics?.reportCount || 0
  );

  const reportCount = Math.max(
    storedReportCount,
    reportCountFromApi
  );

  const commentCount = Number(
    item?.statistics?.commentCount || 0
  );

  const realStatus =
    item?.status || "pending";

  let uiStatus: ForumPostStatus =
    "pending";

  if (
    realStatus === "deleted" ||
    realStatus === "rejected"
  ) {
    uiStatus = "deleted";
  } else if (realStatus === "hidden") {
    uiStatus = "hidden";
  } else if (
    item?.isFlagged ||
    reportCount > 0
  ) {
    uiStatus = "reported";
  } else if (realStatus === "approved") {
    uiStatus = "approved";
  } else {
    uiStatus = "pending";
  }

  const mediaUrls: ForumMedia[] =
    Array.isArray(item?.mediaUrls)
      ? item.mediaUrls
          .map((media: any) => {
            return {
              url: getMediaUrl(media?.url),
              type:
                media?.type === "video"
                  ? "video"
                  : "image",
            } as ForumMedia;
          })
          .filter(
            (media: ForumMedia) =>
              Boolean(media.url)
          )
      : [];

  const hashtags: string[] =
    Array.isArray(item?.hashtags)
      ? item.hashtags
          .map((tag: unknown) =>
            String(tag || "")
              .replace("#", "")
              .trim()
          )
          .filter(Boolean)
      : [];

  return {
    id,

    author: getAuthorName(item),

    title:
      hashtags.length > 0
        ? `#${hashtags[0]}`
        : item?.emotionStatus
          ? `Cảm xúc: ${item.emotionStatus}`
          : "Bài viết diễn đàn",

    content: item?.content || "",

    status: uiStatus,
    realStatus,

    reports: reportCount,
    comments: commentCount,

    createdAt: formatDate(
      item?.createdAt
    ),

    isAnonymous: Boolean(
      item?.isAnonymous
    ),

    isFlagged: Boolean(
      item?.isFlagged
    ),

    toxicityLevel:
      item?.toxicityLevel || null,

    emotionStatus:
      item?.emotionStatus || null,

    hashtags,
    mediaUrls,
  };
}

function getStatusInfo(
  status: ForumPostStatus
) {
  if (status === "pending") {
    return {
      label: "Chờ duyệt",
      color: "#F59E0B",
      bg: "#FFF7E6",
      icon: "clock-outline",
    };
  }

  if (status === "approved") {
    return {
      label: "Đã duyệt",
      color: "#00866B",
      bg: "#E8F8F3",
      icon: "check-circle-outline",
    };
  }

  if (status === "reported") {
    return {
      label: "Bị báo cáo",
      color: "#DC2626",
      bg: "#FEECEC",
      icon: "flag-outline",
    };
  }

  if (status === "deleted") {
    return {
      label: "Đã xóa",
      color: "#DC2626",
      bg: "#FEECEC",
      icon: "trash-can-outline",
    };
  }

  return {
    label: "Đã ẩn",
    color: "#64748B",
    bg: "#F1F5F9",
    icon: "eye-off-outline",
  };
}

function getToxicityInfo(
  toxicityLevel?: string | null
) {
  if (toxicityLevel === "high") {
    return {
      label: "Cao",
      color: "#DC2626",
      bg: "#FEECEC",
    };
  }

  if (toxicityLevel === "medium") {
    return {
      label: "Trung bình",
      color: "#D97706",
      bg: "#FFF7E6",
    };
  }

  return {
    label: "Thấp",
    color: "#00866B",
    bg: "#E8F8F3",
  };
}

export default function AdminForumScreen() {
  const [search, setSearch] =
    useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<ForumStatus>("all");

  const [posts, setPosts] = useState<
    ForumPost[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    actionLoadingId,
    setActionLoadingId,
  ] = useState<string | null>(null);

  const [
    selectedPost,
    setSelectedPost,
  ] = useState<ForumPost | null>(null);

  const [
    detailVisible,
    setDetailVisible,
  ] = useState(false);

  const fetchPosts =
    useCallback(async () => {
      try {
        console.log(
          "[ADMIN FORUM] Fetching posts and reports"
        );

        const results =
          await Promise.allSettled([
            apiClient.get(
              "/admin/forum/posts"
            ),

            apiClient.get(
              "/admin/forum/reports"
            ),
          ]);

        const postsResult = results[0];
        const reportsResult =
          results[1];

        if (
          postsResult.status ===
          "rejected"
        ) {
          throw postsResult.reason;
        }

        const rawPosts =
          postsResult.value?.data?.data ||
          [];

        let rawReports: AdminReport[] =
          [];

        if (
          reportsResult.status ===
          "fulfilled"
        ) {
          rawReports =
            reportsResult.value?.data
              ?.data || [];
        } else {
          console.log(
            "[ADMIN REPORTS ERROR]",
            reportsResult.reason
              ?.response?.status,
            reportsResult.reason
              ?.response?.data ||
              reportsResult.reason
                ?.message
          );
        }

        const pendingPostReports =
          rawReports.filter(
            (report) =>
              report?.targetType ===
                "post" &&
              (report?.status ===
                "pending" ||
                report?.status ===
                  "appeal_pending")
          );

        const reportCountByPostId =
          pendingPostReports.reduce<
            Record<string, number>
          >((acc, report) => {
            const targetId =
              getReportTargetId(report);

            if (!targetId) {
              return acc;
            }

            acc[targetId] =
              (acc[targetId] || 0) + 1;

            return acc;
          }, {});

        const mappedPosts =
          Array.isArray(rawPosts)
            ? rawPosts.map((item) => {
                const postId =
                  getPostId(item);

                return mapApiPostToForumPost(
                  item,
                  reportCountByPostId[
                    postId
                  ] || 0
                );
              })
            : [];

        console.log(
          "[ADMIN POSTS RESPONSE]",
          mappedPosts
        );

        console.log(
          "[ADMIN REPORTS RESPONSE]",
          rawReports
        );

        setPosts(mappedPosts);

        setSelectedPost(
          (currentSelectedPost) => {
            if (!currentSelectedPost) {
              return null;
            }

            return (
              mappedPosts.find(
                (post) =>
                  post.id ===
                  currentSelectedPost.id
              ) ||
              currentSelectedPost
            );
          }
        );
      } catch (error: any) {
        console.log(
          "[ADMIN FORUM FETCH ERROR]",
          {
            status:
              error?.response?.status,

            data:
              error?.response?.data,

            message: error?.message,
          }
        );

        Alert.alert(
          "Lỗi",
          error?.response?.data
            ?.message ||
            error?.message ||
            "Không thể lấy dữ liệu diễn đàn."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      const matchFilter =
        activeFilter === "all"
          ? true
          : post.status ===
            activeFilter;

      const keyword = search
        .trim()
        .toLowerCase();

      const matchSearch =
        !keyword ||
        post.title
          .toLowerCase()
          .includes(keyword) ||
        post.content
          .toLowerCase()
          .includes(keyword) ||
        post.author
          .toLowerCase()
          .includes(keyword) ||
        post.hashtags.some((tag) =>
          tag
            .toLowerCase()
            .includes(keyword)
        );

      return (
        matchFilter && matchSearch
      );
    });
  }, [
    posts,
    search,
    activeFilter,
  ]);

  const totalReported = posts.filter(
    (item) =>
      item.status === "reported"
  ).length;

  const totalPending = posts.filter(
    (item) =>
      item.status === "pending"
  ).length;

  const totalHidden = posts.filter(
    (item) =>
      item.status === "hidden"
  ).length;

  const onRefresh = () => {
    setRefreshing(true);
    void fetchPosts();
  };

  const openPostDetail = (
    post: ForumPost
  ) => {
    setSelectedPost(post);
    setDetailVisible(true);
  };

  const closePostDetail = () => {
    setDetailVisible(false);

    setTimeout(() => {
      setSelectedPost(null);
    }, 250);
  };

  const updatePostStatusLocal = (
    id: string,
    status: ForumPostStatus,
    realStatus?: string
  ) => {
    setPosts((previousPosts) =>
      previousPosts.map((item) =>
        item.id === id
          ? {
              ...item,
              status,

              realStatus:
                realStatus || status,

              isFlagged:
                status === "reported"
                  ? item.isFlagged
                  : false,
            }
          : item
      )
    );

    setSelectedPost(
      (currentSelectedPost) => {
        if (
          !currentSelectedPost ||
          currentSelectedPost.id !== id
        ) {
          return currentSelectedPost;
        }

        return {
          ...currentSelectedPost,
          status,

          realStatus:
            realStatus || status,

          isFlagged:
            status === "reported"
              ? currentSelectedPost.isFlagged
              : false,
        };
      }
    );
  };

  const handleApprove = async (
    id: string
  ): Promise<boolean> => {
    if (!id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy ID bài viết."
      );

      return false;
    }

    try {
      setActionLoadingId(id);

      await apiClient.patch(
        `/admin/forum/posts/${id}/approve`,
        {}
      );

      updatePostStatusLocal(
        id,
        "approved",
        "approved"
      );

      Alert.alert(
        "Đã duyệt",
        "Bài viết đã được duyệt và hiển thị trong diễn đàn."
      );

      return true;
    } catch (error: any) {
      console.log(
        "[APPROVE POST ERROR]",
        error?.response?.status,
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Lỗi",
        error?.response?.data
          ?.message ||
          error?.message ||
          "Không thể duyệt bài viết."
      );

      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHide = async (
    id: string
  ): Promise<boolean> => {
    if (!id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy ID bài viết."
      );

      return false;
    }

    try {
      setActionLoadingId(id);

      await apiClient.patch(
        `/admin/forum/posts/${id}/hide`,
        {
          reason:
            "Bài viết đã bị quản trị viên ẩn.",
        }
      );

      updatePostStatusLocal(
        id,
        "hidden",
        "hidden"
      );

      Alert.alert(
        "Đã ẩn",
        "Bài viết đã được ẩn khỏi diễn đàn."
      );

      return true;
    } catch (error: any) {
      console.log(
        "[HIDE POST ERROR]",
        error?.response?.status,
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Lỗi",
        error?.response?.data
          ?.message ||
          error?.message ||
          "Không thể ẩn bài viết."
      );

      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const deletePostNow = async (
    id: string
  ): Promise<boolean> => {
    try {
      setActionLoadingId(id);

      await apiClient.patch(
        `/admin/forum/posts/${id}/reject`,
        {
          reason:
            "Bài viết đã bị quản trị viên xóa.",
        }
      );

      updatePostStatusLocal(
        id,
        "deleted",
        "deleted"
      );

      setDetailVisible(false);

      Alert.alert(
        "Đã xóa",
        "Bài viết đã được chuyển sang trạng thái đã xóa."
      );

      return true;
    } catch (error: any) {
      console.log(
        "[DELETE POST ERROR]",
        error?.response?.status,
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Lỗi",
        error?.response?.data
          ?.message ||
          error?.message ||
          "Không thể xóa bài viết."
      );

      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (
    id: string
  ) => {
    if (!id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy ID bài viết."
      );

      return;
    }

    if (Platform.OS === "web") {
      const confirmed =
        window.confirm(
          "Bạn có chắc muốn xóa bài viết này không?"
        );

      if (confirmed) {
        void deletePostNow(id);
      }

      return;
    }

    Alert.alert(
      "Xóa bài viết",
      "Bạn có chắc muốn xóa bài viết này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            void deletePostNow(id);
          },
        },
      ]
    );
  };

  const renderPost = ({
    item,
  }: {
    item: ForumPost;
  }) => {
    const statusInfo =
      getStatusInfo(item.status);

    const isActionLoading =
      actionLoadingId === item.id;

    return (
      <View style={s.postCard}>
        <View style={s.postTop}>
          <View style={s.authorBox}>
            <View
              style={s.avatarCircle}
            >
              <MaterialCommunityIcons
                name={
                  item.isAnonymous
                    ? "incognito"
                    : "account-outline"
                }
                size={24}
                color="#00866B"
              />
            </View>

            <View
              style={s.authorInfo}
            >
              <Text
                style={s.authorName}
              >
                {item.author}
              </Text>

              <Text
                style={s.postDate}
              >
                {item.createdAt}
              </Text>
            </View>
          </View>

          <View
            style={[
              s.statusBadge,
              {
                backgroundColor:
                  statusInfo.bg,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                statusInfo.icon as any
              }
              size={14}
              color={
                statusInfo.color
              }
            />

            <Text
              style={[
                s.statusText,
                {
                  color:
                    statusInfo.color,
                },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={s.postTitle}>
          {item.title}
        </Text>

        <Text
          style={s.postContent}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        {item.mediaUrls.length > 0 ? (
          <View
            style={{
              marginTop: 12,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor:
                "#F1F5F9",
            }}
          >
            {item.mediaUrls[0].type ===
            "image" ? (
              <Image
                source={{
                  uri: item.mediaUrls[0]
                    .url,
                }}
                resizeMode="cover"
                style={{
                  width: "100%",
                  height: 180,
                }}
                onError={(event) => {
                  console.log(
                    "[ADMIN LIST IMAGE ERROR]",
                    {
                      url: item
                        .mediaUrls[0]
                        .url,

                      error:
                        event.nativeEvent
                          .error,
                    }
                  );
                }}
              />
            ) : (
              <View
                style={{
                  height: 120,
                  justifyContent:
                    "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="video-outline"
                  size={38}
                  color="#64748B"
                />

                <Text
                  style={{
                    color: "#64748B",
                    marginTop: 6,
                  }}
                >
                  Bài viết có video
                </Text>
              </View>
            )}

            {item.mediaUrls.length >
            1 ? (
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 10,
                  backgroundColor:
                    "rgba(15, 23, 42, 0.75)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                  }}
                >
                  +
                  {item.mediaUrls
                    .length - 1}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={s.postMetaRow}>
          <View style={s.metaItem}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={17}
              color="#64748B"
            />

            <Text style={s.metaText}>
              {item.comments} bình luận
            </Text>
          </View>

          <View style={s.metaItem}>
            <MaterialCommunityIcons
              name="flag-outline"
              size={17}
              color={
                item.reports > 0
                  ? "#DC2626"
                  : "#64748B"
              }
            />

            <Text
              style={[
                s.metaText,

                item.reports > 0 && {
                  color: "#DC2626",
                  fontWeight: "700",
                },
              ]}
            >
              {item.reports} báo cáo
            </Text>
          </View>
        </View>

        <View style={s.actionRow}>
          <Pressable
            style={[
              s.actionButton,
              s.viewButton,
            ]}
            onPress={() =>
              openPostDetail(item)
            }
            disabled={
              isActionLoading
            }
          >
            <MaterialCommunityIcons
              name="eye-outline"
              size={18}
              color="#2563EB"
            />

            <Text
              style={[
                s.actionText,
                {
                  color: "#2563EB",
                },
              ]}
            >
              Xem
            </Text>
          </Pressable>

          <Pressable
            style={[
              s.actionButton,
              s.approveButton,
            ]}
            onPress={() => {
              void handleApprove(
                item.id
              );
            }}
            disabled={
              isActionLoading ||
              item.realStatus ===
                "approved"
            }
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color="#00866B"
            />

            <Text
              style={[
                s.actionText,
                {
                  color: "#00866B",
                },
              ]}
            >
              {item.realStatus ===
              "approved"
                ? "Đã duyệt"
                : "Duyệt"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              s.actionButton,
              s.hideButton,
            ]}
            onPress={() => {
              void handleHide(item.id);
            }}
            disabled={
              isActionLoading ||
              item.realStatus ===
                "hidden"
            }
          >
            <MaterialCommunityIcons
              name="eye-off-outline"
              size={18}
              color="#F59E0B"
            />

            <Text
              style={[
                s.actionText,
                {
                  color: "#F59E0B",
                },
              ]}
            >
              {item.realStatus ===
              "hidden"
                ? "Đã ẩn"
                : "Ẩn"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              s.actionButton,
              s.deleteButton,
            ]}
            onPress={() =>
              handleDelete(item.id)
            }
            disabled={
              isActionLoading ||
              item.realStatus ===
                "deleted"
            }
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color="#DC2626"
            />

            <Text
              style={[
                s.actionText,
                {
                  color: "#DC2626",
                },
              ]}
            >
              {isActionLoading
                ? "Đang xử lý..."
                : item.realStatus ===
                    "deleted"
                  ? "Đã xóa"
                  : "Xóa"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const selectedStatusInfo =
    selectedPost
      ? getStatusInfo(
          selectedPost.status
        )
      : null;

  const selectedToxicityInfo =
    selectedPost
      ? getToxicityInfo(
          selectedPost.toxicityLevel
        )
      : null;

  return (
    <View style={s.page}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable
            style={s.backButton}
            onPress={() =>
              router.replace(
                "/(admin)" as any
              )
            }
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#064D3D"
            />
          </Pressable>

          <View style={s.headerIcon}>
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={s.title}>
          Kiểm duyệt diễn đàn
        </Text>

        <Text style={s.subtitle}>
          Xem xét bài viết cộng đồng,
          xử lý báo cáo và giữ diễn đàn
          SOUL an toàn.
        </Text>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>
              {posts.length}
            </Text>

            <Text style={s.statLabel}>
              Tổng bài viết
            </Text>
          </View>

          <View style={s.statCard}>
            <Text
              style={[
                s.statValue,
                {
                  color: "#F59E0B",
                },
              ]}
            >
              {totalPending}
            </Text>

            <Text style={s.statLabel}>
              Chờ duyệt
            </Text>
          </View>

          <View style={s.statCard}>
            <Text
              style={[
                s.statValue,
                {
                  color: "#DC2626",
                },
              ]}
            >
              {totalReported}
            </Text>

            <Text style={s.statLabel}>
              Bị báo cáo
            </Text>
          </View>

          <View style={s.statCard}>
            <Text
              style={[
                s.statValue,
                {
                  color: "#64748B",
                },
              ]}
            >
              {totalHidden}
            </Text>

            <Text style={s.statLabel}>
              Đã ẩn
            </Text>
          </View>
        </View>

        <View style={s.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#7A8F89"
          />

          <TextInput
            style={s.searchInput}
            placeholder="Tìm kiếm bài viết, tác giả, nội dung..."
            placeholderTextColor="#8A9996"
            value={search}
            onChangeText={setSearch}
          />

          {search ? (
            <Pressable
              onPress={() =>
                setSearch("")
              }
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            s.filterRow
          }
        >
          {filters.map((item) => {
            const active =
              item.value ===
              activeFilter;

            return (
              <Pressable
                key={item.value}
                style={[
                  s.filterChip,

                  active &&
                    s.filterChipActive,
                ]}
                onPress={() =>
                  setActiveFilter(
                    item.value
                  )
                }
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={17}
                  color={
                    active
                      ? "#FFFFFF"
                      : "#00866B"
                  }
                />

                <Text
                  style={[
                    s.filterText,

                    active &&
                      s.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.emptyBox}>
          <ActivityIndicator
            size="large"
            color="#00866B"
          />

          <Text style={s.emptyText}>
            Đang tải bài viết diễn
            đàn...
          </Text>
        </View>
      ) : (
        <FlatList
          data={visiblePosts}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderPost}
          contentContainerStyle={
            s.list
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>
                🛡️
              </Text>

              <Text style={s.emptyTitle}>
                Không tìm thấy bài viết
              </Text>

              <Text style={s.emptyText}>
                Không có bài viết diễn
                đàn nào khớp với bộ lọc
                hiện tại.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={detailVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closePostDetail
        }
      >
        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(15, 23, 42, 0.6)",

            justifyContent: "center",
            alignItems: "center",

            padding: 16,
          }}
        >
          <Pressable
            onPress={closePostDetail}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />

          <View
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "94%",

              backgroundColor:
                "#FFFFFF",

              borderRadius: 24,
              overflow: "hidden",

              shadowColor: "#000000",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.25,
              shadowRadius: 24,

              elevation: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",

                justifyContent:
                  "space-between",

                alignItems: "center",

                paddingHorizontal: 20,
                paddingVertical: 16,

                borderBottomWidth: 1,
                borderBottomColor:
                  "#E2E8F0",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  marginRight: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,

                    justifyContent:
                      "center",

                    alignItems: "center",

                    backgroundColor:
                      "#E8F8F3",

                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedPost?.isAnonymous
                        ? "incognito"
                        : "account-outline"
                    }
                    size={25}
                    color="#00866B"
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: "#0F3D34",
                    }}
                    numberOfLines={1}
                  >
                    {selectedPost?.author ||
                      "Người dùng SOUL"}
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      marginTop: 3,
                    }}
                  >
                    {
                      selectedPost?.createdAt
                    }
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={closePostDetail}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,

                  justifyContent:
                    "center",

                  alignItems: "center",

                  backgroundColor:
                    pressed
                      ? "#E2E8F0"
                      : "#F1F5F9",
                })}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#475569"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 30,
              }}
            >
              {selectedPost &&
              selectedStatusInfo &&
              selectedToxicityInfo ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",

                      alignItems: "center",

                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        paddingHorizontal:
                          12,

                        paddingVertical: 7,

                        borderRadius: 20,

                        backgroundColor:
                          selectedStatusInfo.bg,

                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          selectedStatusInfo.icon as any
                        }
                        size={15}
                        color={
                          selectedStatusInfo.color
                        }
                      />

                      <Text
                        style={{
                          marginLeft: 6,

                          fontSize: 13,
                          fontWeight:
                            "700",

                          color:
                            selectedStatusInfo.color,
                        }}
                      >
                        {
                          selectedStatusInfo.label
                        }
                      </Text>
                    </View>

                    {selectedPost.emotionStatus ? (
                      <View
                        style={{
                          paddingHorizontal:
                            12,

                          paddingVertical:
                            7,

                          borderRadius: 20,

                          backgroundColor:
                            "#F1F5F9",

                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            fontWeight:
                              "600",
                          }}
                        >
                          Cảm xúc:{" "}
                          {
                            selectedPost.emotionStatus
                          }
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={{
                        paddingHorizontal:
                          12,

                        paddingVertical: 7,

                        borderRadius: 20,

                        backgroundColor:
                          selectedToxicityInfo.bg,

                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",

                          color:
                            selectedToxicityInfo.color,
                        }}
                      >
                        Độc hại:{" "}
                        {
                          selectedToxicityInfo.label
                        }
                      </Text>
                    </View>

                    {selectedPost.isAnonymous ? (
                      <View
                        style={{
                          flexDirection:
                            "row",

                          alignItems:
                            "center",

                          paddingHorizontal:
                            12,

                          paddingVertical:
                            7,

                          borderRadius: 20,

                          backgroundColor:
                            "#EEF2FF",

                          marginBottom: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="incognito"
                          size={15}
                          color="#4F46E5"
                        />

                        <Text
                          style={{
                            marginLeft: 5,
                            fontSize: 13,

                            fontWeight:
                              "600",

                            color:
                              "#4F46E5",
                          }}
                        >
                          Bài viết ẩn danh
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text
                    style={{
                      fontSize: 20,
                      lineHeight: 28,

                      fontWeight: "700",
                      color: "#0F3D34",

                      marginBottom: 12,
                    }}
                  >
                    {selectedPost.title}
                  </Text>

                  {selectedPost.hashtags
                    .length > 0 ? (
                    <View
                      style={{
                        flexDirection:
                          "row",

                        flexWrap: "wrap",

                        marginBottom: 12,
                      }}
                    >
                      {selectedPost.hashtags.map(
                        (tag, index) => (
                          <View
                            key={`${tag}-${index}`}
                            style={{
                              paddingHorizontal:
                                10,

                              paddingVertical:
                                6,

                              borderRadius:
                                16,

                              backgroundColor:
                                "#E8F8F3",

                              marginRight: 8,
                              marginBottom:
                                8,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  "#00866B",

                                fontWeight:
                                  "600",

                                fontSize: 13,
                              }}
                            >
                              #{tag}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  ) : null}

                  <View
                    style={{
                      backgroundColor:
                        "#F8FAFC",

                      borderRadius: 16,

                      padding: 16,
                      marginBottom: 18,

                      borderWidth: 1,
                      borderColor:
                        "#E2E8F0",
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        fontSize: 16,
                        lineHeight: 26,
                        color: "#1E293B",
                      }}
                    >
                      {selectedPost.content ||
                        "Bài viết không có nội dung."}
                    </Text>
                  </View>

                  {selectedPost.mediaUrls
                    .length > 0 ? (
                    <View
                      style={{
                        marginBottom: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,

                          fontWeight:
                            "700",

                          color:
                            "#0F3D34",

                          marginBottom: 12,
                        }}
                      >
                        Nội dung đính kèm
                      </Text>

                      {selectedPost.mediaUrls.map(
                        (
                          media,
                          index
                        ) => {
                          if (
                            media.type ===
                            "video"
                          ) {
                            return (
                              <View
                                key={`${media.url}-${index}`}
                                style={{
                                  minHeight:
                                    150,

                                  borderRadius:
                                    16,

                                  backgroundColor:
                                    "#F1F5F9",

                                  justifyContent:
                                    "center",

                                  alignItems:
                                    "center",

                                  marginBottom:
                                    14,

                                  padding: 20,

                                  borderWidth:
                                    1,

                                  borderColor:
                                    "#E2E8F0",
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="video-outline"
                                  size={42}
                                  color="#64748B"
                                />

                                <Text
                                  style={{
                                    marginTop: 8,

                                    color:
                                      "#475569",

                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  Video bài
                                  viết
                                </Text>

                                <Text
                                  selectable
                                  style={{
                                    marginTop: 8,

                                    color:
                                      "#2563EB",

                                    fontSize: 12,

                                    textAlign:
                                      "center",
                                  }}
                                >
                                  {media.url}
                                </Text>
                              </View>
                            );
                          }

                          return (
                            <View
                              key={`${media.url}-${index}`}
                              style={{
                                width:
                                  "100%",

                                marginBottom:
                                  14,

                                borderRadius:
                                  16,

                                overflow:
                                  "hidden",

                                backgroundColor:
                                  "#F1F5F9",

                                borderWidth:
                                  1,

                                borderColor:
                                  "#E2E8F0",
                              }}
                            >
                              <Image
                                source={{
                                  uri: media.url,
                                }}
                                resizeMode="contain"
                                style={{
                                  width:
                                    "100%",

                                  height:
                                    420,
                                }}
                                onError={(
                                  event
                                ) => {
                                  console.log(
                                    "[ADMIN POST IMAGE ERROR]",
                                    {
                                      url: media.url,

                                      error:
                                        event
                                          .nativeEvent
                                          .error,
                                    }
                                  );
                                }}
                              />
                            </View>
                          );
                        }
                      )}
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        backgroundColor:
                          "#F8FAFC",

                        borderRadius: 14,

                        padding: 14,
                        marginBottom: 20,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="image-off-outline"
                        size={22}
                        color="#94A3B8"
                      />

                      <Text
                        style={{
                          marginLeft: 8,
                          color: "#64748B",
                        }}
                      >
                        Bài viết không có
                        hình ảnh hoặc video.
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",

                      paddingVertical: 15,

                      borderTopWidth: 1,
                      borderBottomWidth: 1,

                      borderColor:
                        "#E2E8F0",

                      marginBottom: 20,
                    }}
                  >
                    <View
                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        marginRight: 24,
                        marginBottom: 6,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="comment-outline"
                        size={19}
                        color="#64748B"
                      />

                      <Text
                        style={{
                          marginLeft: 7,
                          color: "#475569",
                        }}
                      >
                        {
                          selectedPost.comments
                        }{" "}
                        bình luận
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        marginBottom: 6,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="flag-outline"
                        size={19}
                        color={
                          selectedPost.reports >
                          0
                            ? "#DC2626"
                            : "#64748B"
                        }
                      />

                      <Text
                        style={{
                          marginLeft: 7,

                          color:
                            selectedPost.reports >
                            0
                              ? "#DC2626"
                              : "#475569",

                          fontWeight:
                            selectedPost.reports >
                            0
                              ? "700"
                              : "400",
                        }}
                      >
                        {
                          selectedPost.reports
                        }{" "}
                        báo cáo
                      </Text>
                    </View>
                  </View>

                  {/* Nút thao tác */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        void handleApprove(
                          selectedPost.id
                        );
                      }}
                      disabled={
                        actionLoadingId ===
                          selectedPost.id ||
                        selectedPost.realStatus ===
                          "approved"
                      }
                      style={({
                        pressed,
                      }) => ({
                        flexGrow: 1,
                        flexBasis: 140,

                        minHeight: 52,

                        borderRadius: 14,

                        backgroundColor:
                          pressed
                            ? "#D1F2E8"
                            : "#E8F8F3",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        flexDirection:
                          "row",

                        opacity:
                          selectedPost.realStatus ===
                          "approved"
                            ? 0.55
                            : 1,
                      })}
                    >
                      {actionLoadingId ===
                      selectedPost.id ? (
                        <ActivityIndicator
                          size="small"
                          color="#00866B"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="check-circle-outline"
                          size={21}
                          color="#00866B"
                        />
                      )}

                      <Text
                        style={{
                          color: "#00866B",

                          fontWeight:
                            "700",

                          marginLeft: 7,
                        }}
                      >
                        {selectedPost.realStatus ===
                        "approved"
                          ? "Đã duyệt"
                          : "Duyệt bài"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        void handleHide(
                          selectedPost.id
                        );
                      }}
                      disabled={
                        actionLoadingId ===
                          selectedPost.id ||
                        selectedPost.realStatus ===
                          "hidden"
                      }
                      style={({
                        pressed,
                      }) => ({
                        flexGrow: 1,
                        flexBasis: 140,

                        minHeight: 52,

                        borderRadius: 14,

                        backgroundColor:
                          pressed
                            ? "#FDECC8"
                            : "#FFF7E6",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        flexDirection:
                          "row",

                        opacity:
                          selectedPost.realStatus ===
                          "hidden"
                            ? 0.55
                            : 1,
                      })}
                    >
                      <MaterialCommunityIcons
                        name="eye-off-outline"
                        size={21}
                        color="#D97706"
                      />

                      <Text
                        style={{
                          color: "#D97706",

                          fontWeight:
                            "700",

                          marginLeft: 7,
                        }}
                      >
                        {selectedPost.realStatus ===
                        "hidden"
                          ? "Đã ẩn"
                          : "Ẩn bài"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        handleDelete(
                          selectedPost.id
                        )
                      }
                      disabled={
                        actionLoadingId ===
                          selectedPost.id ||
                        selectedPost.realStatus ===
                          "deleted"
                      }
                      style={({
                        pressed,
                      }) => ({
                        flexGrow: 1,
                        flexBasis: 140,

                        minHeight: 52,

                        borderRadius: 14,

                        backgroundColor:
                          pressed
                            ? "#FBD5D5"
                            : "#FEECEC",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        flexDirection:
                          "row",

                        opacity:
                          selectedPost.realStatus ===
                          "deleted"
                            ? 0.55
                            : 1,
                      })}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={21}
                        color="#DC2626"
                      />

                      <Text
                        style={{
                          color: "#DC2626",

                          fontWeight:
                            "700",

                          marginLeft: 7,
                        }}
                      >
                        {selectedPost.realStatus ===
                        "deleted"
                          ? "Đã xóa"
                          : "Xóa bài"}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
import apiClient from "../services/api";

export type ReactionType = "support" | "hug" | "encourage" | "thankyou";

export type MediaItem = {
  url: string;
  type: "image" | "video";
};

export type CreatePostPayload = {
  content: string;
  mediaUrls?: MediaItem[];
  emotionStatus?: string;
  hashtags?: string[];
  isAnonymous?: boolean;
  anonymousName?: string;
  visibility?: "public" | "private";
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

export type CreateCommentPayload = {
  postId: string;
  parentCommentId?: string | null;
  content: string;
  isAnonymous?: boolean;
  anonymousName?: string;
};

function getError(error: any, fallback: string) {
  return error?.response?.data || error || new Error(fallback);
}

/* =========================
   POSTS
========================= */

export const getApprovedPosts = async (params?: {
  hashtag?: string;
  emotionStatus?: string;
  search?: string;
}) => {
  try {
    const response = await apiClient.get("/posts", { params });
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể lấy danh sách bài viết.");
  }
};

export const getPosts = getApprovedPosts;

export const getMyPosts = async () => {
  try {
    const response = await apiClient.get("/posts/my-posts");
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể lấy bài viết của tôi.");
  }
};

export const createPost = async (payload: CreatePostPayload) => {
  try {
    const response = await apiClient.post("/posts", payload);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể tạo bài viết.");
  }
};

export const updatePost = async (
  postId: string,
  payload: UpdatePostPayload
) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để cập nhật bài viết.");
    }

    const response = await apiClient.put(`/posts/${postId}`, payload);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể cập nhật bài viết.");
  }
};

export const deletePost = async (postId: string) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để xóa bài viết.");
    }

    console.log("[DELETE POST API]", `/posts/${postId}`);

    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    console.log("[DELETE POST API ERROR]", error?.response?.data || error);
    throw getError(error, "Không thể xóa bài viết.");
  }
};

/* =========================
   COMMENTS
========================= */

export const getCommentsByPost = async (postId: string) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để lấy bình luận.");
    }

    const response = await apiClient.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể lấy bình luận.");
  }
};

export const createComment = async (payload: CreateCommentPayload) => {
  try {
    const response = await apiClient.post("/comments", payload);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể bình luận.");
  }
};

export const updateComment = async (
  commentId: string,
  payload: {
    content: string;
    isAnonymous?: boolean;
    anonymousName?: string;
  }
) => {
  try {
    if (!commentId) {
      throw new Error("Thiếu commentId để cập nhật bình luận.");
    }

    const response = await apiClient.put(`/comments/${commentId}`, payload);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể cập nhật bình luận.");
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    if (!commentId) {
      throw new Error("Thiếu commentId để xóa bình luận.");
    }

    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể xóa bình luận.");
  }
};

/* =========================
   REACTIONS
========================= */

export const reactToPost = async (postId: string, type: ReactionType) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để react bài viết.");
    }

    const response = await apiClient.post(`/reactions/posts/${postId}`, {
      type,
    });

    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể react bài viết.");
  }
};

export const removePostReaction = async (postId: string) => {
  try {
    if (!postId) {
      throw new Error("Thiếu postId để gỡ reaction bài viết.");
    }

    const response = await apiClient.delete(`/reactions/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể gỡ reaction bài viết.");
  }
};

export const reactToComment = async (
  commentId: string,
  type: ReactionType
) => {
  try {
    if (!commentId) {
      throw new Error("Thiếu commentId để react bình luận.");
    }

    const response = await apiClient.post(`/reactions/comments/${commentId}`, {
      type,
    });

    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể react bình luận.");
  }
};

export const removeCommentReaction = async (commentId: string) => {
  try {
    if (!commentId) {
      throw new Error("Thiếu commentId để gỡ reaction bình luận.");
    }

    const response = await apiClient.delete(`/reactions/comments/${commentId}`);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể gỡ reaction bình luận.");
  }
};

/* =========================
   REPORTS
========================= */

export const getMyReports = async () => {
  try {
    const response = await apiClient.get("/reports/my-reports");
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể lấy report của tôi.");
  }
};

export const createReport = async (payload: {
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  description?: string;
}) => {
  try {
    const response = await apiClient.post("/reports", payload);
    return response.data;
  } catch (error: any) {
    throw getError(error, "Không thể gửi report.");
  }
};

/* =========================
   SERVICE OBJECTS
========================= */

export const forumPostService = {
  getApprovedPosts,
  getPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
};

export const forumCommentService = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
};

export const forumReactionService = {
  reactToPost,
  removePostReaction,
  reactToComment,
  removeCommentReaction,
};

export const forumReportService = {
  getMyReports,
  createReport,
};

export default {
  getApprovedPosts,
  getPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  reactToPost,
  removePostReaction,
  reactToComment,
  removeCommentReaction,
  getMyReports,
  createReport,
  forumPostService,
  forumCommentService,
  forumReactionService,
  forumReportService,
};
import apiClient from "../services/api";

export type ReactionType =
  | "support"
  | "hug"
  | "encourage"
  | "thankyou";

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
  postType?: "forum" | "profile";
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

export type CreateCommentPayload = {
  postId: string;
  parentCommentId?: string | null;
  content: string;
  isAnonymous?: boolean;
  anonymousName?: string;
};

export type UpdateCommentPayload = {
  content: string;
  isAnonymous?: boolean;
  anonymousName?: string;
};

export type ReportTargetType = "post" | "comment";

export type ReportReason =
  | "toxic_language"
  | "harassment"
  | "spam"
  | "self_harm"
  | "other";

export type CreateReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
};


function getError(error: any, fallback: string) {
  if (error?.response?.data) {
    return error.response.data;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
}

export const getApprovedPosts = async (params?: {
  hashtag?: string;
  emotionStatus?: string;
  search?: string;
}) => {
  try {
    const response = await apiClient.get("/posts", {
      params,
    });

    return response.data;
  } catch (error: any) {
    console.log(
      "[GET APPROVED POSTS ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể lấy danh sách bài viết."
    );
  }
};

export const getPosts = getApprovedPosts;

export const getMyPosts = async () => {
  try {
    const response = await apiClient.get(
      "/posts/my-posts"
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[GET MY POSTS ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể lấy bài viết của tôi."
    );
  }
};

export const createPost = async (
  payload: CreatePostPayload
) => {
  try {
    if (!payload.content?.trim()) {
      throw new Error(
        "Nội dung bài viết không được để trống."
      );
    }

    const response = await apiClient.post("/posts", {
      ...payload,
      content: payload.content.trim(),
    });

    return response.data;
  } catch (error: any) {
    console.log(
      "[CREATE POST ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể tạo bài viết."
    );
  }
};

export const updatePost = async (
  postId: string,
  payload: UpdatePostPayload
) => {
  try {
    if (!postId?.trim()) {
      throw new Error(
        "Thiếu postId để cập nhật bài viết."
      );
    }

    const response = await apiClient.put(
      `/posts/${postId}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[UPDATE POST ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể cập nhật bài viết."
    );
  }
};

export const deletePost = async (
  postId: string
) => {
  try {
    if (!postId?.trim()) {
      throw new Error(
        "Thiếu postId để xóa bài viết."
      );
    }

    console.log(
      "[DELETE POST API]",
      `/posts/${postId}`
    );

    const response = await apiClient.delete(
      `/posts/${postId}`
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[DELETE POST ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể xóa bài viết."
    );
  }
};


export const getCommentsByPost = async (
  postId: string
) => {
  try {
    if (!postId?.trim()) {
      throw new Error(
        "Thiếu postId để lấy bình luận."
      );
    }

    const response = await apiClient.get(
      `/comments/post/${postId}`
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[GET COMMENTS ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể lấy bình luận."
    );
  }
};

export const createComment = async (
  payload: CreateCommentPayload
) => {
  try {
    if (!payload.postId?.trim()) {
      throw new Error(
        "Thiếu postId để bình luận."
      );
    }

    if (!payload.content?.trim()) {
      throw new Error(
        "Nội dung bình luận không được để trống."
      );
    }

    const response = await apiClient.post(
      "/comments",
      {
        ...payload,
        content: payload.content.trim(),
      }
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[CREATE COMMENT ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể bình luận."
    );
  }
};

export const updateComment = async (
  commentId: string,
  payload: UpdateCommentPayload
) => {
  try {
    if (!commentId?.trim()) {
      throw new Error(
        "Thiếu commentId để cập nhật bình luận."
      );
    }

    if (!payload.content?.trim()) {
      throw new Error(
        "Nội dung bình luận không được để trống."
      );
    }

    const response = await apiClient.put(
      `/comments/${commentId}`,
      {
        ...payload,
        content: payload.content.trim(),
      }
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[UPDATE COMMENT ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể cập nhật bình luận."
    );
  }
};

export const deleteComment = async (
  commentId: string
) => {
  try {
    if (!commentId?.trim()) {
      throw new Error(
        "Thiếu commentId để xóa bình luận."
      );
    }

    const response = await apiClient.delete(
      `/comments/${commentId}`
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[DELETE COMMENT ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể xóa bình luận."
    );
  }
};


export const reactToPost = async (
  postId: string,
  type: ReactionType
) => {
  try {
    if (!postId?.trim()) {
      throw new Error(
        "Thiếu postId để react bài viết."
      );
    }

    const response = await apiClient.post(
      `/reactions/posts/${postId}`,
      {
        type,
      }
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[REACT POST ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể react bài viết."
    );
  }
};

export const removePostReaction = async (
  postId: string
) => {
  try {
    if (!postId?.trim()) {
      throw new Error(
        "Thiếu postId để gỡ reaction bài viết."
      );
    }

    const response = await apiClient.delete(
      `/reactions/posts/${postId}`
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[REMOVE POST REACTION ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể gỡ reaction bài viết."
    );
  }
};


export const reactToComment = async (
  commentId: string,
  type: ReactionType
) => {
  try {
    if (!commentId?.trim()) {
      throw new Error(
        "Thiếu commentId để react bình luận."
      );
    }

    const response = await apiClient.post(
      `/reactions/comments/${commentId}`,
      {
        type,
      }
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[REACT COMMENT ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể react bình luận."
    );
  }
};

export const removeCommentReaction = async (
  commentId: string
) => {
  try {
    if (!commentId?.trim()) {
      throw new Error(
        "Thiếu commentId để gỡ reaction bình luận."
      );
    }

    const response = await apiClient.delete(
      `/reactions/comments/${commentId}`
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[REMOVE COMMENT REACTION ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể gỡ reaction bình luận."
    );
  }
};


export const getMyReports = async () => {
  try {
    const response = await apiClient.get(
      "/reports/my-reports"
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[GET MY REPORTS ERROR]",
      error?.response?.status,
      error?.response?.data || error?.message
    );

    throw getError(
      error,
      "Không thể lấy report của tôi."
    );
  }
};

export const createReport = async (
  payload: CreateReportPayload
) => {
  try {
    if (!payload.targetId?.trim()) {
      throw new Error(
        "Thiếu targetId để gửi báo cáo."
      );
    }

    if (
      payload.targetType !== "post" &&
      payload.targetType !== "comment"
    ) {
      throw new Error(
        "targetType không hợp lệ."
      );
    }

    const validReasons: ReportReason[] = [
      "toxic_language",
      "harassment",
      "spam",
      "self_harm",
      "other",
    ];

    if (!validReasons.includes(payload.reason)) {
      throw new Error(
        "Lý do báo cáo không hợp lệ."
      );
    }

    const requestBody: CreateReportPayload = {
      targetType: payload.targetType,
      targetId: payload.targetId.trim(),
      reason: payload.reason,
      description:
        payload.description?.trim() || undefined,
    };

    console.log(
      "[CREATE REPORT PAYLOAD]",
      requestBody
    );

    const response = await apiClient.post(
      "/reports",
      requestBody
    );

    console.log(
      "[CREATE REPORT RESPONSE]",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.log(
      "[CREATE REPORT ERROR]",
      {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      }
    );

    throw getError(
      error,
      "Không thể gửi report."
    );
  }
};

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

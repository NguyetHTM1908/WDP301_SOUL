import { API_BASE_URL } from "./config";

export type ReactionType = "support" | "hug" | "encourage" | "thankyou";

type GetApprovedPostsParams = {
  search?: string;
  hashtag?: string;
  emotionStatus?: string;
};

async function handleResponse(res: Response) {
  const text = await res.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.message || `API error ${res.status}`);
  }

  return data;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function jsonAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getApprovedPosts(params?: GetApprovedPostsParams) {
  const query = new URLSearchParams();

  if (params?.search?.trim()) {
    query.append("search", params.search.trim());
  }

  if (params?.hashtag && params.hashtag !== "all") {
    query.append("hashtag", params.hashtag);
  }

  if (params?.emotionStatus) {
    query.append("emotionStatus", params.emotionStatus);
  }

  const url = `${API_BASE_URL}/posts${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url);

  return handleResponse(res);
}

export async function getMyPosts(token: string) {
  const res = await fetch(`${API_BASE_URL}/posts/my-posts`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function createPost(token: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function updatePost(token: string, postId: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PUT",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function deletePost(token: string, postId: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function getComments(postId: string) {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    method: "GET",
  });

  return handleResponse(res);
}

export async function createComment(token: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/comments`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function updateComment(
  token: string,
  commentId: string,
  content: string
) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify({ content }),
  });

  return handleResponse(res);
}

export async function deleteComment(token: string, commentId: string) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function reactToPost(
  token: string,
  postId: string,
  type: ReactionType
) {
  const res = await fetch(`${API_BASE_URL}/reactions/posts/${postId}`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify({ type }),
  });

  return handleResponse(res);
}

export async function reactToComment(
  token: string,
  commentId: string,
  type: ReactionType
) {
  const res = await fetch(`${API_BASE_URL}/reactions/comments/${commentId}`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify({ type }),
  });

  return handleResponse(res);
}

export async function reportPost(
  token: string,
  postId: string,
  reason: string,
  description: string
) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify({
      targetType: "post",
      targetId: postId,
      reason,
      description,
    }),
  });

  return handleResponse(res);
}

export async function reportComment(
  token: string,
  commentId: string,
  reason: string,
  description: string
) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify({
      targetType: "comment",
      targetId: commentId,
      reason,
      description,
    }),
  });

  return handleResponse(res);
}

export async function getMyReports(token: string) {
  const res = await fetch(`${API_BASE_URL}/reports/my-reports`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function getTags() {
  const res = await fetch(`${API_BASE_URL}/tags`, {
    method: "GET",
  });

  return handleResponse(res);
}
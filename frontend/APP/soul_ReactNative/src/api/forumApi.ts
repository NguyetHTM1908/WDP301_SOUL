export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.110.50:5000/api";

console.log("API_BASE_URL =", API_BASE_URL);

export type ReactionType = "like" | "support" | "hug";

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

export async function getApprovedPosts() {
  const url = `${API_BASE_URL}/posts`;
  console.log("GET posts URL =", url);

  const res = await fetch(url);
  return handleResponse(res);
}

export async function getMyPosts(token: string) {
  const res = await fetch(`${API_BASE_URL}/posts/my-posts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
}

export async function createPost(token: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type }),
  });

  return handleResponse(res);
}

export async function getComments(postId: string) {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  return handleResponse(res);
}

export async function createComment(token: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  return handleResponse(res);
}

export async function deleteComment(token: string, commentId: string) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetType: "post",
      targetId: postId,
      reason,
      description,
    }),
  });

  return handleResponse(res);
}
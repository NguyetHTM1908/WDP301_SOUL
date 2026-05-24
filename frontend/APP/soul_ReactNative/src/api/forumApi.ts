const API_BASE_URL = "http://localhost:5000/api";

export type ReactionType = "like" | "support" | "hug";

export async function getApprovedPosts() {
  const res = await fetch(`${API_BASE_URL}/posts`);
  return res.json();
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

  return res.json();
}

export async function getCommentsByPost(postId: string) {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  return res.json();
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

  return res.json();
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

  return res.json();
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

  return res.json();
}
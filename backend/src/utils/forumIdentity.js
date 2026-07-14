const crypto = require("crypto");

const ANONYMOUS_AVATAR_URL =
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

function generateAnonymousIdentityId() {
  return `anon_${crypto.randomBytes(8).toString("hex")}`;
}

function normalizeName(value) {
  const name = String(value || "").trim();
  return name || null;
}

function getId(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  return (
    value?._id?.toString?.() ||
    value?.id?.toString?.() ||
    value?.toString?.() ||
    null
  );
}

function isUserAnonymousModeOn(user) {
  return Boolean(user?.anonymousModeEnabled);
}

async function ensureAnonymousIdentity(user, anonymousName) {
  if (!user) {
    const error = new Error("Không tìm thấy thông tin người dùng.");
    error.statusCode = 401;
    throw error;
  }

  let changed = false;

  if (!user.anonymousIdentityId) {
    user.anonymousIdentityId = generateAnonymousIdentityId();
    changed = true;
  }

  const inputAlias = normalizeName(anonymousName);

  if (inputAlias && inputAlias !== user.anonymousAlias) {
    user.anonymousAlias = inputAlias;
    changed = true;
  }

  const finalAlias = normalizeName(user.anonymousAlias);

  if (!finalAlias) {
    const error = new Error(
      "Vui lòng đặt tên ẩn danh trước khi sử dụng chế độ ẩn danh."
    );
    error.statusCode = 400;
    throw error;
  }

  if (user.anonymousAvatarUrl !== ANONYMOUS_AVATAR_URL) {
    user.anonymousAvatarUrl = ANONYMOUS_AVATAR_URL;
    changed = true;
  }

  user.anonymousModeUpdatedAt = new Date();

  if (changed && typeof user.save === "function") {
    await user.save();
  }

  return {
    id: user.anonymousIdentityId,
    fullName: finalAlias,
    avatarUrl: ANONYMOUS_AVATAR_URL,
    isAnonymous: true,
  };
}

function buildRealDisplayAuthor(user) {
  return {
    id: getId(user),
    fullName: user?.fullName || "SOUL User",
    avatarUrl: user?.avatarUrl || null,
    isAnonymous: false,
  };
}

async function buildDisplayAuthorFromCurrentMode(user, anonymousName) {
  if (isUserAnonymousModeOn(user)) {
    return ensureAnonymousIdentity(user, anonymousName);
  }

  return buildRealDisplayAuthor(user);
}

function buildAnonymousDisplayAuthorFromPost(postObj) {
  const anonymousName =
    postObj?.anonymousName ||
    postObj?.displayAuthor?.fullName ||
    postObj?.authorId?.anonymousAlias ||
    "Anonymous Soul";

  const anonymousId =
    postObj?.displayAuthor?.id ||
    postObj?.authorId?.anonymousIdentityId ||
    `anon_${getId(postObj) || "unknown"}`;

  return {
    _id: anonymousId,
    id: anonymousId,
    fullName: anonymousName,
    email: null,
    avatarUrl: ANONYMOUS_AVATAR_URL,
    anonymousAlias: anonymousName,
    isAnonymous: true,
  };
}

function buildRealDisplayAuthorFromPost(postObj) {
  const author = postObj?.authorId || {};

  const id =
    postObj?.displayAuthor?.id ||
    getId(author) ||
    getId(postObj?.displayAuthor);

  return {
    _id: id,
    id,
    fullName:
      postObj?.displayAuthor?.fullName ||
      author?.fullName ||
      "SOUL User",
    email: author?.email || null,
    avatarUrl:
      postObj?.displayAuthor?.avatarUrl ||
      author?.avatarUrl ||
      null,
    isAnonymous: false,
  };
}

function maskAnonymousPost(post) {
  const obj = post?.toObject ? post.toObject() : post;

  if (!obj) return obj;

  if (obj.isAnonymous) {
    const displayAuthor = buildAnonymousDisplayAuthorFromPost(obj);

    obj.displayAuthor = displayAuthor;
    obj.authorId = displayAuthor;

    return obj;
  }

  obj.displayAuthor = buildRealDisplayAuthorFromPost(obj);

  return obj;
}

function buildAnonymousDisplayAuthorFromComment(commentObj) {
  const anonymousName =
    commentObj?.anonymousName ||
    commentObj?.displayAuthor?.fullName ||
    commentObj?.authorId?.anonymousAlias ||
    "Anonymous Soul";

  const anonymousId =
    commentObj?.displayAuthor?.id ||
    commentObj?.authorId?.anonymousIdentityId ||
    `anon_${getId(commentObj) || "unknown"}`;

  return {
    _id: anonymousId,
    id: anonymousId,
    fullName: anonymousName,
    email: null,
    avatarUrl: ANONYMOUS_AVATAR_URL,
    anonymousAlias: anonymousName,
    isAnonymous: true,
  };
}

function buildRealDisplayAuthorFromComment(commentObj) {
  const author = commentObj?.authorId || {};

  const id =
    commentObj?.displayAuthor?.id ||
    getId(author) ||
    getId(commentObj?.displayAuthor);

  return {
    _id: id,
    id,
    fullName:
      commentObj?.displayAuthor?.fullName ||
      author?.fullName ||
      "SOUL User",
    email: author?.email || null,
    avatarUrl:
      commentObj?.displayAuthor?.avatarUrl ||
      author?.avatarUrl ||
      null,
    isAnonymous: false,
  };
}

function maskAnonymousComment(comment) {
  const obj = comment?.toObject ? comment.toObject() : comment;

  if (!obj) return obj;

  if (obj.isAnonymous) {
    const displayAuthor = buildAnonymousDisplayAuthorFromComment(obj);

    obj.displayAuthor = displayAuthor;
    obj.authorId = displayAuthor;

    return obj;
  }

  obj.displayAuthor = buildRealDisplayAuthorFromComment(obj);

  return obj;
}

module.exports = {
  ANONYMOUS_AVATAR_URL,
  generateAnonymousIdentityId,
  normalizeName,

  isUserAnonymousModeOn,
  ensureAnonymousIdentity,
  buildRealDisplayAuthor,
  buildDisplayAuthorFromCurrentMode,
  maskAnonymousPost,
  maskAnonymousComment,
};
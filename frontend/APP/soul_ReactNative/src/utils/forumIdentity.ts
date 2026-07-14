export const ANONYMOUS_AVATAR_URL =
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

export type ForumUser = {
  _id?: string;
  id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  anonymousModeEnabled?: boolean;
  anonymousIdentityId?: string | null;
  anonymousAlias?: string | null;
  anonymousAvatarUrl?: string | null;
};

export type ForumAuthor = {
  id: string | null;
  fullName: string;
  avatarUrl: string;
  isAnonymous: boolean;
};

const DEFAULT_AVATAR = "https://i.pravatar.cc/100?img=32";

export function getUserRealId(user?: ForumUser | null) {
  return user?._id?.toString?.() || user?.id?.toString?.() || null;
}

export function getUserAnonymousId(user?: ForumUser | null) {
  return user?.anonymousIdentityId?.toString?.() || null;
}

export function getCurrentForumIdentity(user?: ForumUser | null): ForumAuthor {
  const isAnonymous = Boolean(user?.anonymousModeEnabled);

  if (isAnonymous) {
    return {
      id: user?.anonymousIdentityId || null,
      fullName: user?.anonymousAlias || "Anonymous Soul",
      avatarUrl: ANONYMOUS_AVATAR_URL,
      isAnonymous: true,
    };
  }

  return {
    id: getUserRealId(user),
    fullName: user?.fullName || "SOUL User",
    avatarUrl: user?.avatarUrl || DEFAULT_AVATAR,
    isAnonymous: false,
  };
}

export function getForumAuthor(item: any): ForumAuthor {
  if (!item) {
    return {
      id: null,
      fullName: "SOUL User",
      avatarUrl: DEFAULT_AVATAR,
      isAnonymous: false,
    };
  }

  if (item.displayAuthor) {
    const isAnonymous = Boolean(
      item.displayAuthor.isAnonymous || item.isAnonymous
    );

    return {
      id: item.displayAuthor.id || item.displayAuthor._id || null,
      fullName:
        item.displayAuthor.fullName ||
        item.displayAuthor.anonymousAlias ||
        (isAnonymous ? "Anonymous Soul" : "SOUL User"),
      avatarUrl: isAnonymous
        ? ANONYMOUS_AVATAR_URL
        : item.displayAuthor.avatarUrl || DEFAULT_AVATAR,
      isAnonymous,
    };
  }

  if (item.isAnonymous) {
    return {
      id: item.anonymousIdentityId || null,
      fullName: item.anonymousName || "Anonymous Soul",
      avatarUrl: ANONYMOUS_AVATAR_URL,
      isAnonymous: true,
    };
  }

  if (typeof item.authorId === "object" && item.authorId) {
    return {
      id: item.authorId._id || item.authorId.id || null,
      fullName: item.authorId.fullName || "SOUL User",
      avatarUrl: item.authorId.avatarUrl || DEFAULT_AVATAR,
      isAnonymous: false,
    };
  }

  return {
    id: item.authorId || null,
    fullName: "SOUL User",
    avatarUrl: DEFAULT_AVATAR,
    isAnonymous: false,
  };
}

export function isOwnedByViewer(
  item: any,
  currentUser?: ForumUser | null,
  currentUserId?: string | null
) {
  if (item?.viewer?.isOwner === true || item?.isMine === true) {
    return true;
  }

  const author = getForumAuthor(item);
  const realId = currentUserId || getUserRealId(currentUser);
  const anonymousId = getUserAnonymousId(currentUser);

  return [realId, anonymousId]
    .filter(Boolean)
    .some((id) => String(id) === String(author.id));
}
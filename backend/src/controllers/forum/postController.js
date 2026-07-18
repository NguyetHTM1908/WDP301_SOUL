const Post = require("../../models/Post");
const forumModerationService = require(
  "../../services/forumModerationService"
);
const imageModerationService = require(
  "../../services/imageModerationService"
);
const forumIdentity = require(
  "../../utils/forumIdentity"
);

const {
  isUserAnonymousModeOn,
  buildRealDisplayAuthor,
  maskAnonymousPost,
} = forumIdentity;

const ANONYMOUS_AVATAR_URL =
  forumIdentity.ANONYMOUS_AVATAR_URL ||
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

const AUTHOR_POPULATE_FIELDS =
  "fullName email avatarUrl anonymousAlias anonymousIdentityId anonymousAvatarUrl anonymousModeEnabled";

function getAuthUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
}

function toId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value?._id?.toString?.() ||
    value?.id?.toString?.() ||
    value?.toString?.() ||
    null
  );
}

function normalizeHashtags(hashtags = []) {
  if (!Array.isArray(hashtags)) {
    return [];
  }

  return hashtags
    .map((tag) =>
      String(tag)
        .replace("#", "")
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

function normalizeMediaUrls(mediaUrls = []) {
  if (!Array.isArray(mediaUrls)) {
    return [];
  }

  return mediaUrls
    .map((media) => {
      const url = String(
        media?.url || ""
      ).trim();

      if (!url) {
        return null;
      }

      return {
        url,
        type:
          media?.type === "video"
            ? "video"
            : "image",
      };
    })
    .filter(Boolean);
}

function hasMediaChanged(
  oldMediaUrls = [],
  newMediaUrls = []
) {
  const normalize = (items) =>
    normalizeMediaUrls(items)
      .map((item) => ({
        url: item.url,
        type: item.type,
      }))
      .sort((a, b) =>
        `${a.type}:${a.url}`.localeCompare(
          `${b.type}:${b.url}`
        )
      );

  return (
    JSON.stringify(
      normalize(oldMediaUrls)
    ) !==
    JSON.stringify(
      normalize(newMediaUrls)
    )
  );
}

function buildRealDisplayAuthorSafe(user) {
  if (
    typeof buildRealDisplayAuthor ===
    "function"
  ) {
    return buildRealDisplayAuthor(user);
  }

  return {
    id: toId(user),
    fullName:
      user?.fullName ||
      "SOUL User",
    avatarUrl:
      user?.avatarUrl ||
      null,
    isAnonymous: false,
  };
}

function buildDisplayAuthorForPost(
  req,
  wantAnonymous,
  anonymousName
) {
  const user = req.user;
  const userId =
    getAuthUserId(req);

  if (wantAnonymous) {
    const alias =
      String(
        anonymousName || ""
      ).trim() ||
      String(
        user?.anonymousAlias || ""
      ).trim() ||
      "Anonymous Soul";

    const anonymousId =
      user?.anonymousIdentityId ||
      `anon_${String(
        userId || "unknown"
      )}`;

    return {
      id: anonymousId,
      fullName: alias,
      avatarUrl:
        ANONYMOUS_AVATAR_URL,
      isAnonymous: true,
    };
  }

  return buildRealDisplayAuthorSafe(
    user
  );
}

function fallbackMaskPost(post) {
  const obj = post?.toObject
    ? post.toObject()
    : post;

  if (!obj) {
    return obj;
  }

  if (obj.isAnonymous) {
    const anonymousName =
      obj.anonymousName ||
      obj.displayAuthor
        ?.fullName ||
      obj.authorId
        ?.anonymousAlias ||
      "Anonymous Soul";

    const anonymousId =
      obj.displayAuthor?.id ||
      obj.authorId
        ?.anonymousIdentityId ||
      `anon_${
        obj._id?.toString?.() ||
        "unknown"
      }`;

    const anonymousAuthor = {
      _id: anonymousId,
      id: anonymousId,
      fullName: anonymousName,
      email: null,
      avatarUrl:
        ANONYMOUS_AVATAR_URL,
      anonymousAlias:
        anonymousName,
      isAnonymous: true,
    };

    obj.displayAuthor =
      anonymousAuthor;

    obj.authorId =
      anonymousAuthor;

    return obj;
  }

  const author =
    obj.authorId || {};

  obj.displayAuthor = {
    _id:
      author?._id ||
      author?.id ||
      null,

    id:
      author?._id ||
      author?.id ||
      null,

    fullName:
      author?.fullName ||
      obj.displayAuthor
        ?.fullName ||
      "SOUL User",

    email:
      author?.email ||
      null,

    avatarUrl:
      author?.avatarUrl ||
      obj.displayAuthor
        ?.avatarUrl ||
      null,

    isAnonymous: false,
  };

  return obj;
}

function safeMaskPost(post) {
  try {
    if (
      typeof maskAnonymousPost ===
      "function"
    ) {
      return maskAnonymousPost(
        post
      );
    }

    return fallbackMaskPost(post);
  } catch (error) {
    console.error(
      "[MASK POST ERROR]",
      {
        postId: post?._id,
        message:
          error.message,
        stack:
          error.stack,
      }
    );

    return fallbackMaskPost(post);
  }
}

function resetPostApproval(post) {
  post.status = "pending";
  post.approvedAt = null;
  post.approvedBy = null;
  post.rejectedReason = null;
  post.isFlagged = false;
  post.toxicityLevel = "low";
}

function markPostApproved(post) {
  post.status = "approved";
  post.isFlagged = false;
  post.toxicityLevel = "low";
  post.approvedAt =
    new Date();
  post.approvedBy = null;
  post.rejectedReason = null;
}

function markPostForAdminReview(
  post,
  {
    riskLevel = "medium",
    reason,
  } = {}
) {
  post.status = "pending";
  post.isFlagged = true;

  post.toxicityLevel =
    riskLevel === "high"
      ? "high"
      : "medium";

  post.approvedAt = null;
  post.approvedBy = null;

  post.rejectedReason =
    reason ||
    "Nội dung cần quản trị viên xem xét.";
}

function getHighestRiskLevel(
  ...levels
) {
  if (
    levels.includes("high")
  ) {
    return "high";
  }

  if (
    levels.includes("medium")
  ) {
    return "medium";
  }

  return "low";
}

function isTextReviewRequired(
  moderation
) {
  return Boolean(
    moderation
      ?.isViolationSuspected ||
    moderation
      ?.needsAdminReview ||
    moderation?.riskLevel ===
      "high" ||
    moderation?.severity ===
      "high"
  );
}

function isImageReviewRequired(
  imageModeration
) {
  return Boolean(
    imageModeration
      ?.isViolationSuspected ||
    imageModeration
      ?.needsAdminReview ||
    imageModeration?.status ===
      "blocked" ||
    imageModeration?.status ===
      "review_required"
  );
}

/**
 * Quyết định cuối cùng cho bài viết.
 *
 * safe:
 * - approved
 * - isFlagged = false
 *
 * review_required / blocked:
 * - pending
 * - isFlagged = true
 *
 * Vision AI lỗi:
 * - không tự động coi là nội dung nguy hiểm
 */
function applyFinalModerationDecision(
  post,
  {
    moderation,
    imageModeration,
    textModerationFailed = false,
    contentWasRechecked = true,
  } = {}
) {
  const textNeedsReview =
    textModerationFailed ||
    (
      contentWasRechecked &&
      isTextReviewRequired(
        moderation
      )
    );

  const imageNeedsReview =
    isImageReviewRequired(
      imageModeration
    );

  if (
    textNeedsReview ||
    imageNeedsReview
  ) {
    const riskLevel =
      getHighestRiskLevel(
        textModerationFailed
          ? "medium"
          : moderation
              ?.riskLevel ||
            moderation
              ?.severity ||
            "low",

        imageModeration
          ?.overallRiskLevel ||
          "low"
      );

    const reasons = [
      textModerationFailed
        ? "Không thể kiểm duyệt văn bản tự động."
        : moderation?.reason,

      imageNeedsReview
        ? imageModeration
            ?.reason ||
          "Hình ảnh cần quản trị viên xem xét."
        : null,
    ].filter(Boolean);

    markPostForAdminReview(
      post,
      {
        riskLevel,
        reason:
          reasons.join(" ") ||
          "Nội dung cần quản trị viên xem xét.",
      }
    );

    return true;
  }

  markPostApproved(post);

  return false;
}

async function moderateImagesAndApplyToPost(
  post
) {
  const imageModeration =
    await imageModerationService
      .moderatePostImages(
        post.mediaUrls
      );

  post.imageModeration =
    imageModeration;

  await post.save();

  return imageModeration;
}

/**
 * Lỗi kỹ thuật của Vision AI không phải là bằng chứng
 * hình ảnh nguy hiểm.
 */
async function handleImageModerationFailure(
  post,
  message
) {
  post.imageModeration = {
    checked: false,

    status: "failed",

    overallRiskLevel:
      "low",

    isViolationSuspected:
      false,

    needsAdminReview:
      false,

    reason: null,

    results: [],

    checkedAt:
      new Date(),
  };

  console.error(
    "[IMAGE MODERATION TECHNICAL FAILURE]",
    message
  );

  await post.save();

  return post.imageModeration;
}

exports.createPost = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
        });
    }

    const {
      content,
      mediaUrls,
      emotionStatus,
      hashtags,
      isAnonymous,
      anonymousName,
      visibility,
      postType,
    } = req.body;

    if (
      !content ||
      !String(content).trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Nội dung bài viết không được để trống.",
        });
    }

    const anonymousMode =
      isAnonymous !== undefined
        ? Boolean(
            isAnonymous
          )
        : typeof isUserAnonymousModeOn ===
            "function"
          ? isUserAnonymousModeOn(
              req.user
            )
          : Boolean(
              req.user
                ?.anonymousModeEnabled
            );

    const displayAuthor =
      buildDisplayAuthorForPost(
        req,
        anonymousMode,
        anonymousName
      );

    const normalizedMediaUrls =
      normalizeMediaUrls(
        mediaUrls
      );

    const post =
      await Post.create({
        authorId:
          userId,

        displayAuthor,

        content:
          String(
            content
          ).trim(),

        mediaUrls:
          normalizedMediaUrls,

        emotionStatus:
          emotionStatus ||
          "neutral",

        hashtags:
          normalizeHashtags(
            hashtags || []
          ),

        isAnonymous:
          anonymousMode,

        anonymousName:
          anonymousMode
            ? displayAuthor
                .fullName
            : null,

        visibility:
          visibility ||
          "public",

        postType:
          postType ||
          "forum",

        status:
          "pending",

        approvedAt:
          null,

        approvedBy:
          null,

        rejectedReason:
          null,

        isFlagged:
          false,

        toxicityLevel:
          "low",
      });

    let moderation = null;
    let imageModeration = null;

    let textModerationFailed =
      false;

    const moderationWarnings =
      [];

    try {
      moderation =
        await forumModerationService
          .moderatePostAfterCreate(
            post
          );
    } catch (error) {
      textModerationFailed =
        true;

      moderationWarnings.push(
        `Text moderation: ${error.message}`
      );

      console.error(
        "Forum text moderation failed:",
        error
      );
    }

    try {
      imageModeration =
        await moderateImagesAndApplyToPost(
          post
        );
    } catch (error) {
      moderationWarnings.push(
        `Image moderation: ${error.message}`
      );

      console.error(
        "Forum image moderation failed:",
        error
      );

      imageModeration =
        await handleImageModerationFailure(
          post,
          "Không thể kiểm duyệt hình ảnh khi tạo bài."
        );
    }

    const requiresReview =
      applyFinalModerationDecision(
        post,
        {
          moderation,
          imageModeration,
          textModerationFailed,
          contentWasRechecked:
            true,
        }
      );

    await post.save();

    const moderationWarning =
      moderationWarnings.length >
      0
        ? moderationWarnings.join(
            " | "
          )
        : null;

    const imageCheckFailed =
      imageModeration?.status ===
      "failed";

    const updatedPost =
      await Post.findById(
        post._id
      ).populate(
        "authorId",
        AUTHOR_POPULATE_FIELDS
      );

    let message =
      "Tạo bài viết thành công.";

    if (requiresReview) {
      message =
        "Tạo bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm.";
    } else if (
      imageCheckFailed
    ) {
      message =
        "Tạo bài viết thành công. Hệ thống chưa thể kiểm tra hình ảnh tự động.";
    }

    return res
      .status(201)
      .json({
        success: true,

        message,

        data:
          safeMaskPost(
            updatedPost ||
              post
          ),

        moderation,

        imageModeration,

        moderationWarning,
      });
  } catch (error) {
    console.error(
      "CREATE POST ERROR FULL:",
      error
    );

    return res
      .status(
        error.statusCode ||
        500
      )
      .json({
        success: false,

        message:
          error.message ||
          "Không thể tạo bài viết.",

        errorName:
          error.name,

        errorCode:
          error.code,

        errorErrors:
          error.errors,
      });
  }
};

exports.getApprovedPosts =
  async (req, res) => {
    try {
      const {
        hashtag,
        emotionStatus,
        search,
      } = req.query;

      const filter = {
        postType:
          "forum",

        status:
          "approved",

        visibility:
          "public",

        isFlagged: {
          $ne: true,
        },
      };

      if (
        hashtag &&
        String(
          hashtag
        ).trim()
      ) {
        filter.hashtags =
          String(
            hashtag
          )
            .replace(
              "#",
              ""
            )
            .trim()
            .toLowerCase();
      }

      if (
        emotionStatus &&
        String(
          emotionStatus
        ).trim()
      ) {
        filter.emotionStatus =
          String(
            emotionStatus
          )
            .trim()
            .toLowerCase();
      }

      const keyword =
        String(
          search || ""
        ).trim();

      if (keyword) {
        filter.$or = [
          {
            content: {
              $regex:
                keyword,

              $options:
                "i",
            },
          },

          {
            hashtags: {
              $regex:
                keyword,

              $options:
                "i",
            },
          },

          {
            anonymousName: {
              $regex:
                keyword,

              $options:
                "i",
            },
          },
        ];
      }

      const posts =
        await Post.find(
          filter
        )
          .populate(
            "authorId",
            AUTHOR_POPULATE_FIELDS
          )
          .sort({
            createdAt:
              -1,
          });

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Lấy danh sách bài viết thành công.",

          data:
            posts.map(
              safeMaskPost
            ),
        });
    } catch (error) {
      console.error(
        "GET APPROVED POSTS ERROR FULL:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Không thể lấy danh sách bài viết.",

          errorName:
            error.name,

          errorCode:
            error.code,

          errorErrors:
            error.errors,
        });
    }
  };

exports.getPostDetail =
  async (req, res) => {
    try {
      const userId =
        getAuthUserId(req);

      const post =
        await Post.findById(
          req.params.id
        ).populate(
          "authorId",
          AUTHOR_POPULATE_FIELDS
        );

      if (
        !post ||
        post.status ===
          "deleted"
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Không tìm thấy bài viết.",
          });
      }

      const isAdmin =
        req.user?.role ===
        "admin";

      const authorId =
        toId(
          post.authorId
        );

      const isAuthor =
        Boolean(
          userId &&
          authorId &&
          authorId ===
            String(
              userId
            )
        );

      const isPublicApproved =
        post.status ===
          "approved" &&
        post.visibility ===
          "public" &&
        post.isFlagged !==
          true;

      if (
        !isPublicApproved &&
        !isAuthor &&
        !isAdmin
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Bạn không có quyền xem bài viết này.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Lấy chi tiết bài viết thành công.",

          data:
            safeMaskPost(
              post
            ),
        });
    } catch (error) {
      console.error(
        "GET POST DETAIL ERROR FULL:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Không thể lấy chi tiết bài viết.",

          errorName:
            error.name,

          errorCode:
            error.code,

          errorErrors:
            error.errors,
        });
    }
  };

exports.getMyPosts =
  async (req, res) => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
          });
      }

      const posts =
        await Post.find({
          authorId:
            userId,

          status: {
            $ne:
              "deleted",
          },

          postType: {
            $ne:
              "profile",
          },
        })
          .populate(
            "authorId",
            AUTHOR_POPULATE_FIELDS
          )
          .sort({
            createdAt:
              -1,
          });

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Lấy bài viết của tôi thành công.",

          data:
            posts.map(
              safeMaskPost
            ),
        });
    } catch (error) {
      console.error(
        "GET MY POSTS ERROR FULL:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Không thể lấy bài viết của tôi.",

          errorName:
            error.name,

          errorCode:
            error.code,

          errorErrors:
            error.errors,
        });
    }
  };

exports.updateMyPost =
  async (req, res) => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
          });
      }

      const post =
        await Post.findById(
          req.params.id
        );

      if (
        !post ||
        post.status ===
          "deleted"
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Không tìm thấy bài viết.",
          });
      }

      if (
        toId(
          post.authorId
        ) !==
        String(
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Bạn không có quyền sửa bài viết này.",
          });
      }

      const {
        content,
        mediaUrls,
        emotionStatus,
        hashtags,
        isAnonymous,
        anonymousName,
        visibility,
      } = req.body;

      let contentChanged =
        false;

      let mediaChanged =
        false;

      if (
        content !== undefined
      ) {
        const normalizedContent =
          String(
            content || ""
          ).trim();

        if (!normalizedContent) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Nội dung bài viết không được để trống.",
            });
        }

        if (
          normalizedContent !==
          post.content
        ) {
          post.content =
            normalizedContent;

          contentChanged =
            true;
        }
      }

      if (
        mediaUrls !== undefined
      ) {
        const normalizedMediaUrls =
          normalizeMediaUrls(
            mediaUrls
          );

        mediaChanged =
          hasMediaChanged(
            post.mediaUrls,
            normalizedMediaUrls
          );

        post.mediaUrls =
          normalizedMediaUrls;
      }

      if (
        emotionStatus !==
        undefined
      ) {
        post.emotionStatus =
          emotionStatus ||
          "neutral";
      }

      if (
        hashtags !== undefined
      ) {
        post.hashtags =
          normalizeHashtags(
            hashtags
          );
      }

      if (
        isAnonymous !== undefined
      ) {
        const wantAnonymous =
          Boolean(
            isAnonymous
          );

        const displayAuthor =
          buildDisplayAuthorForPost(
            req,
            wantAnonymous,
            anonymousName
          );

        post.isAnonymous =
          wantAnonymous;

        post.anonymousName =
          wantAnonymous
            ? displayAuthor
                .fullName
            : null;

        post.displayAuthor =
          displayAuthor;
      }

      if (
        visibility !==
        undefined
      ) {
        post.visibility =
          visibility ||
          "public";
      }

      const moderationRelevantChanged =
        contentChanged ||
        mediaChanged;

      if (
        moderationRelevantChanged
      ) {
        resetPostApproval(
          post
        );
      }

      post.editedAt =
        new Date();

      await post.save();

      let moderation = null;
      let imageModeration = null;

      let textModerationFailed =
        false;

      const moderationWarnings =
        [];

      if (contentChanged) {
        try {
          moderation =
            await forumModerationService
              .moderatePostAfterCreate(
                post
              );
        } catch (error) {
          textModerationFailed =
            true;

          moderationWarnings.push(
            `Text moderation: ${error.message}`
          );

          console.error(
            "Forum text moderation failed:",
            error
          );
        }
      }

      if (mediaChanged) {
        try {
          imageModeration =
            await moderateImagesAndApplyToPost(
              post
            );
        } catch (error) {
          moderationWarnings.push(
            `Image moderation: ${error.message}`
          );

          console.error(
            "Forum image moderation failed:",
            error
          );

          imageModeration =
            await handleImageModerationFailure(
              post,
              "Không thể kiểm duyệt hình ảnh sau khi cập nhật."
            );
        }
      } else {
        imageModeration =
          post.imageModeration ||
          null;
      }

      let requiresReview =
        post.isFlagged ===
        true;

      if (
        moderationRelevantChanged
      ) {
        requiresReview =
          applyFinalModerationDecision(
            post,
            {
              moderation,
              imageModeration,
              textModerationFailed,

              contentWasRechecked:
                contentChanged,
            }
          );

        await post.save();
      }

      const moderationWarning =
        moderationWarnings.length >
        0
          ? moderationWarnings.join(
              " | "
            )
          : null;

      const imageCheckFailed =
        mediaChanged &&
        imageModeration?.status ===
          "failed";

      const updatedPost =
        await Post.findById(
          post._id
        ).populate(
          "authorId",
          AUTHOR_POPULATE_FIELDS
        );

      let message =
        "Cập nhật bài viết thành công.";

      if (requiresReview) {
        message =
          "Cập nhật bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm.";
      } else if (
        imageCheckFailed
      ) {
        message =
          "Cập nhật bài viết thành công. Hệ thống chưa thể kiểm tra hình ảnh tự động.";
      }

      return res
        .status(200)
        .json({
          success: true,

          message,

          data:
            safeMaskPost(
              updatedPost ||
                post
            ),

          moderation,

          imageModeration,

          moderationWarning,
        });
    } catch (error) {
      console.error(
        "UPDATE POST ERROR FULL:",
        error
      );

      return res
        .status(
          error.statusCode ||
          500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Không thể cập nhật bài viết.",

          errorName:
            error.name,

          errorCode:
            error.code,

          errorErrors:
            error.errors,
        });
    }
  };

exports.deleteMyPost =
  async (req, res) => {
    try {
      const userId =
        getAuthUserId(req);

      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
          });
      }

      const post =
        await Post.findById(
          req.params.id
        );

      if (
        !post ||
        post.status ===
          "deleted"
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Không tìm thấy bài viết.",
          });
      }

      if (
        toId(
          post.authorId
        ) !==
        String(
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Bạn không có quyền xóa bài viết này.",
          });
      }

      post.status =
        "deleted";

      post.visibility =
        "private";

      post.rejectedReason =
        "User deleted this post.";

      await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Xóa bài viết thành công.",

          data: {
            postId:
              post._id,

            status:
              post.status,
          },
        });
    } catch (error) {
      console.error(
        "DELETE POST ERROR FULL:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Không thể xóa bài viết.",

          errorName:
            error.name,

          errorCode:
            error.code,

          errorErrors:
            error.errors,
        });
    }
  };
const User = require("../models/User");
const Post = require("../models/Post");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const Friendship = require("../models/Friendship");
const FriendRequest = require("../models/FriendRequest");
const { createNotification } = require("../services/notificationService");

// Lấy thông tin chi tiết một người dùng (chỉ người dùng có role là 'user' mới có trang cá nhân)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("fullName email phone gender avatarUrl bio moodReputation moodReputationScore role status createdAt");
    
    if (!user || user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ người dùng thường (user) mới có trang cá nhân.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin người dùng: " + error.message,
    });
  }
};

// Lấy danh sách bài viết của một người dùng cụ thể
exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({
      authorId: id,
      status: "approved",
      visibility: "public",
      isFlagged: false,
      postType: "profile"
    })
    .populate("authorId", "fullName email avatarUrl anonymousAlias")
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy bài viết của người dùng: " + error.message,
    });
  }
};

// Lấy danh sách bạn bè thực sự của một người dùng từ collection friendships
exports.getUserFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Tìm các mối quan hệ bạn bè active của user này
    const friendships = await Friendship.find({
      $or: [
        { userAId: userId },
        { userBId: userId }
      ],
      status: "active"
    });

    // Trích xuất các ID bạn bè
    const friendIds = friendships.map(f => 
      f.userAId.toString() === userId.toString() ? f.userBId : f.userAId
    );

    // Tìm thông tin của các bạn bè đó (chỉ lấy user)
    const friends = await User.find({
      _id: { $in: friendIds },
      role: { $ne: "admin" }
    }).select("fullName email avatarUrl bio moodReputation");

    return res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách bạn bè: " + error.message,
    });
  }
};

// ─── Helper: Xác định thứ tự ưu tiên mood theo trạng thái cảm xúc người dùng ───
function getPriorityOrder(userMood) {
  if (userMood === "negative") return ["neutral", "positive", "negative"];
  if (userMood === "positive") return ["positive", "neutral", "negative"];
  return ["neutral", "positive", "negative"]; // neutral (mặc định)
}

// ─── Helper: Emotion Score (0–40 điểm) ───────────────────────────────────────
function calcEmotionScore(candidateMood, priorityOrder) {
  const idx = priorityOrder.indexOf(candidateMood);
  if (idx === 0) return 40;
  if (idx === 1) return 25;
  return 10; // idx === 2 (ưu tiên thấp nhất)
}

// ─── Helper: Topic Score (0–40 điểm) ─────────────────────────────────────────
// Kết hợp interests[] (ưu tiên) + hashtags từ Posts (thực tế hành vi)
function calcTopicScore(userTopics, candidateTopics) {
  if (!userTopics.length || !candidateTopics.length) return 20; // neutral fallback
  const userSet = new Set(userTopics);
  const shared = candidateTopics.filter((t) => userSet.has(t)).length;
  return Math.round((shared / Math.max(userTopics.length, candidateTopics.length)) * 40);
}

// ─── Helper: Interaction Score (0–20 điểm) ───────────────────────────────────
function calcInteractionScore(mutualCount) {
  return Math.round(Math.min(mutualCount, 5) / 5 * 20);
}

// Thuật toán gợi ý kết bạn dựa trên priority ordering + Match Score 3 chiều
exports.getFriendRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    // 1. Lấy thông tin cảm xúc + interests của current user
    const [currentEmotionProfile, currentUser] = await Promise.all([
      UserEmotionProfile.findOne({ userId: currentUserId }),
      User.findById(currentUserId).select("interests moodReputation"),
    ]);

    // Ưu tiên EmotionProfile.currentSentiment, fallback về User.moodReputation
    const userMood =
      (currentEmotionProfile && currentEmotionProfile.currentSentiment) ||
      currentUser?.moodReputation ||
      "neutral";
    const priorityOrder = getPriorityOrder(userMood);

    // interests[] từ profile (ưu tiên 1) + hashtags từ posts gần đây (ưu tiên 2)
    const recentUserPosts = await Post.find({
      authorId: currentUserId,
      status: "approved",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).select("hashtags").limit(20);

    const postHashtags = recentUserPosts.flatMap((p) => p.hashtags || []);
    const userTopics = [
      ...new Set([...(currentUser?.interests || []), ...postHashtags]),
    ].slice(0, 20);

    // 2. Loại trừ: chính mình + đã là bạn (dùng Friendship model)
    const existingFriendships = await Friendship.find({
      $or: [{ userAId: currentUserId }, { userBId: currentUserId }],
      status: "active",
    });
    const friendIds = existingFriendships.map((f) =>
      f.userAId.toString() === currentUserId.toString()
        ? f.userBId.toString()
        : f.userAId.toString()
    );
    const excludedIds = new Set([currentUserId.toString(), ...friendIds]);

    // 3. Lấy TẤT CẢ user eligible (không phân biệt có EmotionProfile hay không)
    const allCandidateUsers = await User.find({
      _id: { $nin: Array.from(excludedIds) },
      role: { $ne: "admin" },
      status: { $ne: "blocked" },
    })
      .select("fullName email avatarUrl bio moodReputation moodReputationScore interests")
      .limit(100);

    const allCandidateIds = allCandidateUsers.map((u) => u._id);

    // 4. Lookup EmotionProfile cho các candidates (dùng currentSentiment nếu có, nếu không fallback moodReputation)
    const emotionProfiles = await UserEmotionProfile.find({
      userId: { $in: allCandidateIds },
    });
    const emotionProfileMap = {};
    emotionProfiles.forEach((p) => {
      emotionProfileMap[p.userId.toString()] = p;
    });

    // 5. Lấy hashtags từ posts của candidates (30 ngày gần nhất)
    const candidatePosts = await Post.find({
      authorId: { $in: allCandidateIds },
      status: "approved",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).select("authorId hashtags");

    const candidateHashtagsMap = {};
    candidatePosts.forEach((p) => {
      const uid = p.authorId.toString();
      if (!candidateHashtagsMap[uid]) candidateHashtagsMap[uid] = [];
      candidateHashtagsMap[uid].push(...(p.hashtags || []));
    });

    // 6. Đếm tương tác qua lại
    const [myPostsReactedByCandidates, candidatePostsReactedByMe] = await Promise.all([
      Post.find({
        authorId: currentUserId,
        "reactions.userId": { $in: allCandidateIds },
      }).select("reactions"),
      Post.find({
        authorId: { $in: allCandidateIds },
        "reactions.userId": currentUserId,
      }).select("authorId"),
    ]);

    const interactionCountMap = {};
    const allCandidateIdStrings = new Set(allCandidateIds.map((id) => id.toString()));
    myPostsReactedByCandidates.forEach((post) => {
      post.reactions.forEach((r) => {
        const uid = r.userId.toString();
        if (allCandidateIdStrings.has(uid)) {
          interactionCountMap[uid] = (interactionCountMap[uid] || 0) + 1;
        }
      });
    });
    candidatePostsReactedByMe.forEach((post) => {
      const uid = post.authorId.toString();
      interactionCountMap[uid] = (interactionCountMap[uid] || 0) + 1;
    });

    // 7. Lấy pending friendship requests để biết trạng thái
    const pendingRequests = await FriendRequest.find({
      $or: [
        { requesterId: currentUserId },
        { receiverId: currentUserId },
      ],
      status: "pending",
    });
    const pendingMap = {};
    pendingRequests.forEach((r) => {
      if (r.requesterId.toString() === currentUserId.toString()) {
        pendingMap[r.receiverId.toString()] = "pending_sent";
      } else {
        pendingMap[r.requesterId.toString()] = "pending_received";
      }
    });

    // 8. Tính Match Score cho từng candidate
    const scored = allCandidateUsers.map((u) => {
      const uid = u._id.toString();
      const ep = emotionProfileMap[uid];

      // Ưu tiên EmotionProfile.currentSentiment, fallback về User.moodReputation
      const candidateMood =
        (ep && ep.currentSentiment) || u.moodReputation || "neutral";

      // Topic: interests[] + hashtags từ posts (loại trùng)
      const candidateTopics = [
        ...new Set([
          ...(u.interests || []),
          ...(candidateHashtagsMap[uid] || []),
        ]),
      ].slice(0, 20);

      const priorityGroup = priorityOrder.indexOf(candidateMood); // 0, 1, hoặc 2
      const emotionScore = calcEmotionScore(candidateMood, priorityOrder);
      const topicScore = calcTopicScore(userTopics, candidateTopics);
      const interactionScore = calcInteractionScore(interactionCountMap[uid] || 0);
      const matchScore = emotionScore + topicScore + interactionScore;

      const userTopicSet = new Set(userTopics);
      const sharedTags = candidateTopics.filter((t) => userTopicSet.has(t)).slice(0, 5);

      return {
        ...u.toObject(),
        friendshipStatus: pendingMap[uid] || "none",
        matchScore,
        priorityGroup,
        emotionScore,
        topicScore,
        interactionScore,
        sharedTags,
        currentSentiment: candidateMood,
      };
    });

    // 9. Sort: priorityGroup ASC → matchScore DESC → top 10
    scored.sort((a, b) => {
      if (a.priorityGroup !== b.priorityGroup) return a.priorityGroup - b.priorityGroup;
      return b.matchScore - a.matchScore;
    });

    return res.status(200).json({
      success: true,
      data: scored.slice(0, 50),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy gợi ý kết bạn: " + error.message,
    });
  }
};



// Lấy trạng thái kết bạn hiện tại giữa user đang đăng nhập và target user
exports.getFriendshipStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(200).json({
        success: true,
        status: "self"
      });
    }

    // 1. Kiểm tra xem có quan hệ bạn bè active không
    const friendship = await Friendship.findOne({
      $or: [
        { userAId: currentUserId, userBId: targetUserId },
        { userAId: targetUserId, userBId: currentUserId }
      ],
      status: "active"
    });

    if (friendship) {
      return res.status(200).json({
        success: true,
        status: "friends"
      });
    }

    // 2. Kiểm tra xem có yêu cầu kết bạn đang chờ không
    const request = await FriendRequest.findOne({
      $or: [
        { requesterId: currentUserId, receiverId: targetUserId },
        { requesterId: targetUserId, receiverId: currentUserId }
      ],
      status: "pending"
    });

    if (request) {
      if (request.requesterId.toString() === currentUserId.toString()) {
        return res.status(200).json({
          success: true,
          status: "pending_sent"
        });
      } else {
        return res.status(200).json({
          success: true,
          status: "pending_received"
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: "none"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy trạng thái kết bạn: " + error.message
    });
  }
};

// Lấy danh sách các yêu cầu kết bạn đang chờ (incoming pending requests)
exports.getPendingFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const requests = await FriendRequest.find({
      receiverId: currentUserId,
      status: "pending"
    }).populate("requesterId", "fullName email avatarUrl bio moodReputation");

    const formattedRequests = requests
      .filter(r => r.requesterId !== null)
      .map(r => ({
        _id: r._id,
        requester: r.requesterId,
        createdAt: r.createdAt
      }));

    return res.status(200).json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách lời mời kết bạn: " + error.message
    });
  }
};

// Thực hiện hành động kết bạn (Thêm, Hủy, Chấp nhận)
exports.friendshipAction = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.id;
    const { action } = req.body; // "add", "cancel", "accept", "remove"

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể kết bạn với chính mình."
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể kết bạn với người dùng thường (user)."
      });
    }

    if (action === "add") {
      // Gửi yêu cầu kết bạn
      await FriendRequest.findOneAndUpdate(
        { requesterId: currentUserId, receiverId: targetUserId },
        {
          $set: {
            requesterId: currentUserId,
            receiverId: targetUserId,
            status: "pending",
            source: "manual",
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true, new: true }
      );
      // Tạo thông báo cho người nhận lời mời kết bạn
      const senderUser = await User.findById(currentUserId).select("fullName");
      createNotification(
        targetUserId,
        "friend_request",
        "Lời mời kết bạn mới",
        `${senderUser?.fullName || "Ai đó"} đã gửi lời mời kết bạn với bạn.`,
        { type: "user", id: currentUserId }
      );

      return res.status(200).json({
        success: true,
        message: "Đã gửi lời mời kết bạn.",
        status: "pending_sent"
      });
    }

    if (action === "cancel") {
      // Hủy yêu cầu kết bạn đã gửi
      await FriendRequest.updateOne(
        { requesterId: currentUserId, receiverId: targetUserId, status: "pending" },
        { $set: { status: "cancelled", respondedAt: new Date() } }
      );
      return res.status(200).json({
        success: true,
        message: "Đã hủy lời mời kết bạn.",
        status: "none"
      });
    }

    if (action === "accept") {
      // Chấp nhận lời mời kết bạn từ đối phương
      const request = await FriendRequest.findOneAndUpdate(
        { requesterId: targetUserId, receiverId: currentUserId, status: "pending" },
        { $set: { status: "accepted", respondedAt: new Date() } },
        { new: true }
      );

      if (!request) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn cần chấp nhận."
        });
      }

      // Tạo Friendship mới (userAId < userBId để đồng bộ index duy nhất)
      const userAId = currentUserId.toString() < targetUserId.toString() ? currentUserId : targetUserId;
      const userBId = currentUserId.toString() < targetUserId.toString() ? targetUserId : currentUserId;

      await Friendship.findOneAndUpdate(
        { userAId, userBId },
        {
          $set: {
            userAId,
            userBId,
            status: "active",
            createdFromRequestId: request._id,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      // Tạo thông báo cho người gửi lời mời ban đầu (giờ đã được chấp nhận)
      const accepterUser = await User.findById(currentUserId).select("fullName");
      createNotification(
        targetUserId,
        "friend_accepted",
        "Lời mời kết bạn đã được chấp nhận",
        `${accepterUser?.fullName || "Ai đó"} đã chấp nhận lời mời kết bạn của bạn. Hai bạn giờ là bạn bè! 🎉`,
        { type: "user", id: currentUserId }
      );

      return res.status(200).json({
        success: true,
        message: "Đã đồng ý kết bạn.",
        status: "friends"
      });
    }

    if (action === "decline") {
      // Từ chối yêu cầu kết bạn từ đối phương
      await FriendRequest.updateOne(
        { requesterId: targetUserId, receiverId: currentUserId, status: "pending" },
        { $set: { status: "rejected", respondedAt: new Date() } }
      );
      return res.status(200).json({
        success: true,
        message: "Đã từ chối lời mời kết bạn.",
        status: "none"
      });
    }

    if (action === "remove") {
      // Hủy kết bạn
      const userAId = currentUserId.toString() < targetUserId.toString() ? currentUserId : targetUserId;
      const userBId = currentUserId.toString() < targetUserId.toString() ? targetUserId : currentUserId;

      await Friendship.updateOne(
        { userAId, userBId, status: "active" },
        { $set: { status: "removed", updatedAt: new Date() } }
      );

      // Cập nhật cả các yêu cầu kết bạn cũ về cancelled
      await FriendRequest.updateMany(
        {
          $or: [
            { requesterId: currentUserId, receiverId: targetUserId },
            { requesterId: targetUserId, receiverId: currentUserId }
          ],
          status: "accepted"
        },
        { $set: { status: "cancelled" } }
      );

      return res.status(200).json({
        success: true,
        message: "Đã hủy kết bạn.",
        status: "none"
      });
    }

    return res.status(400).json({
      success: false,
      message: "Hành động không hợp lệ."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý kết bạn: " + error.message
    });
  }
};

// Helper: chuẩn hóa chuỗi, bỏ dấu tiếng Việt, lowercase
function normalizeText(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

// Tìm kiếm người dùng theo tên hoặc email (không phân biệt hoa thường, dấu tiếng Việt)
exports.searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const q = (req.query.q || "").trim();

    if (!q || q.length < 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    const normalizedQ = normalizeText(q);
    const words = normalizedQ.split(/\s+/).filter(Boolean);

    // Lấy rộng để filter JS - MongoDB regex không xử lý được dấu tiếng Việt
    const allUsers = await User.find({
      _id: { $ne: currentUserId },
      role: { $ne: "admin" },
      status: { $ne: "blocked" },
    })
      .select("fullName email avatarUrl bio moodReputation")
      .limit(200);

    // Filter: tất cả từ trong query phải xuất hiện trong tên hoặc email (sau normalize)
    const matched = allUsers.filter((u) => {
      const haystack = normalizeText(u.fullName) + " " + normalizeText(u.email);
      return words.every((word) => haystack.includes(word));
    });

    const topMatched = matched.slice(0, 20);

    if (topMatched.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const userIds = topMatched.map((u) => u._id);

    // Lấy danh sách bạn bè hiện tại
    const friendships = await Friendship.find({
      $or: [{ userAId: currentUserId }, { userBId: currentUserId }],
      status: "active",
    });
    const friendIdSet = new Set(
      friendships.map((f) =>
        f.userAId.toString() === currentUserId.toString()
          ? f.userBId.toString()
          : f.userAId.toString()
      )
    );

    // Lấy các yêu cầu kết bạn đang chờ
    const pendingRequests = await FriendRequest.find({
      $or: [
        { requesterId: currentUserId, receiverId: { $in: userIds } },
        { requesterId: { $in: userIds }, receiverId: currentUserId },
      ],
      status: "pending",
    });
    const pendingMap = {};
    pendingRequests.forEach((r) => {
      if (r.requesterId.toString() === currentUserId.toString()) {
        pendingMap[r.receiverId.toString()] = "pending_sent";
      } else {
        pendingMap[r.requesterId.toString()] = "pending_received";
      }
    });

    const results = topMatched.map((u) => {
      const uid = u._id.toString();
      let friendshipStatus = "none";
      if (friendIdSet.has(uid)) friendshipStatus = "friends";
      else if (pendingMap[uid]) friendshipStatus = pendingMap[uid];
      return { ...u.toObject(), friendshipStatus };
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi tìm kiếm người dùng: " + error.message,
    });
  }
};


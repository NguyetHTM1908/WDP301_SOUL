const Journal = require("../models/Journal");

/**
 * Lấy userId từ query/body để test Postman khi chưa gắn auth.
 * TODO: Thay bằng req.user._id khi route dùng middleware auth.
 */
const resolveUserId = (req) => {
  const fromQuery = req.query.userId;
  const fromBody = req.body && req.body.userId;
  const value = fromQuery ?? fromBody;
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const validateTags = (tags) => {
  if (tags === undefined) return { ok: true };
  if (!Array.isArray(tags)) {
    return { ok: false, message: "tags must be an array" };
  }
  return { ok: true };
};

const normalizeTags = (tags) =>
  tags.map((tag) => String(tag).trim()).filter(Boolean);

const sameOwner = (journalUserId, requestUserId) =>
  String(journalUserId) === String(requestUserId);

exports.createJournal = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { title, content, mood, tags } = req.body;

    if (!content || String(content).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "content is required and cannot be empty",
      });
    }

    const tagsCheck = validateTags(tags);
    if (!tagsCheck.ok) {
      return res.status(400).json({
        success: false,
        message: tagsCheck.message,
      });
    }

    const journal = await Journal.create({
      userId,
      title: title != null ? String(title).trim() : null,
      content: String(content).trim(),
      mood: mood != null ? String(mood).trim() : null,
      tags: tags !== undefined ? normalizeTags(tags) : [],
    });

    return res.status(201).json({
      success: true,
      message: "Create journal successfully",
      data: journal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJournalHistory = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      userId,
      isDeleted: false,
    };

    if (req.query.mood) {
      filter.mood = String(req.query.mood).trim();
    }

    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim();
      if (keyword) {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ title: regex }, { content: regex }];
      }
    }

    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    const [journals, total] = await Promise.all([
      Journal.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit),
      Journal.countDocuments(filter),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Get journal history successfully",
      data: {
        journals,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJournalDetail = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    if (!sameOwner(journal.userId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this journal",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get journal detail successfully",
      data: journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    if (!sameOwner(journal.userId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this journal",
      });
    }

    const { title, content, mood, tags } = req.body;

    if (content !== undefined && String(content).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "content cannot be empty",
      });
    }

    const tagsCheck = validateTags(tags);
    if (!tagsCheck.ok) {
      return res.status(400).json({
        success: false,
        message: tagsCheck.message,
      });
    }

    if (title !== undefined) journal.title = title != null ? String(title).trim() : null;
    if (content !== undefined) journal.content = String(content).trim();
    if (mood !== undefined) journal.mood = mood != null ? String(mood).trim() : null;
    if (tags !== undefined) journal.tags = normalizeTags(tags);

    await journal.save();

    return res.status(200).json({
      success: true,
      message: "Update journal successfully",
      data: journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    if (!sameOwner(journal.userId, userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this journal",
      });
    }

    journal.isDeleted = true;
    await journal.save();

    return res.status(200).json({
      success: true,
      message: "Delete journal successfully",
      data: journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

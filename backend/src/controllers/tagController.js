// src/controllers/tagController.js
const Tag = require("../models/Tag");
const Post = require("../models/Post");

exports.getActiveTags = async (req, res) => {
  try {
    const tags = await Tag.find({ status: "active" }).sort({ postCount: -1, name: 1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách hashtag thành công.",
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTagsForAdmin = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách hashtag admin thành công.",
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tên hashtag không được để trống.",
      });
    }

    const normalizedName = name.replace("#", "").trim().toLowerCase();

    const tag = await Tag.create({
      name: normalizedName,
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo hashtag thành công.",
      data: tag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Hashtag đã tồn tại.",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hashtag.",
      });
    }

    if (name !== undefined) {
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Tên hashtag không được để trống.",
        });
      }

      tag.name = name.replace("#", "").trim().toLowerCase();
    }

    if (description !== undefined) tag.description = description || null;

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái hashtag không hợp lệ.",
        });
      }

      tag.status = status;
    }

    await tag.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật hashtag thành công.",
      data: tag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Hashtag đã tồn tại.",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hashtag.",
      });
    }

    tag.status = "inactive";
    await tag.save();

    return res.status(200).json({
      success: true,
      message: "Ẩn hashtag thành công.",
      data: tag,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncTagPostCounts = async (req, res) => {
  try {
    const tags = await Tag.find();

    for (const tag of tags) {
      tag.postCount = await Post.countDocuments({
        hashtags: tag.name,
        status: "approved",
        visibility: "public",
      });

      await tag.save();
    }

    return res.status(200).json({
      success: true,
      message: "Đồng bộ số lượng bài viết hashtag thành công.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
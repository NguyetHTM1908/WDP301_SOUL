// src/routes/tagRoutes.js
const express = require("express");
const router = express.Router();

const {
  getActiveTags,
  getAllTagsForAdmin,
  createTag,
  updateTag,
  deleteTag,
  syncTagPostCounts,
} = require("../controllers/forum/tagController");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", getActiveTags);

router.get("/admin", auth, adminOnly, getAllTagsForAdmin);
router.post("/admin", auth, adminOnly, createTag);
router.put("/admin/:id", auth, adminOnly, updateTag);
router.delete("/admin/:id", auth, adminOnly, deleteTag);
router.patch("/admin/sync-counts", auth, adminOnly, syncTagPostCounts);

module.exports = router;
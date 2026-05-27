const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Chỉ admin mới có quyền được thực hiện thao tác này.",
    });
  }

  next();
};

module.exports = adminOnly;
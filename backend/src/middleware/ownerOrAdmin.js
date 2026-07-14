const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Không xác định được danh tính người dùng. Vui lòng đăng nhập.",
    });
  }

  const role = req.user.role;
  if (role !== "admin" && role !== "event_organizer") {
    return res.status(403).json({
      success: false,
      message: "Chỉ người tổ chức sự kiện hoặc quản trị viên mới có quyền thực hiện thao tác này.",
    });
  }

  next();
};

module.exports = ownerOrAdmin;

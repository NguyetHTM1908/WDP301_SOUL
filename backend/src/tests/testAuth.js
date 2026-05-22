require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Helper tạo mock Response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = JSON.parse(JSON.stringify(data));
    return res;
  };
  return res;
};

// Helper tạo mock Next function
const mockNext = () => {
  const next = { called: false };
  next.fn = () => { next.called = true; };
  return next;
};

const runAuthTest = async () => {
  try {
    await connectDB();
    console.log("Kết nối MongoDB thành công.\n");

    const testEmail = "testuser@soul.com";
    const testPassword = "securePassword123";

    // 0. Dọn dẹp dữ liệu test cũ
    await User.deleteOne({ email: testEmail });
    await TokenBlacklist.deleteMany({});
    console.log("[SETUP] Đã xóa dữ liệu test cũ.");

    // 1. Kiểm tra Đăng ký
    console.log("\n--- Kiểm tra Đăng ký (Register) ---");
    const regReq = { body: { fullName: "Test User Auth", email: testEmail, password: testPassword, phone: "0999888777" } };
    const regRes = mockResponse();
    await authController.register(regReq, regRes);

    if (regRes.statusCode === 201) {
      console.log("[PASS] Đăng ký thành công (201 Created).");
      console.log("       - Token cấp phát:", regRes.body.data.token ? "CÓ" : "KHÔNG");
    } else {
      console.error("[FAIL] Đăng ký thất bại:", regRes.body.message);
      process.exit(1);
    }

    const savedUser = await User.findOne({ email: testEmail });
    console.log("[PASS] Mật khẩu được mã hóa và lưu trong DB.");

    // 2. Kiểm tra Đăng nhập thành công
    console.log("\n--- Kiểm tra Đăng nhập (Login) ---");
    const loginReq = { body: { email: testEmail, password: testPassword } };
    const loginRes = mockResponse();
    await authController.login(loginReq, loginRes);

    if (loginRes.statusCode === 200) {
      console.log("[PASS] Đăng nhập thành công (200 OK).");
      console.log("       - passwordHash trong response:", loginRes.body.data.user.passwordHash ? "CÓ (LỖI!)" : "KHÔNG (AN TOÀN)");
    } else {
      console.error("[FAIL] Đăng nhập thất bại:", loginRes.body.message);
      process.exit(1);
    }

    const activeToken = loginRes.body.data.token;

    // 3. Kiểm tra Đăng nhập sai mật khẩu
    console.log("\n--- Kiểm tra Đăng nhập sai mật khẩu ---");
    const badLoginRes = mockResponse();
    await authController.login({ body: { email: testEmail, password: "SaiMatKhau" } }, badLoginRes);
    if (badLoginRes.statusCode === 401) {
      console.log("[PASS] Đúng - Từ chối đăng nhập sai mật khẩu (401).");
    } else {
      console.error("[FAIL] Nên từ chối nhưng lại cho phép.");
      process.exit(1);
    }

    // 4. Kiểm tra Đăng xuất (Logout)
    console.log("\n--- Kiểm tra Đăng xuất (Logout) ---");
    const decoded = jwt.verify(activeToken, process.env.JWT_SECRET);
    const logoutReq = {
      user: savedUser,
      token: activeToken,
      tokenExp: decoded.exp,
    };
    const logoutRes = mockResponse();
    await authController.logout(logoutReq, logoutRes);

    if (logoutRes.statusCode === 200) {
      console.log("[PASS] Đăng xuất thành công (200 OK).");
      console.log("       - Thông báo:", logoutRes.body.message);
    } else {
      console.error("[FAIL] Đăng xuất thất bại:", logoutRes.body.message);
      process.exit(1);
    }

    // Xác minh token đã vào blacklist trong DB
    const blacklisted = await TokenBlacklist.findOne({ token: activeToken });
    if (blacklisted) {
      console.log("[PASS] Token đã được lưu vào Blacklist trong DB.");
      console.log(`       - Token hết hạn vào: ${blacklisted.expiresAt.toISOString()}`);
    } else {
      console.error("[FAIL] Token chưa được thêm vào Blacklist!");
      process.exit(1);
    }

    // 5. Kiểm tra dùng lại token đã đăng xuất (phải bị từ chối)
    console.log("\n--- Kiểm tra dùng lại Token đã Đăng xuất ---");
    const reuseReq = {
      header: (name) => name === "Authorization" ? `Bearer ${activeToken}` : null,
    };
    const reuseRes = mockResponse();
    const next = mockNext();
    await authMiddleware(reuseReq, reuseRes, next.fn);

    if (reuseRes.statusCode === 401 && !next.called) {
      console.log("[PASS] Đúng - Token đã đăng xuất bị từ chối (401).");
      console.log("       - Thông báo:", reuseRes.body.message);
    } else {
      console.error("[FAIL] Token đã đăng xuất VẪN CÒN HIỆU LỰC - LỖI BẢO MẬT NGHIÊM TRỌNG!");
      process.exit(1);
    }

    // 6. Dọn dẹp
    await User.deleteOne({ email: testEmail });
    await TokenBlacklist.deleteMany({});
    console.log("\n[CLEANUP] Đã xóa toàn bộ dữ liệu test.");

    console.log("\n>>> KIỂM THỬ TOÀN BỘ AUTH API THÀNH CÔNG! <<<");
    process.exit(0);
  } catch (error) {
    console.error("Kiểm thử thất bại:", error);
    process.exit(1);
  }
};

runAuthTest();

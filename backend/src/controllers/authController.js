const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const { sendOtpEmail } = require("../services/emailService");

/** Tạo mã OTP 6 số ngẫu nhiên */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT Helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

/**
 * @desc    Đăng ký tài khoản người dùng mới
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, gender, dateOfBirth, role } = req.body;

    // 1. Kiểm tra các trường bắt buộc
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    // 2. Kiểm tra email định dạng hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ.",
      });
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    // 4. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Nếu user đã tồn tại nhưng chưa xác thực, cho phép gửi lại OTP
      if (!existingUser.isEmailVerified) {
        const otp = generateOtp();
        existingUser.otpCode = otp;
        existingUser.otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await existingUser.save();
        try {
          await sendOtpEmail(email, otp, "register");
        } catch (mailErr) {
          console.error("[Register] Lỗi gửi email OTP:", mailErr.message);
        }
        return res.status(200).json({
          success: true,
          message: "Email đã đăng ký nhưng chưa xác thực. Mã OTP mới đã được gửi tới email của bạn.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng để đăng ký tài khoản khác.",
      });
    }

    // 5. Kiểm tra xem số điện thoại đã tồn tại chưa (nếu có)
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại này đã được sử dụng.",
        });
      }
    }

    // 6. Mã hóa mật khẩu sử dụng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Tạo người dùng mới (chưa xác thực email)
    const allowedRoles = ["user", "event_organizer"];
    const finalRole = (role && allowedRoles.includes(role)) ? role : "user";

    const userFields = {
      fullName,
      email,
      passwordHash,
      role: finalRole,
      status: "active",
      isEmailVerified: false, // Chưa xác thực email
    };

    if (phone) userFields.phone = phone;
    if (gender) userFields.gender = gender;
    if (dateOfBirth) userFields.dateOfBirth = new Date(dateOfBirth);

    // 8. Sinh OTP và lưu vào user
    const otp = generateOtp();
    userFields.otpCode = otp;
    userFields.otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    const newUser = await User.create(userFields);

    // 9. Gửi email OTP xác thực
    try {
      await sendOtpEmail(email, otp, "register");
    } catch (mailErr) {
      console.error("[Register] Lỗi gửi email OTP:", mailErr.message);
      // Không rollback user — vẫn cho phép resend OTP sau
    }

    // 10. Trả về kết quả (không trả token — cần xác thực OTP trước)
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP để xác thực tài khoản.",
      data: {
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng ký tài khoản: " + error.message,
    });
  }
};

/**
 * @desc    Đăng nhập tài khoản
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
    }

    // 2. Tìm người dùng bằng email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 4. Kiểm tra xác thực email (nếu chưa xác thực)
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản chưa được xác thực email. Vui lòng kiểm tra email và nhập mã OTP.",
        data: { email: user.email, requireOtp: true },
      });
    }

    // 5. So sánh mật khẩu bằng bcryptjs
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 6. Cập nhật thời gian đăng nhập cuối cùng
    user.lastLoginAt = new Date();
    await user.save();

    // 7. Tạo JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng nhập: " + error.message,
    });
  }
};

/**
 * @desc    Lấy thông tin cá nhân hiện tại
 * @route   GET /api/auth/me
 * @access  Private (Cần Token)
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin cá nhân thành công.",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin cá nhân: " + error.message,
    });
  }
};

/**
 * @desc    Đăng xuất tài khoản (vô hiệu hóa token phía Server)
 * @route   POST /api/auth/logout
 * @access  Private (Cần Token)
 * @note    Hoạt động tốt cho cả Mobile App (Flutter) và Web.
 *          Sau khi gọi API này:
 *            - Mobile: xóa token khỏi Secure Storage.
 *            - Web: xóa token khỏi localStorage/sessionStorage/cookie.
 */
const logout = async (req, res) => {
  try {
    const token = req.token;
    const tokenExp = req.tokenExp; // Unix timestamp (giây) từ JWT payload

    // Chuyển đổi thời gian hết hạn từ Unix timestamp sang Date object
    const expiresAt = new Date(tokenExp * 1000);

    // Thêm token vào danh sách đen (blacklist)
    // Nếu token đã có trong blacklist (đăng xuất trùng), bỏ qua lỗi duplicate
    await TokenBlacklist.findOneAndUpdate(
      { token },
      { token, userId: req.user._id, expiresAt },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công. Hẹn gặp lại bạn!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng xuất: " + error.message,
    });
  }
};

/**
 * @desc    Yêu cầu đặt lại mật khẩu (Quên mật khẩu)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ email.",
      });
    }

    // Tìm người dùng bằng email
    const user = await User.findOne({ email });
    if (!user) {
      // Trả về 200 để không lộ thông tin tài khoản tồn tại hay không
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu sẽ được gửi tới email của bạn.",
      });
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const code = generateOtp();

    // Lưu mã xác thực và thời gian hết hạn (10 phút) vào database
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Gửi OTP qua email
    try {
      await sendOtpEmail(email, code, "reset-password");
      console.log(`[Forgot Password] Đã gửi OTP tới: ${email}`);
    } catch (mailErr) {
      console.error("[Forgot Password] Lỗi gửi email OTP:", mailErr.message);
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư rác).",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý quên mật khẩu: " + error.message,
    });
  }
};

/**
 * @desc    Xác thực mã khôi phục mật khẩu
 * @route   POST /api/auth/verify-code
 * @access  Public
 */
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mã xác thực.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này.",
      });
    }

    if (!user.resetCode || user.resetCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP khôi phục mật khẩu không chính xác.",
      });
    }

    if (!user.resetCodeExpires || new Date(user.resetCodeExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu mới.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xác thực mã OTP thành công.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xác thực mã: " + error.message,
    });
  }
};

/**
 * @desc    Đặt lại mật khẩu mới
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      console.error("[Reset Password Error] Thiếu params:", { email: !!email, code: !!code, newPassword: !!newPassword });
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ email, mã xác thực và mật khẩu mới.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    console.log(`[Reset Password] Email: ${cleanEmail}, Code: ${cleanCode}`);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này.",
      });
    }

    if (!user.resetCode || user.resetCode !== cleanCode) {
      console.error(`[Reset Password Error] Mã OTP không khớp! Trong DB: '${user.resetCode}', Nhận được: '${cleanCode}'`);
      return res.status(400).json({
        success: false,
        message: "Mã OTP khôi phục mật khẩu không chính xác hoặc đã hết hiệu lực.",
      });
    }

    if (!user.resetCodeExpires || new Date(user.resetCodeExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu mới.",
      });
    }

    // Mã hóa mật khẩu mới sử dụng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới và xoá mã xác thực
    user.passwordHash = passwordHash;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    console.log(`[Reset Password Success] Đã đổi mật khẩu thành công cho email: ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đặt lại mật khẩu: " + error.message,
    });
  }
};

/**
 * @desc    Đăng nhập hoặc đăng ký bằng tài khoản Google (OAuth / ID Token)
 * @route   POST /api/auth/google-login
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { email, fullName, googleId, avatarUrl, idToken } = req.body;

    let userEmail = email;
    let userName = fullName;
    let userGoogleId = googleId;
    let userAvatarUrl = avatarUrl;

    // Nếu frontend truyền idToken từ Google Identity Services / GIS
    if (idToken) {
      try {
        const decoded = jwt.decode(idToken);
        if (decoded) {
          userEmail = userEmail || decoded.email;
          userName = userName || decoded.name || decoded.email?.split("@")[0];
          userGoogleId = userGoogleId || decoded.sub;
          userAvatarUrl = userAvatarUrl || decoded.picture;
        }
      } catch (err) {
        console.warn("[Google Login] Lỗi decode idToken:", err.message);
      }
    }

    if (!userEmail || !userGoogleId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp thông tin tài khoản Google (email & googleId hoặc idToken).",
      });
    }

    userName = userName || userEmail.split("@")[0];
    const cleanEmail = userEmail.trim().toLowerCase();

    // 1. Kiểm tra xem người dùng đã tồn tại bằng email hoặc googleId chưa
    let user = await User.findOne({ $or: [{ googleId: userGoogleId }, { email: cleanEmail }] });

    if (user) {
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = userGoogleId;
        isUpdated = true;
      }
      if (userAvatarUrl && !user.avatarUrl) {
        user.avatarUrl = userAvatarUrl;
        isUpdated = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        isUpdated = true;
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Đăng nhập bằng Google thành công.",
        data: {
          user,
          token,
        },
      });
    }

    // 2. Nếu người dùng chưa tồn tại, tự động đăng ký tài khoản mới bằng thông tin Google
    const randomPassword = Math.random().toString(36).substring(2, 12);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    const newUser = await User.create({
      fullName: userName,
      email: cleanEmail,
      passwordHash,
      googleId: userGoogleId,
      avatarUrl: userAvatarUrl || null,
      role: "user",
      status: "active",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản mới và đăng nhập bằng Google thành công.",
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng nhập bằng Google: " + error.message,
    });
  }
};

/**
 * @desc    Khởi động luồng Google OAuth2 (Chuyển hướng người dùng)
 * @route   GET /api/auth/google
 * @access  Public
 */
const initiateGoogleAuth = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    // Nếu chưa cấu hình Client ID/Secret trong .env, báo lỗi
    if (!clientId || !clientSecret || clientId === "YOUR_GOOGLE_CLIENT_ID") {
      console.error("[Google OAuth] Lỗi: Chưa cấu hình biến môi trường GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET trong file .env!");
      return res.status(400).send(
        "<h3>Lỗi cấu hình OAuth phía Server</h3><p>Vui lòng cấu hình các trường GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env của Backend để tiếp tục đăng nhập bằng Google thật.</p>"
      );
    }

    // Luồng OAuth2 thật: Chuyển hướng tới Google accounts
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=profile%20email&prompt=select_account`;
    return res.redirect(googleAuthUrl);
  } catch (error) {
    return res.status(500).send("Lỗi khởi động Google Auth: " + error.message);
  }
};

/**
 * @desc    Xử lý nhận callback từ Google OAuth2 và chuyển tiếp về Mobile bằng Deep Linking
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Thiếu OAuth code.");
    }

    // Luồng thật: Trao đổi code lấy access_token
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenResponse.data;

    // Lấy thông tin hồ sơ của người dùng từ Google
    const userinfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = userinfoResponse.data;
    const email = profile.email;
    const fullName = profile.name;
    const googleId = profile.sub;
    const avatarUrl = profile.picture;

    // 2. Tìm kiếm hoặc tạo tài khoản trong cơ sở dữ liệu MongoDB thật
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Cập nhật thông tin định danh Google nếu cần thiết
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isUpdated = true;
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        isUpdated = true;
      }
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // Đăng ký tài khoản Google mới trong Database
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        fullName,
        email,
        passwordHash,
        googleId,
        avatarUrl: avatarUrl || null,
        role: "user",
        status: "active",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      });
    }

    // 3. Tạo JWT token
    const token = generateToken(user._id);

    // 4. Kiểm tra xem request từ Web hay Mobile App
    const userAgent = req.headers["user-agent"] || "";
    const isMobileApp = userAgent.includes("okhttp") || userAgent.includes("Expo");

    if (!isMobileApp) {
      // Nếu là trình duyệt Web: Trả về trang HTML tự động lưu token và chuyển về http://localhost:8081
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Đăng nhập thành công</title>
            <meta charset="utf-8">
          </head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #1E293B; margin-bottom: 8px;">🎉 Đăng nhập Google thành công!</h2>
              <p style="color: #64748B;">Đang chuyển hướng bạn về ứng dụng...</p>
            </div>
            <script>
              try {
                localStorage.setItem("token", "${token}");
                localStorage.setItem("user", '${JSON.stringify(user).replace(/'/g, "\\'")}');
              } catch(e){}
              setTimeout(() => {
                const target = "${user.role === 'admin' ? '(admin)' : '(tabs)'}";
                window.location.href = "http://localhost:8081/" + target + "?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}";
              }, 500);
            </script>
          </body>
        </html>
      `);
    }

    // Nếu là Mobile App: Chuyển hướng thông qua Deep Link (soulreactnative://)
    const deepLinkUrl = `soulreactnative://login-success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    console.log("[Google OAuth] Thành công. Chuyển hướng về App di động:", deepLinkUrl);
    return res.redirect(deepLinkUrl);
  } catch (error) {
    console.error("[Google OAuth Callback Error]:", error.response?.data || error.message);
    return res.status(500).send("Lỗi xử lý Google OAuth Callback: " + (error.response?.data?.error_description || error.message));
  }
};

/**
 * @desc    Cập nhật thông tin cá nhân người dùng
 * @route   PUT /api/auth/profile
 * @access  Private (Cần Token)
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, gender, dateOfBirth, avatarUrl, bio } = req.body;
    const userId = req.user._id;

    // Tìm người dùng trong DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Nếu cập nhật số điện thoại, kiểm tra xem số điện thoại đã được người khác sử dụng chưa
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: userId } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
        });
      }
      user.phone = phone;
    }

    // Cập nhật các trường thông tin khác
    if (fullName) user.fullName = fullName;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công.",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật thông tin cá nhân: " + error.message,
    });
  }
};

/**
 * @desc    Đổi mật khẩu tài khoản
 * @route   PUT /api/auth/change-password
 * @access  Private (Cần Token)
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Nếu người dùng đăng nhập bằng Google và chưa thiết lập mật khẩu thì sao?
    // user.passwordHash có thể rỗng hoặc không có
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    // Kiểm tra mật khẩu mới không được trùng với mật khẩu hiện tại
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
      });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đổi mật khẩu: " + error.message,
    });
  }
};

/**
 * @desc    Xác thực OTP sau khi đăng ký (kích hoạt tài khoản)
 * @route   POST /api/auth/verify-register-otp
 * @access  Public
 */
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mã OTP.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    console.log(`[Verify OTP] Email: ${cleanEmail}, OTP: ${cleanOtp}`);

    // Tìm người dùng theo email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này.",
      });
    }

    // Nếu tài khoản đã được xác thực trước đó
    if (user.isEmailVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: "Tài khoản của bạn đã được xác thực trước đó. Đăng nhập thành công!",
        data: { user, token },
      });
    }

    // Kiểm tra mã OTP
    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không chính xác. Vui lòng kiểm tra lại email.",
      });
    }

    // Kiểm tra thời gian hết hạn mã OTP
    if (!user.otpCodeExpires || new Date(user.otpCodeExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP đã hết hạn. Vui lòng nhấn 'Gửi lại mã OTP'.",
      });
    }

    // Kích hoạt tài khoản
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.otpCode = null;
    user.otpCodeExpires = null;
    await user.save();

    // Tạo token để đăng nhập ngay
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Xác thực email thành công! Tài khoản của bạn đã được kích hoạt.",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xác thực OTP: " + error.message,
    });
  }
};

/**
 * @desc    Gửi lại mã OTP (dùng được cho cả đăng ký và quên mật khẩu)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'register' | 'reset-password'

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ email.",
      });
    }

    const otpType = type === "reset-password" ? "reset-password" : "register";

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, mã OTP mới sẽ được gửi tới email của bạn.",
      });
    }

    // Nếu type là register nhưng user đã verified, không cần gửi
    if (otpType === "register" && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này đã được xác thực email rồi.",
      });
    }

    const newOtp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (otpType === "register") {
      user.otpCode = newOtp;
      user.otpCodeExpires = expiresAt;
    } else {
      user.resetCode = newOtp;
      user.resetCodeExpires = expiresAt;
    }

    await user.save();

    try {
      await sendOtpEmail(email, newOtp, otpType);
    } catch (mailErr) {
      console.error("[ResendOtp] Lỗi gửi email OTP:", mailErr.message);
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mã OTP mới đã được gửi tới email của bạn.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi lại OTP: " + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  verifyCode,
  resetPassword,
  googleLogin,
  initiateGoogleAuth,
  googleCallback,
  updateProfile,
  changePassword,
  verifyRegisterOtp,
  resendOtp,
};




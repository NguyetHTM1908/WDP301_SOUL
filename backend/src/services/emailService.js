const nodemailer = require("nodemailer");

/**
 * Tạo Nodemailer transporter từ biến môi trường.
 * Hỗ trợ Gmail (MAIL_HOST=smtp.gmail.com) hoặc bất kỳ SMTP nào khác.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.MAIL_PORT) || 465,
    secure: (parseInt(process.env.MAIL_PORT) || 465) === 465, // true nếu dùng port 465 (SSL)
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

/**
 * Tạo nội dung HTML email OTP theo loại yêu cầu.
 * @param {string} otpCode - Mã OTP 6 số
 * @param {'register' | 'reset-password'} type - Loại email
 * @returns {object} { subject, html }
 */
const buildOtpEmailContent = (otpCode, type) => {
  const isRegister = type === "register";

  const title = isRegister
    ? "Xác thực tài khoản SOUL của bạn"
    : "Đặt lại mật khẩu SOUL";

  const description = isRegister
    ? "Cảm ơn bạn đã đăng ký SOUL! Vui lòng nhập mã OTP bên dưới để xác thực email và kích hoạt tài khoản của bạn."
    : "Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ tài khoản của bạn. Vui lòng nhập mã OTP bên dưới để tiếp tục.";

  const note = isRegister
    ? "Nếu bạn không đăng ký tài khoản SOUL, hãy bỏ qua email này."
    : "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.";

  const subject = isRegister
    ? "[SOUL] Mã OTP xác thực tài khoản của bạn"
    : "[SOUL] Mã OTP đặt lại mật khẩu";

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%); padding: 36px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }
    .body { padding: 36px 32px; }
    .desc { color: #374151; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
    .otp-box { background: #f5f3ff; border: 2px dashed #A78BFA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px; }
    .otp-label { color: #6C63FF; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
    .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #4338CA; font-family: 'Courier New', monospace; }
    .otp-expire { color: #9CA3AF; font-size: 13px; margin-top: 10px; }
    .note-box { background: #FFF7ED; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px; }
    .note-box p { color: #92400E; font-size: 13px; line-height: 1.6; }
    .footer { background: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { color: #9CA3AF; font-size: 12px; line-height: 1.7; }
    .footer a { color: #6C63FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>💜 SOUL</h1>
      <p>${title}</p>
    </div>
    <div class="body">
      <p class="desc">${description}</p>
      <div class="otp-box">
        <div class="otp-label">Mã OTP của bạn</div>
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expire">⏱ Mã có hiệu lực trong <strong>10 phút</strong></div>
      </div>
      <div class="note-box">
        <p>⚠️ ${note}</p>
      </div>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ hệ thống <a href="#">SOUL App</a>.<br />Vui lòng không trả lời email này.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
};

/**
 * Gửi email OTP tới người dùng.
 * @param {string} toEmail - Địa chỉ email nhận
 * @param {string} otpCode - Mã OTP cần gửi
 * @param {'register' | 'reset-password'} type - Loại OTP
 * @returns {Promise<void>}
 */
const sendOtpEmail = async (toEmail, otpCode, type = "register") => {
  const transporter = createTransporter();
  const { subject, html } = buildOtpEmailContent(otpCode, type);

  const mailOptions = {
    from: process.env.MAIL_FROM || `"SOUL App" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Đã gửi OTP (${type}) tới: ${toEmail}`);
};

module.exports = { sendOtpEmail };

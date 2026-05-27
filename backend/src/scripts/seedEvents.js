require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Lấy user đầu tiên trong DB để làm createdBy
    const adminUser = await User.findOne();
    if (!adminUser) {
      console.log("❌ Không tìm thấy user nào trong DB. Hãy đăng ký tài khoản trước!");
      process.exit(1);
    }

    console.log(`✅ Dùng user: ${adminUser.fullName} (${adminUser.email})`);

    // Xóa events cũ nếu có
    await Event.deleteMany({});
    console.log("🗑️  Đã xóa events cũ");

    const events = [
      {
        title: "Workshop Vượt Qua Lo Âu - Kỹ Năng Tự Chăm Sóc Bản Thân",
        description:
          "Workshop thực hành các kỹ thuật giảm stress, lo âu thông qua mindfulness và breathing exercises dành cho sinh viên.",
        speakerName: "ThS. Nguyễn Minh Tâm",
        organizerName: "SOUL Wellness Team",
        contactEmail: "events@soul.vn",
        eventType: "workshop",
        startDateTime: new Date("2026-07-10T09:00:00.000Z"),
        endDateTime: new Date("2026-07-10T12:00:00.000Z"),
        location: "Hội trường A, Đại học FPT HCM",
        capacity: 50,
        registeredCount: 0,
        participants: [],
        status: "upcoming",
        createdBy: adminUser._id,
      },
      {
        title: "Talkshow: Câu Chuyện Sức Khỏe Tâm Thần Của Gen Z",
        description:
          "Chuỗi chia sẻ thực tế từ các bạn trẻ đã vượt qua giai đoạn khủng hoảng cảm xúc và cách họ tìm lại cân bằng.",
        speakerName: "Nhiều diễn giả khách mời",
        organizerName: "SOUL Community",
        contactEmail: "community@soul.vn",
        eventType: "talkshow",
        startDateTime: new Date("2026-07-20T14:00:00.000Z"),
        endDateTime: new Date("2026-07-20T17:00:00.000Z"),
        location: "Online - Google Meet",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        capacity: 100,
        registeredCount: 0,
        participants: [],
        status: "upcoming",
        createdBy: adminUser._id,
      },
      {
        title: "Webinar: Nhận Biết Dấu Hiệu Trầm Cảm Sớm",
        description:
          "Chuyên gia tâm lý chia sẻ cách nhận biết sớm các triệu chứng trầm cảm và hướng xử lý hiệu quả.",
        speakerName: "TS. Phạm Lan Anh",
        organizerName: "SOUL x Bệnh viện Tâm Thần HCM",
        contactEmail: "support@soul.vn",
        eventType: "webinar",
        startDateTime: new Date("2026-08-05T19:00:00.000Z"),
        endDateTime: new Date("2026-08-05T21:00:00.000Z"),
        meetingLink: "https://zoom.us/j/123456789",
        capacity: 200,
        registeredCount: 0,
        participants: [],
        status: "upcoming",
        createdBy: adminUser._id,
      },
      {
        title: "Community Day: Cùng Nhau Chữa Lành",
        description:
          "Ngày hội cộng đồng với các hoạt động art therapy, journaling, thiền định và giao lưu tích cực.",
        speakerName: null,
        organizerName: "SOUL Platform",
        contactEmail: "hello@soul.vn",
        eventType: "community_event",
        startDateTime: new Date("2026-08-15T08:00:00.000Z"),
        endDateTime: new Date("2026-08-15T17:00:00.000Z"),
        location: "Công viên Tao Đàn, TP.HCM",
        capacity: 300,
        registeredCount: 0,
        participants: [],
        status: "upcoming",
        createdBy: adminUser._id,
      },
    ];

    const inserted = await Event.insertMany(events);
    console.log(`✅ Đã tạo ${inserted.length} events:`);
    inserted.forEach((e, i) => {
      console.log(`   ${i + 1}. [${e._id}] ${e.title}`);
    });

    console.log("\n🎉 Seed thành công! Dùng các ID trên để test Postman.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi seed:", error.message);
    process.exit(1);
  }
};

seedEvents();

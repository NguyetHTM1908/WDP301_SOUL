const TEST_TYPES = {
  WHO5: "WHO5",
  PSS10: "PSS10",
};

const WHO5_QUESTIONS = [
  {
    id: 1,
    text: "Trong 2 tuần gần đây, tôi cảm thấy vui vẻ và có tinh thần tốt.",
  },
  {
    id: 2,
    text: "Trong 2 tuần gần đây, tôi cảm thấy bình tĩnh và thư giãn.",
  },
  {
    id: 3,
    text: "Trong 2 tuần gần đây, tôi cảm thấy năng động và có sức sống.",
  },
  {
    id: 4,
    text: "Trong 2 tuần gần đây, khi thức dậy, tôi cảm thấy tỉnh táo và được nghỉ ngơi đầy đủ.",
  },
  {
    id: 5,
    text: "Trong 2 tuần gần đây, cuộc sống hằng ngày của tôi có những điều khiến tôi thấy hứng thú.",
  },
];

const WHO5_ANSWER_OPTIONS = [
  { value: 5, label: "Luôn luôn" },
  { value: 4, label: "Hầu hết thời gian" },
  { value: 3, label: "Hơn một nửa thời gian" },
  { value: 2, label: "Ít hơn một nửa thời gian" },
  { value: 1, label: "Thỉnh thoảng" },
  { value: 0, label: "Không lúc nào" },
];

const PSS10_QUESTIONS = [
  {
    id: 1,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy khó chịu vì những việc xảy ra bất ngờ không?",
  },
  {
    id: 2,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy mình không kiểm soát được những việc quan trọng trong cuộc sống không?",
  },
  {
    id: 3,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy căng thẳng và áp lực không?",
  },
  {
    id: 4,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy tự tin về khả năng xử lý các vấn đề cá nhân không?",
    reverseScore: true,
  },
  {
    id: 5,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy mọi việc đang diễn ra theo đúng ý mình không?",
    reverseScore: true,
  },
  {
    id: 6,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy mình không thể giải quyết hết những việc cần làm không?",
  },
  {
    id: 7,
    text: "Trong 1 tháng gần đây, bạn có thường kiểm soát được những điều gây khó chịu trong cuộc sống không?",
    reverseScore: true,
  },
  {
    id: 8,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy mình làm chủ được mọi việc không?",
    reverseScore: true,
  },
  {
    id: 9,
    text: "Trong 1 tháng gần đây, bạn có thường tức giận vì những việc nằm ngoài tầm kiểm soát của mình không?",
  },
  {
    id: 10,
    text: "Trong 1 tháng gần đây, bạn có thường cảm thấy khó khăn chồng chất đến mức không thể vượt qua không?",
  },
];

const PSS10_ANSWER_OPTIONS = [
  { value: 0, label: "Không bao giờ" },
  { value: 1, label: "Gần như không bao giờ" },
  { value: 2, label: "Thỉnh thoảng" },
  { value: 3, label: "Khá thường xuyên" },
  { value: 4, label: "Rất thường xuyên" },
];

const TEST_DEFINITIONS = {
  WHO5: {
    testType: TEST_TYPES.WHO5,
    title: "WHO-5 Well-being Check",
    shortTitle: "Well-being Check",
    duration: "5-7 phút",
    totalQuestions: 5,
    source: "Dựa trên WHO-5 Well-Being Index",
    description:
      "Trong 2 tuần gần đây, bạn cảm thấy như thế nào? Hãy chọn mức độ phù hợp nhất với bạn.",
    disclaimer:
      "Bài check-in này chỉ giúp bạn tự nhìn lại trạng thái cảm xúc, không phải công cụ chẩn đoán hoặc thay thế chuyên gia tâm lý.",
    questions: WHO5_QUESTIONS,
    answerOptions: WHO5_ANSWER_OPTIONS,
  },

  PSS10: {
    testType: TEST_TYPES.PSS10,
    title: "PSS-10 Student Stress Check",
    shortTitle: "Stress Check",
    duration: "5-10 phút",
    totalQuestions: 10,
    source: "Dựa trên Perceived Stress Scale - PSS-10",
    description:
      "Trong 1 tháng gần đây, bạn cảm nhận mức độ căng thẳng của mình như thế nào? Hãy chọn mức độ phù hợp nhất với bạn.",
    disclaimer:
      "Bài kiểm tra này chỉ hỗ trợ bạn tự nhìn lại mức độ căng thẳng, không phải công cụ chẩn đoán bệnh tâm lý.",
    questions: PSS10_QUESTIONS,
    answerOptions: PSS10_ANSWER_OPTIONS,
  },
};

function getTestDefinition(testType) {
  return TEST_DEFINITIONS[testType];
}

module.exports = {
  TEST_TYPES,
  TEST_DEFINITIONS,
  getTestDefinition,
};
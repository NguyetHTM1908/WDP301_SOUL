from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import time

app = FastAPI()

model_name = "nozero23061311/soul-ai-qwen-merged"

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    dtype=torch.float16,
    low_cpu_mem_usage=True
)

model.eval()

print("=" * 50)
print("CUDA:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("Model Device:", model.device)
print("=" * 50)


SYSTEM_PROMPT = """
Bạn là Soul AI — người bạn đồng hành cảm xúc của nền tảng SOUL.

Vai trò của bạn là AI Emotional Companion, không phải bác sĩ, chuyên gia tâm lý hay therapist.
Bạn không chẩn đoán, không kê thuốc, không kết luận người dùng mắc bệnh.
Bạn chỉ lắng nghe, phản chiếu cảm xúc, giúp người dùng chậm lại và nhìn rõ điều đang xảy ra trong lòng mình.

Phong cách trả lời:

* Luôn dùng tiếng Việt tự nhiên, đời thường.
* Xưng là "mình", gọi người dùng là "bạn".
* Giọng ấm áp, trưởng thành, chân thành.
* Trả lời như một người bạn đang lắng nghe, không như chatbot tư vấn.
* Ưu tiên phản chiếu cảm xúc hơn là đưa lời khuyên.
* Không vội giải pháp ở câu đầu.
* Mỗi phản hồi tối đa 3 câu.
* Không đánh số, không bullet point.
* Chỉ hỏi tối đa 1 câu hỏi gợi mở.
* Câu hỏi phải cụ thể theo nội dung người dùng vừa nói.

Cách phản hồi:

* Câu đầu tiên phải gọi đúng cảm xúc hoặc tình huống chính của người dùng.
* Câu thứ hai có thể phản chiếu sâu hơn nguyên nhân, áp lực hoặc điều người dùng đang sợ.
* Nếu cần gợi ý, chỉ đưa 1 hành động nhỏ, cụ thể, có thể làm ngay.
* Câu cuối có thể là 1 câu hỏi gợi mở cụ thể.
* Không dùng cấu trúc lặp lại quá nhiều như "Có vẻ bạn đang..." hoặc "Bạn có muốn...".
* Không hỏi kiểu chung chung như "Bạn cảm thấy thế nào?" nếu người dùng đã nói rõ cảm xúc.

Không được nói:

* "Rất tiếc vì điều này."
* "Mọi chuyện sẽ ổn."
* "Hãy cố lên."
* "Bạn không một mình."
* "Tôi hiểu hoàn toàn cảm giác của bạn."
* "Hy vọng thông tin này hữu ích."
* "Mình cũng từng..."
* "Mình cảm thấy..."
* "Mình nghĩ..."
* "Mình thấy mình..."
* "Mình cũng lo..."
* "Bạn có muốn cùng..."
* "Chúng ta cùng..."
* "Ngồi xuống cùng tôi..."

Không dùng tiếng Anh hoặc từ lóng:

* heal
* toxic
* trigger
* overthinking
* negative energy
* vibe
* đè down
Không bao giờ mô tả cảm xúc của chính Soul AI.

"Mình" chỉ được dùng để:
- lắng nghe
- phản hồi
- đồng hành

Không được dùng:
"Mình sợ..."
"Mình lo..."
"Mình thấy mình..."
"Mình đang..."

Ví dụ phong cách tốt:
Người dùng: "Mình sợ làm không kịp rồi bị đánh giá là vô dụng."
Soul AI: "Điều làm bạn nặng lòng có lẽ không chỉ là deadline, mà còn là nỗi sợ bị nhìn nhận sai về giá trị của mình. Khi áp lực dồn lại, bạn rất dễ dùng những lời khắt khe để nói với bản thân. Điều gì khiến bạn nghĩ rằng nếu không kịp thì bạn sẽ bị xem là vô dụng?"

Người dùng: "Mình đang run, tim đập nhanh, mai phải thuyết trình nên mình sợ quá."
Soul AI: "Buổi thuyết trình ngày mai có vẻ đang làm cơ thể bạn căng lên rất rõ. Khi nỗi sợ kết quả quá lớn, cơ thể có thể phản ứng trước cả khi chuyện đó xảy ra. Phần nào của bài thuyết trình đang làm bạn sợ nhất?"
"""



SELF_HARM_KEYWORDS = [
    "muốn chết", "tự tử", "không muốn sống", "chết đi",
    "cắt tay", "uống thuốc", "tự làm đau", "kết thúc cuộc đời",
    "biến mất mãi mãi", "muốn biến mất", "không còn lý do sống"
]

MEDICAL_EMERGENCY_KEYWORDS = [
    "khó thở", "không thở được", "khong tho duoc",
    "đau ngực", "ngất", "sắp ngất", "chóng mặt dữ dội"
]


def detect_risk(message: str):
    msg = message.lower()

    if any(keyword in msg for keyword in MEDICAL_EMERGENCY_KEYWORDS):
        return "emergency", True

    if any(keyword in msg for keyword in SELF_HARM_KEYWORDS):
        return "high", True

    return "low", False


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {"message": "Soul AI Server is running"}


@app.post("/chat")
def chat(req: ChatRequest):
    start = time.time()

    risk_level, safety_warning = detect_risk(req.message)

    if risk_level == "emergency":
        return {
            "reply": "Mình nghe bạn nói đang có dấu hiệu cơ thể đáng lo, nên mình muốn ưu tiên an toàn trước. Nếu bạn đang khó thở nhiều, đau ngực, chóng mặt, sắp ngất hoặc cảm thấy nguy hiểm, hãy gọi cấp cứu hoặc nhờ người gần bạn hỗ trợ ngay. Nếu tình trạng nhẹ hơn và bạn vẫn an toàn, mình có thể ở đây cùng bạn vài phút để giúp bạn chậm lại nhịp thở.",
            "riskLevel": risk_level,
            "safetyWarning": safety_warning,
            "time": round(time.time() - start, 2)
        }

    if risk_level == "high":
        return {
            "reply": "Mình nghe thấy bạn đang ở trong một trạng thái rất nặng nề, và điều này cần được xem là nghiêm túc. Ngay lúc này, bạn có đang ở nơi an toàn không? Nếu bạn có ý định làm hại bản thân hoặc cảm thấy mình không kiểm soát được hành động, hãy gọi người thân đáng tin cậy ở gần bạn hoặc liên hệ dịch vụ hỗ trợ khẩn cấp tại nơi bạn sống ngay bây giờ. Bạn có thể chỉ cần trả lời mình một câu ngắn: hiện tại bạn có đang an toàn không?",
            "riskLevel": risk_level,
            "safetyWarning": safety_warning,
            "time": round(time.time() - start, 2)
        }

    user_prompt = f"""
Người dùng vừa chia sẻ:
"{req.message}"

Hãy trả lời như Soul AI.

Yêu cầu bắt buộc:

* Trả lời từ 120 đến 180 từ.
* Từ 4 đến 7 câu.
* Không bullet point.
* Không đánh số.
* Không mở đầu bằng câu hỏi.
* Không dùng "tôi".
* Luôn xưng "mình", gọi người dùng là "bạn".
* Không nói về cảm xúc hoặc trải nghiệm của Soul AI.
* Không dùng câu "Có vẻ bạn đang" quá thường xuyên.
* Không dùng câu "Bạn có muốn cùng".
* Đồng cảm và phản chiếu cảm xúc trước.
* Chỉ đưa 1 gợi ý nhỏ nếu thật sự phù hợp.
* Kết thúc bằng tối đa 1 câu hỏi gợi mở cụ thể.
  """


    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ]

    try:
        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        with torch.inference_mode():
            outputs = model.generate(
                **inputs,
                temperature=0.7,
                top_p=0.9,
                max_new_tokens=300,
                do_sample=True,
                repetition_penalty=1.12,
                use_cache=True,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id
            )

        new_tokens = outputs[0][inputs["input_ids"].shape[-1]:]
        reply = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

        return {
            "reply": reply,
            "riskLevel": risk_level,
            "safetyWarning": safety_warning,
            "time": round(time.time() - start, 2)
        }

    except Exception as e:
        return {
            "reply": "Mình đang gặp lỗi kỹ thuật nên phản hồi chưa ổn định. Bạn có thể nói ngắn lại điều đang làm bạn khó chịu nhất lúc này không?",
            "riskLevel": "unknown",
            "safetyWarning": False,
            "error": str(e),
            "time": round(time.time() - start, 2)
        }
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
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True
)

model.eval()

SYSTEM_PROMPT = """
Bạn là Soul AI — người bạn đồng hành cảm xúc của nền tảng SOUL.

Mục tiêu của bạn là giúp người dùng cảm thấy được lắng nghe, được thấu hiểu và có thêm một khoảng dừng an toàn để nhìn lại cảm xúc của mình.

Phong cách:

* Luôn trả lời bằng tiếng Việt tự nhiên.
* Ấm áp, chân thành, trưởng thành.
* Nói như một người đang trò chuyện, không như chatbot.
* Trả lời ngắn gọn nhưng có chiều sâu cảm xúc.
* Ưu tiên sự hiện diện và lắng nghe hơn là đưa lời khuyên.

Khi người dùng chia sẻ cảm xúc:

1. Công nhận cảm xúc hoặc trải nghiệm của họ.
2. Phản hồi đồng cảm.
3. Nếu phù hợp, đặt một câu hỏi gợi mở nhẹ nhàng.

Khi người dùng chỉ muốn được lắng nghe:

* Không vội sửa vấn đề.
* Không liên tục đưa lời khuyên.
* Không chuyển hướng sang giải pháp quá sớm.

Khi người dùng muốn lời khuyên:

* Chỉ đề xuất 1–3 hành động nhỏ, thực tế và an toàn.
* Ưu tiên những việc có thể làm ngay hôm nay.

Không sử dụng các câu:

* "Mọi chuyện sẽ ổn."
* "Hãy cố lên."
* "Bạn không một mình."
* "Tôi hiểu hoàn toàn cảm giác của bạn."
* "Hy vọng thông tin này hữu ích."

Không:

* Chẩn đoán bệnh tâm lý.
* Kê thuốc.
* Khẳng định người dùng mắc bệnh.
* Thay thế chuyên gia tâm lý.

Nếu xuất hiện dấu hiệu tự làm hại bản thân, tự tử hoặc khủng hoảng nghiêm trọng:

* Bình tĩnh và nghiêm túc.
* Hỏi xem người dùng có đang gặp nguy hiểm ngay lúc này không.
* Khuyến khích liên hệ người thân đáng tin cậy hoặc dịch vụ hỗ trợ khẩn cấp tại nơi họ sống.
* Không sử dụng lời động viên sáo rỗng hoặc tích cực hóa vấn đề.
"""

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"message": "Soul AI Server is running"}

@app.post("/chat")
def chat(req: ChatRequest):
    start = time.time()

    user_prompt = f"""
Người dùng chia sẻ:
"{req.message}"

Hãy trả lời bằng một đoạn văn tự nhiên.
Không đánh số, không dùng bullet point.
Đồng cảm trước, không khuyên quá sớm.
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

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=120,
            temperature=0.75,
            top_p=0.9,
            do_sample=True,
            repetition_penalty=1.08,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    new_tokens = outputs[0][inputs["input_ids"].shape[-1]:]
    reply = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    return {
        "reply": reply,
        "time": round(time.time() - start, 2)
    }
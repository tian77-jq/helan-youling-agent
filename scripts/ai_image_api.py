"""贺兰灵境图片生成 API（FastAPI 适配层）。

默认 IMAGE_PROVIDER=mock，比赛演示无需腾讯密钥即可跑通；配置 tencent 后，
只需在 ImageService._generate_tencent 中补充官方 SDK/签名实现，前端接口不变。
"""
from datetime import date
from os import getenv
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel, Field

SCENES = {
    "travel_memory": "宁夏旅行纪念照、景区旅行、手机壁纸与分享海报",
    "yellow_river": "黄河文化、塞上江南、黄河文明守护、东方美学",
    "xixia": "西夏遗产、西夏文字、西夏陵、贺兰山岩画、历史复原",
    "helan_ecology": "贺兰山生态、岩羊、荒漠绿洲、生态文明",
    "food_collab": "宁夏地方美食、城市风味、萌宠联名海报",
}
PETS = {
    "rockyan": "岩岩（岩羊），贺兰山生态专家，山川、自然、守护、生态、坚韧",
    "lingling": "灵灵（狐狸），西夏文化探索者，人文、历史、西夏、神秘、智慧",
    "tuotuo": "驼驼（骆驼），丝路旅行伙伴，丝绸之路、沙漠、远行、豪迈、驼队",
}
STYLES = {"guofeng": "国风插画", "poster": "文旅海报", "postcard": "明信片风", "healing": "可爱治愈"}
BLOCKED = ("违法", "色情", "暴力血腥", "恐怖袭击", "赌博", "毒品")


class GenerateRequest(BaseModel):
    user_id: str = Field(default="anonymous", alias="userId")
    scene: str
    sub_scene: str = Field(default="", alias="subScene")
    pet: str = "lingling"
    style: str = "poster"
    output_type: str = Field(default="poster", alias="outputType")
    user_prompt: str = Field(default="", alias="userPrompt", max_length=120)
    regenerate: bool = False


class QuotaService:
    def __init__(self):
        self._used = {}

    def consume(self, user_id: str):
        key = (user_id, date.today().isoformat())
        used = self._used.get(key, 0)
        if used >= 1:
            return False, 0
        self._used[key] = used + 1
        return True, 0


class SafetyFilter:
    @staticmethod
    def clean(text: str) -> str:
        if any(word in text for word in BLOCKED):
            raise ValueError("这段内容不适合生成，请换一句旅行故事。")
        return text.strip()[:120]


class PromptBuilder:
    def build(self, request: GenerateRequest) -> str:
        if request.scene not in SCENES:
            raise ValueError("未知的宁夏文旅场景")
        pet = PETS.get(request.pet, PETS["lingling"])
        style = STYLES.get(request.style, STYLES["poster"])
        story = SafetyFilter.clean(request.user_prompt) or "我想把这次宁夏旅行留成一张值得分享的纪念作品。"
        return ("宁夏文化增强型生成算法：\n"
                f"场景与文化约束：{SCENES[request.scene]}；子主题：{request.sub_scene or '宁夏文化纪念'}。\n"
                f"IP角色约束：{pet}。\n"
                f"视觉风格：{style}；输出类型：{request.output_type}；主体清晰、构图完整、适合传播。\n"
                f"游客故事：{story}。\n"
                "禁止虚构票价、开放时间和实时交通，不添加无关品牌、低俗或危险内容。")


class ImageService:
    def __init__(self):
        self.provider = getenv("IMAGE_PROVIDER", "mock")

    def generate(self, prompt: str):
        if self.provider == "tencent":
            return self._generate_tencent(prompt)
        return {"mode": "mock", "image_url": "/assets/thumbs/scenic-collab/helan_rock_painting_banner.jpg"}

    def _generate_tencent(self, prompt: str):
        # 腾讯接口签名、密钥和地域配置只放服务端；此处是可替换适配点。
        raise RuntimeError("腾讯生图适配器尚未配置，请保持 IMAGE_PROVIDER=mock 进行演示")


app = FastAPI(title="Helan Spirit AI Image API", version="0.1.0")
quota = QuotaService()
builder = PromptBuilder()
image_service = ImageService()


@app.post("/api/image/generate")
def generate_image(request: GenerateRequest):
    allowed, remaining = quota.consume(request.user_id)
    if not allowed:
        return {"success": False, "error_message": "今日免费生成次数已用完", "remaining_quota": remaining}
    prompt = builder.build(request)
    result = image_service.generate(prompt)
    return {"success": True, "task_id": str(uuid4()), "request_id": str(uuid4()),
            "image_url": result["image_url"], "mode": result["mode"],
            "final_prompt": prompt, "remaining_quota": remaining}


@app.get("/api/image/health")
def health():
    return {"status": "ok", "provider": image_service.provider}

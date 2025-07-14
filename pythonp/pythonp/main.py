from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# --------------------------------------------------  env / OpenAI  --
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --------------------------------------------------  FastAPI setup --
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------  helper: tone detector  --
TONE_CATEGORIES = ["angry", "informal", "formal", "neutral"]

def classify_tone(message: str) -> str:
    """Return one of: angry, informal, formal, neutral (deterministic)."""
    prompt = (
        "You are a tone classifier. "
        f"Categories: {', '.join(TONE_CATEGORIES)}.\n"
        "Return ONLY the category name.\n\n"
        f"Message:\n{message}"
    )

    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=2,
    )
    tone = resp.choices[0].message.content.strip().lower()
    return tone if tone in TONE_CATEGORIES else "neutral"

# --------------------------------------------------  unified tone‑aware prompt  --
REPHRASE_TEMPLATE = (
    "The following message is labeled as \"{tone}\". "
    "Rewrite it so it sounds friendly, polite, and professional for a workplace chat (Slack / Teams). "
    "Keep it SHORT — one or two lines — and avoid email phrases like 'Dear', 'Thanks', or sign‑offs. "
    "\n\nGuidelines:\n"
    "• If angry / harsh → soften and make collaborative.\n"
    "• If blunt / short → add polite context without fluff.\n"
    "• If too informal → make slightly more professional (no slang / emojis).\n"
    "• If unclear → gently clarify while staying concise.\n\n"
    "Examples:\n"
    "Any update? → Just checking in—do you have any updates when you get a chance?\n"
    "Fix it. → Could you please make the necessary changes when you have a moment?\n"
    "No. → Unfortunately, I’ll have to pass for now due to current priorities.\n"
    "Why is this wrong? → Could you help me understand what might have caused this issue?\n\n"
    "Now rewrite this message:\n\"{message}\""
)

# --------------------------------------------------  API schema  --
class MessageRequest(BaseModel):
    message: str

class RephraseResponse(BaseModel):
    original: str
    tone: str
    rephrased: str

# --------------------------------------------------  Route  --
@app.post("/rephrase", response_model=RephraseResponse)
async def rephrase_message(payload: MessageRequest):
    original_msg = payload.message.strip()

    # 1️⃣  Detect tone
    tone = classify_tone(original_msg)

    # 2️⃣  Build prompt
    prompt = REPHRASE_TEMPLATE.format(tone=tone, message=original_msg)

    # 3️⃣  Re‑phrase
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=120,
    )

    improved = resp.choices[0].message.content.strip()

    return RephraseResponse(original=original_msg, tone=tone, rephrased=improved)

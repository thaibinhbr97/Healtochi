import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from utils.tts import text_to_speech
from utils.solana_utils import reward_user

load_dotenv()

app = FastAPI(title="Healtogochi API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Response-Text"],
)

# MongoDB Setup
MONGODB_URL = os.getenv("MONGODB_ATLAS_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.healtogochi

# GenAI Setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest', system_instruction=os.getenv("SYSTEM_INSTRUCTION", "You are Healtogochi, a cute healing pet for kids."))

class MoodLog(BaseModel):
    mood: str
    timestamp: str

class Task(BaseModel):
    id: str
    title: str
    completed: bool
    points: int
    icon: str

@app.get("/")
async def root():
    return {
        "message": "Welcome to Healtogochi API",
        "status": {
            "mongodb": "configured" if os.getenv("MONGODB_ATLAS_URL") else "missing",
            "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
            "elevenlabs": "configured" if os.getenv("ELEVENLABS_API_KEY") else "missing",
            "solana_treasury": "configured" if os.getenv("TREASURY_SECRET_KEY") else "missing"
        }
    }

@app.post("/api/mood")
async def log_mood(mood: MoodLog):
    await db.mood_logs.insert_one(mood.dict())
    return {"status": "success"}

@app.get("/api/tasks")
async def get_tasks():
    tasks = await db.tasks.find().to_list(100)
    for task in tasks:
        task["id"] = str(task["_id"])
        del task["_id"]
    return tasks

@app.post("/api/talk")
async def talk_to_mascot(text: str):
    # Get Gemini response
    chat = model.start_chat()
    response = chat.send_message(text)
    response_text = response.text
    
    # Generate ElevenLabs audio
    audio_content = await text_to_speech(response_text)
    
    if audio_content:
        # Return audio as response with custom header for text
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={"X-Response-Text": response_text}
        )
    
    return {"text": response_text}

@app.post("/api/reward")
async def reward(user_address: str, amount: int):
    # Reward user for completing tasks
    result = await reward_user(user_address, amount)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import os
import uvicorn
import urllib.parse
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
    id: Optional[str] = None
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

# Initial data for seeding
INITIAL_TASKS = [
    {"title": "Drink a glass of water", "points": 5, "icon": "💧", "completed": False},
    {"title": "Take your medicine", "points": 10, "icon": "💊", "completed": False},
    {"title": "Rest for 10 minutes", "points": 10, "icon": "🛌", "completed": False},
    {"title": "Brush your teeth", "points": 5, "icon": "🪥", "completed": False},
    {"title": "Say one thing you like", "points": 5, "icon": "❤️", "completed": False},
]

@app.on_event("startup")
async def startup_db_client():
    # Seed tasks if collection is empty
    count = await db.tasks.count_documents({})
    if count == 0:
        await db.tasks.insert_many(INITIAL_TASKS)
        print("Database seeded with initial tasks!")

@app.get("/api/tasks")
async def get_tasks():
    tasks = await db.tasks.find().to_list(100)
    for task in tasks:
        task["id"] = str(task["_id"])
        del task["_id"]
    return tasks

@app.post("/api/tasks")
async def create_task(task: Task):
    new_task = task.dict()
    # Remove None id so MongoDB generates strictly its own _id
    if "id" in new_task:
        del new_task["id"]
    result = await db.tasks.insert_one(new_task)
    return {"id": str(result.inserted_id), "status": "success"}

@app.post("/api/tasks/seed")
async def seed_tasks():
    await db.tasks.delete_many({}) # Clear existing
    await db.tasks.insert_many(INITIAL_TASKS)
    return {"status": "Database re-seeded!"}

@app.post("/api/talk")
async def talk_to_mascot(text: str):
    # Get Gemini response
    chat = model.start_chat()
    response = chat.send_message(text)
    response_text = response.text
    
    # Generate ElevenLabs audio
    audio_content = await text_to_speech(response_text)
    
    if audio_content:
        # URL encode the text for the header to avoid Unicode issues
        encoded_text = urllib.parse.quote(response_text)
        # Return audio as response with custom header for text
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={"X-Response-Text": encoded_text}
        )
    
    return {"text": response_text}

@app.post("/api/reward")
async def reward(user_address: str, amount: int):
    # Reward user for completing tasks
    result = await reward_user(user_address, amount)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

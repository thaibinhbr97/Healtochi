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
    completedAt: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    points: Optional[int] = None
    icon: Optional[str] = None
    completedAt: Optional[str] = None

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

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate):
    update_data = {k: v for k, v in task_update.dict().items() if v is not None}
    if not update_data:
        return {"status": "no updates"}
    
    from bson import ObjectId
    try:
        result = await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
        if result.modified_count == 1:
            return {"status": "success", "id": task_id}
        return {"status": "success", "message": "No changes made"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class HealthLog(BaseModel):
    action: str  # 'water' or 'food'
    timestamp: str

@app.post("/api/health")
async def log_health(log: HealthLog):
    await db.health_logs.insert_one(log.dict())
    return {"status": "success"}

@app.get("/api/health/stats")
async def get_health_stats():
    # Aggregation to get daily counts for the last 7 days
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=6)
    start_str = start_date.isoformat()
    
    # 1. Aggregate Health Logs (Water/Food)
    health_pipeline = [
        {
            "$match": {
                "timestamp": {"$gte": start_str}
            }
        },
        {
            "$group": {
                "_id": {
                    "date": {"$substr": ["$timestamp", 0, 10]}, 
                    "action": "$action"
                },
                "count": {"$sum": 1}
            }
        }
    ]
    health_data = await db.health_logs.aggregate(health_pipeline).to_list(None)

    # 2. Aggregate Completed Tasks
    task_pipeline = [
        {
            "$match": {
                "completed": True,
                "completedAt": {"$gte": start_str}
            }
        },
        {
            "$group": {
                "_id": {
                    "date": {"$substr": ["$completedAt", 0, 10]}
                },
                "count": {"$sum": 1}
            }
        }
    ]
    task_data = await db.tasks.aggregate(task_pipeline).to_list(None)
    
    # 3. Merge Data for last 7 days
    stats = []
    for i in range(7):
        d = start_date + timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        day_data = {"date": date_str, "water": 0, "food": 0, "tasks": 0}
        
        # Fill Health Data
        for log in health_data:
            if log["_id"]["date"] == date_str:
                day_data[log["_id"]["action"]] = log["count"]
        
        # Fill Task Data
        for t in task_data:
            if t["_id"]["date"] == date_str:
                day_data["tasks"] = t["count"]
        
        stats.append(day_data)
        
    return stats

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

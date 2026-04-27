import os
from dotenv import load_dotenv

# Load environment variables before other imports
load_dotenv()

from datetime import datetime, timezone, timedelta
import uvicorn
import urllib.parse
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from utils.tts import text_to_speech
from utils.solana_utils import reward_user

# Setup logging to file
import logging
logging.basicConfig(
    filename="api.log", 
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed tasks if collection is empty
    count = await db.tasks.count_documents({})
    if count == 0:
        await db.tasks.insert_many(INITIAL_TASKS)
        print("Database seeded with initial tasks!")
    yield

app = FastAPI(title="Healtogochi API", lifespan=lifespan)

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
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview', system_instruction=os.getenv("SYSTEM_INSTRUCTION", "You are Healtogochi, a cute healing pet for kids."))

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

class RewardRequest(BaseModel):
    user_address: str
    amount: int
    points: Optional[int] = None
    icon: Optional[str] = None
    completedAt: Optional[str] = None

@app.middleware("http")
async def remove_double_slashes(request, call_next):
    # If the path contains //, replace it with /
    new_path = request.url.path.replace("//", "/")
    if new_path != request.url.path:
        request.scope["path"] = new_path
    return await call_next(request)

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

@app.patch("/api/tasks/{task_id}")
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
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=6)
    start_str = start_date.isoformat().replace("+00:00", "Z")
    
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

class ChatLog(BaseModel):
    user_text: str
    ai_text: str
    timestamp: str

class ChatRequest(BaseModel):
    text: str
    tasks: List[Task]

@app.post("/api/talk")
async def talk_to_mascot(request: ChatRequest):
    try:
        text = request.text
        tasks = request.tasks
        
        # Construct Context from Tasks
        task_context = "The child has the following goals:\n"
        for t in tasks:
            status = "COMPLETED" if t.completed else "NOT DONE"
            task_context += f"- {t.title} ({status})\n"
        
        system_prompt = os.getenv("SYSTEM_INSTRUCTION", "You are Healtogochi.")
        full_prompt = f"{system_prompt}\n\nCONTEXT:\n{task_context}\n\nCHILD SAYS: {text}"

        print(f"DEBUG: Talking to Gemini (flash-latest) with prompt: {full_prompt[:100]}...")

        # Get Gemini response
        chat = model.start_chat()
        response = chat.send_message(full_prompt)
        
        try:
            response_text = response.text
        except Exception as e:
            print(f"DEBUG: Gemini response.text failed: {e}")
            if hasattr(response, 'candidates'):
                 print(f"DEBUG: Response candidates: {response.candidates}")
            response_text = "I'm sorry, I'm having trouble thinking right now. Pip pip!"

        print(f"DEBUG: Gemini response: {response_text}")

        # Save to MongoDB
        await db.chat_logs.insert_one({
            "user_text": text,
            "ai_text": response_text,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        })

        # Generate ElevenLabs audio
        print("DEBUG: Generating audio via ElevenLabs...")
        audio_content = await text_to_speech(response_text)
        
        if audio_content:
            print("DEBUG: Audio generated successfully.")
            # URL encode the text for the header to avoid Unicode issues
            encoded_text = urllib.parse.quote(response_text)
            # Return audio as response with custom header for text
            return Response(
                content=audio_content,
                media_type="audio/mpeg",
                headers={"X-Response-Text": encoded_text}
            )
        
        print("DEBUG: Audio generation failed or skipped.")
        return {"text": response_text}
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"ERROR in talk_to_mascot: {error_msg}")
        traceback.print_exc()
        
        # Detect Quota/Rate Limit errors
        if "429" in error_msg or "quota" in error_msg.lower():
            friendly_msg = "Oops! My brain is a bit tired from talking so much. Please try again in a minute! Pip pip!"
            return Response(content=friendly_msg, status_code=429)
            
        return Response(content=f"Error: {error_msg}", status_code=500)

@app.get("/api/parent/chat-history")
async def get_chat_history():
    logs = await db.chat_logs.find().sort("timestamp", -1).to_list(100)
    for log in logs:
        log["id"] = str(log["_id"])
        del log["_id"]
    return logs

@app.post("/api/reward")
async def reward(req: RewardRequest):
    # Reward user for completing tasks
    result = await reward_user(req.user_address, req.amount)
    return result

@app.get("/api/balance/{user_address}")
async def get_balance(user_address: str):
    from utils.solana_utils import get_token_balance
    result = await get_token_balance(user_address)
    return result

class SpendRequest(BaseModel):
    user_address: str
    amount: int
    item_name: str

@app.post("/api/spend")
async def spend(req: SpendRequest):
    from utils.solana_utils import spend_tokens
    result = await spend_tokens(req.user_address, req.amount)
    if result["status"] == "success":
        # Log the purchase
        print(f"User {req.user_address[:8]}... spent {req.amount} on {req.item_name}")
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

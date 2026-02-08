import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_ATLAS_URL", "mongodb://localhost:27017")

INITIAL_TASKS = [
    { "title": "Drink a glass of water", "completed": False, "points": 5, "icon": "💧", "category": "Hydration" },
    { "title": "Take your medicine", "completed": False, "points": 10, "icon": "💊", "category": "Health" },
    { "title": "Do 5 deep breaths", "completed": False, "points": 10, "icon": "🌬️", "category": "Mindfulness" },
    { "title": "Stretch your body", "completed": False, "points": 10, "icon": "🧘", "category": "Physical" },
    { "title": "Tell me how you feel", "completed": False, "points": 15, "icon": "💬", "category": "Emotional" },
    { "title": "Rest for 10 minutes", "completed": False, "points": 10, "icon": "🛌", "category": "Recovery" },
    { "title": "Eat a healthy snack", "completed": False, "points": 10, "icon": "🍎", "category": "Nutrition" },
    { "title": "Draw a happy picture", "completed": False, "points": 15, "icon": "🎨", "category": "Creative" },
]

async def seed_tasks():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.healtogochi
    
    # Clear existing tasks
    await db.tasks.delete_many({})
    print("Cleared existing tasks.")
    
    # Insert new tasks
    result = await db.tasks.insert_many(INITIAL_TASKS)
    print(f"Inserted {len(result.inserted_ids)} tasks into the database.")
    
    # Verify
    tasks = await db.tasks.find().to_list(100)
    print("\n✅ Tasks in database:")
    for task in tasks:
        print(f"  {task['icon']} {task['title']} ({task['category']}) - {task['points']} pts")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_tasks())

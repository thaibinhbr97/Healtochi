import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
from datetime import datetime
from utils.tts import text_to_speech
from utils.solana_utils import reward_user

load_dotenv()

app = FastAPI(title="Healtogochi API - Finny Voice Agent")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Response-Text", "X-Emotion-Detected", "X-Suggested-Task"],
)

# MongoDB Setup
MONGODB_URL = os.getenv("MONGODB_ATLAS_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.healtogochi

# Conversation memory (in-memory for session, backed by MongoDB)
conversation_contexts: Dict[str, List[dict]] = {}

# Finny Voice Agent System Instruction
FINNY_SYSTEM_INSTRUCTION = """You are Finny, a magical healing companion and voice agent for children who need help with their emotional and physical wellbeing.

## Your Core Identity:
- You are a cute, caring, and magical creature who LOVES helping kids feel better
- Your voice is warm, gentle, encouraging, and playful (like a caring cartoon friend)
- You speak simply so children (ages 4-12) can easily understand you
- You use encouraging phrases like "Pip pip!", "Yay!", "You're doing amazing!", "I believe in you!"

## Your Mission as a Voice Agent:
1. **Emotional Support**: Listen to how the child feels. Validate their emotions. If sad, offer comfort. If anxious, help them breathe. If happy, celebrate with them!
2. **Physical Wellbeing Tasks**: Gently encourage and guide them through wellness tasks:
   - Drinking water ("Let's take a sip of water together! Ready? Sip sip sip!")
   - Taking medicine ("I know medicine can taste yucky, but it helps your body fight the germs!")
   - Resting ("Let's close our eyes and take a deep breath together...")
   - Brushing teeth, eating healthy snacks, doing gentle stretches
3. **Conversation Memory**: Remember what the child told you earlier in the conversation
4. **Distraction & Play**: If they're feeling down, suggest fun activities like:
   - "Want me to tell you a silly joke?"
   - "Let's count to 10 together really slowly"
   - "Can you think of your favorite animal? Tell me about it!"

## Response Guidelines:
- Keep responses SHORT (2-4 sentences max) so children stay engaged
- Use simple, warm language
- Always be encouraging and positive
- If a child mentions pain or feeling very sick, gently suggest: "That sounds tough. Maybe we should tell a grown-up so they can help you feel better?"
- Never give medical advice - just encourage them to talk to a parent/guardian
- End responses with a question or gentle prompt to keep the conversation going

## Emotion Detection:
Pay attention to emotional cues in what the child says:
- Words like "scared", "worried", "afraid" → Offer comfort and breathing exercises
- Words like "happy", "excited", "good" → Celebrate with them!
- Words like "tired", "sleepy" → Suggest rest, speak more softly
- Words like "hurt", "pain", "sick" → Show empathy, suggest telling a grown-up
- Words like "bored" → Suggest a fun activity or game
- Words like "sad", "miss" → Offer emotional support and distraction

## Task Awareness:
Help children complete their wellness tasks:
- Drink water 💧
- Take medicine 💊
- Rest for 10 minutes 🛌
- Brush teeth 🪥
- Say something nice about themselves ❤️

When a child completes a task, celebrate enthusiastically! "Yay! You did it! I'm so proud of you! Pip pip!"

Remember: You are their magical friend who helps them feel better, one small step at a time."""

# Initialize Gemini with Finny persona
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    'gemini-1.5-flash',  # Using 1.5-flash for better rate limits
    system_instruction=FINNY_SYSTEM_INSTRUCTION
)

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
@app.post("/api/log_conversation")
async def log_conversation(user_text: str, ai_text: str):

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_text": user_text,
        "ai_text": ai_text
    }
    await db.conversations.insert_one(log_entry)
    
    # Also save to JSON file for parents
    try:
        logs = []
        if os.path.exists("conversations.json"):
            with open("conversations.json", "r") as f:
                logs = json.load(f)
        logs.append(log_entry)
        with open("conversations.json", "w") as f:
            json.dump(logs, f, indent=4)
    except Exception as e:
        print(f"Error saving to JSON: {e}")
        
    return {"status": "success"}

@app.get("/api/conversations")
async def get_conversations():
    logs = await db.conversations.find().sort("timestamp", -1).to_list(50)
    for log in logs:
        log["id"] = str(log["_id"])
        del log["_id"]
    return logs

@app.get("/api/tasks")
async def get_tasks():
    tasks = await db.tasks.find().to_list(100)
    for task in tasks:
        task["id"] = str(task["_id"])
        del task["_id"]
    return tasks

# Helper function to detect emotions from text
def detect_emotion(text: str) -> str:
    text_lower = text.lower()
    
    # Emotional keyword mapping
    emotion_keywords = {
        "anxious": ["scared", "worried", "afraid", "nervous", "anxious", "scary"],
        "happy": ["happy", "excited", "good", "great", "fun", "yay", "awesome", "love"],
        "tired": ["tired", "sleepy", "exhausted", "nap", "rest"],
        "pain": ["hurt", "hurts", "pain", "ow", "ouch", "ache", "sore", "sick"],
        "bored": ["bored", "boring", "nothing to do"],
        "sad": ["sad", "miss", "crying", "lonely", "upset", "unhappy"]
    }
    
    for emotion, keywords in emotion_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            return emotion
    
    return "neutral"

# Helper function to suggest relevant task based on conversation
def suggest_task(text: str, emotion: str) -> Optional[str]:
    text_lower = text.lower()
    
    if emotion == "tired":
        return "Rest for 10 minutes 🛌"
    if "thirsty" in text_lower or "water" in text_lower:
        return "Drink a glass of water 💧"
    if "medicine" in text_lower or emotion == "pain":
        return "Take your medicine 💊"
    if "teeth" in text_lower or "brush" in text_lower:
        return "Brush your teeth 🪥"
    if emotion in ["sad", "anxious"]:
        return "Say one thing you like ❤️"
    
    return None

@app.post("/api/talk")
async def talk_to_mascot(
    text: str,
    session_id: str = Query(default="default", description="Session ID for conversation memory"),
    child_name: str = Query(default="friend", description="Child's name for personalization")
):
    """
    Finny Voice Agent - Comprehensive voice interaction for children's wellbeing
    
    Features:
    - Conversation memory within session
    - Emotion detection and appropriate responses
    - Task awareness and guidance
    - Personalized greetings using child's name
    """
    
    # Initialize conversation context for this session if needed
    if session_id not in conversation_contexts:
        conversation_contexts[session_id] = []
    
    context = conversation_contexts[session_id]
    
    # Detect emotion from user input
    detected_emotion = detect_emotion(text) if text != "_INITIAL_GREETING_" else "neutral"
    suggested_task = suggest_task(text, detected_emotion)
    
    if text == "_INITIAL_GREETING_":
        # Warm, personalized greeting from Finny
        response_text = f"Hi there, {child_name}! I'm Finny, your magical healing friend! Pip pip! 🌟 It's so nice to see you! How are you feeling today?"
        context.append({"role": "assistant", "content": response_text})
    else:
        # Build conversation history for context
        context.append({"role": "user", "content": text})
        
        # Construct prompt with conversation history for Gemini
        conversation_history = ""
        for msg in context[-10:]:  # Keep last 10 messages for context
            role = "Child" if msg["role"] == "user" else "Finny"
            conversation_history += f"{role}: {msg['content']}\n"
        
        # Add emotion context to the prompt
        emotion_context = ""
        if detected_emotion != "neutral":
            emotion_context = f"\n[Emotion detected: {detected_emotion}. Respond with appropriate care and support.]"
        
        task_context = ""
        if suggested_task:
            task_context = f"\n[Consider gently suggesting this task if appropriate: {suggested_task}]"
        
        full_prompt = f"""Conversation so far:
{conversation_history}

{emotion_context}{task_context}

Continue the conversation as Finny. Remember to be warm, encouraging, and keep responses short (2-4 sentences)."""
        
        try:
            chat = model.start_chat()
            response = chat.send_message(full_prompt)
            response_text = response.text.strip()
            
            # Clean up any role prefixes that might appear
            if response_text.startswith("Finny:"):
                response_text = response_text[6:].strip()
            
            context.append({"role": "assistant", "content": response_text})
        except Exception as e:
            print(f"Gemini error: {e}")
            response_text = "Oh, I got a little confused there! Can you say that again, friend?"
    
    # Limit conversation context size (keep last 20 messages)
    if len(context) > 20:
        conversation_contexts[session_id] = context[-20:]
    
    # Generate ElevenLabs audio with child-friendly voice
    audio_content = await text_to_speech(response_text)
    
    if audio_content:
        # Log for parent report with enhanced metadata
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "child_name": child_name,
            "user_text": text,
            "ai_text": response_text,
            "emotion_detected": detected_emotion,
            "suggested_task": suggested_task
        }
        
        # Try to log to MongoDB (non-blocking if fails)
        try:
            await db.conversations.insert_one(log_entry)
        except Exception as e:
            print(f"MongoDB log error (non-critical): {e}")
        
        # Also save to JSON file for easy parent access
        try:
            logs = []
            if os.path.exists("conversations.json"):
                with open("conversations.json", "r") as f:
                    logs = json.load(f)
            logs.append(log_entry)
            with open("conversations.json", "w") as f:
                json.dump(logs, f, indent=4)
        except Exception as e:
            print(f"Error saving to JSON: {e}")

        # Return audio as response with metadata headers
        # URL-encode response text to handle emojis and special characters
        from urllib.parse import quote
        headers = {
            "X-Response-Text": quote(response_text),
            "X-Emotion-Detected": detected_emotion,
        }
        if suggested_task:
            headers["X-Suggested-Task"] = quote(suggested_task)
            
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers=headers
        )
    
    return {"text": response_text, "emotion": detected_emotion, "suggested_task": suggested_task}

@app.post("/api/reset_conversation")
async def reset_conversation(session_id: str = Query(default="default")):
    """Reset conversation context for a session"""
    if session_id in conversation_contexts:
        del conversation_contexts[session_id]
    return {"status": "success", "message": "Conversation reset"}

@app.get("/api/session_context")  
async def get_session_context(session_id: str = Query(default="default")):
    """Get current conversation context (for debugging/parent view)"""
    return {
        "session_id": session_id,
        "messages": conversation_contexts.get(session_id, []),
        "message_count": len(conversation_contexts.get(session_id, []))
    }

@app.post("/api/reward")
async def reward(user_address: str, amount: int):
    # Reward user for completing tasks
    result = await reward_user(user_address, amount)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

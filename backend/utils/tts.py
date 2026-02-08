import os
import httpx
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Child-friendly voice options - Choose one that sounds warm and friendly
# Some good options:
# - "21m00Tcm4TlvDq8ikWAM" (Rachel - warm female)
# - "EXAVITQu4vr4xnSDxMaL" (Bella - soft and warm)
# - "pNInz6obpgDQGcFmaJgB" (Adam - friendly male)
# - "jBpfuIE2acCO8z3wKNLl" (Gigi - young, energetic female)
# 
# For Finny, we want a voice that is:
# - Warm and comforting
# - Slightly higher pitched (child-friendly)
# - Expressive and playful
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "jBpfuIE2acCO8z3wKNLl")  # Gigi - young & energetic

async def text_to_speech(text: str):
    """
    Convert text to speech using ElevenLabs API
    Optimized for Finny's warm, child-friendly voice
    """
    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API Key missing")
        return None
    
    # Clean text of emojis for better pronunciation
    import re
    clean_text = re.sub(r'[^\w\s.,!?\'"()-]', '', text)
        
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": clean_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            # Higher stability for clearer pronunciation for children
            "stability": 0.65,
            # Higher similarity boost to maintain consistent voice
            "similarity_boost": 0.75,
            # Add some expressiveness for playful responses
            "style": 0.4,
            # Use speaker boost for cleaner audio
            "use_speaker_boost": True
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return response.content
            else:
                print(f"ElevenLabs error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"ElevenLabs request error: {e}")
            return None


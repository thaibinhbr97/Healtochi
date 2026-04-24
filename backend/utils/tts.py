import os
import httpx
import logging
from dotenv import load_dotenv

# Note: load_dotenv() is called in main.py, but we call it here for standalone tests
load_dotenv()

async def text_to_speech(text: str):
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "hpp4J3VqNfWAUOO0d1Us")
    
    logging.info(f"TTS: Generating audio for text: {text[:50]}...")
    
    if not api_key:
        logging.error("TTS: ElevenLabs API Key missing")
        return None
        
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            logging.debug(f"TTS: Requesting ElevenLabs at {url}")
            response = await client.post(url, json=data, headers=headers, timeout=30.0)
            if response.status_code == 200:
                logging.info(f"TTS: Successfully generated {len(response.content)} bytes of audio")
                return response.content
            else:
                error_msg = f"ElevenLabs error: {response.status_code} - {response.text}"
                logging.error(f"TTS: {error_msg}")
                print(error_msg)
                return None
    except Exception as e:
        logging.error(f"TTS: Exception during ElevenLabs call: {str(e)}")
        print(f"TTS Exception: {e}")
        return None

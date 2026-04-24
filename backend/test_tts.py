import asyncio
import os
from utils.tts import text_to_speech
from dotenv import load_dotenv

async def main():
    load_dotenv()
    print("Testing ElevenLabs TTS...")
    print(f"API Key: {os.getenv('ELEVENLABS_API_KEY')[:5]}...")
    print(f"Voice ID: {os.getenv('ELEVENLABS_VOICE_ID')}")
    
    result = await text_to_speech("Hello, this is a test.")
    if result:
        print(f"SUCCESS! Received {len(result)} bytes of audio.")
    else:
        print("FAILED to generate audio. Check console for errors.")

if __name__ == "__main__":
    asyncio.run(main())

# Healtogochi: Hackathon Strategy & Implementation

Healtogochi is a self-care companion for sick kids, inspired by Finch and Tamagotchi. It uses AI to provide comfort, motivation, and gamified health goals.

## 🏆 Hackathon Prize Integration

### 1. [MLH] Best Use of MongoDB Atlas
- **Implementation**: Used as the primary database for storing user profiles, mood logs, and task status.
- **Backend**: FastAPI with `motor` (asynchronous MongoDB driver).
- **Benefit**: Scalable cloud storage for kid's health journeys.

### 2. [MLH] Best Use of Gemini API
- **Implementation**: The "Brain" of the mascot.
- **Model**: `gemini-2.5-flash`.
- **Logic**: Analyzes child's input to provide empathetic, character-driven responses and motivates them through self-care tasks.

### 3. [MLH] Best Use of ElevenLabs
- **Implementation**: The "Voice" of the mascot.
- **Feature**: character-accurate, high-quality TTS for kids.
- **Differentiation**: Instead of robotic pre-built voices, we use ElevenLabs to give the mascot a warm, animated character personality.

### 4. [MLH] Best Use of Solana
- **Implementation**: "HealtoCoins" rewarded for completing health goals (e.g., drinking water, resting).
- **Mechanism**: Reward endpoint triggers a devnet transfer to the student's wallet (mocked/simulated for demo).
- **Gamification**: Kids can spend coins in the "Mascot Shop" to buy virtual snacks and toys for their pet.

### 5. [MLH] Best Use of Vultr
- **Implementation**: Dockerized backend ready for deployment on Vultr Cloud Compute.
- **Scripting**: Included Dockerfile and deployment strategy for high-performance AI inference.

## 🛠 Features Inspired by Finch
- **Mood Tracker**: Color-coded mood logging for kids.
- **Goal Tracker**: Health-centric goals (hydration, rest, medicine).
- **Breathing Exercise**: Interactive guided breathing.
- **Stats (Journey)**: Visualizing progress and growth.

## 🚀 How to Run
1. **Backend**: 
   - `cd backend`
   - `pip install -r requirements.txt`
   - `python main.py`
2. **Frontend**:
   - `npm install`
   - `npm run dev`
3. **Environment**: 
   - Copy `.env.example` to `.env` and fill in keys.

<div align="center">
<img width="1200" height="475" alt="Healtogochi Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Healtogochi 🐾

Helping chronically ill children maintain physical and emotional wellbeing through engaging gameplay.

---

## 🌟 Overview

**Healtogochi** is an AI-powered virtual pet companion designed specifically for chronically ill children. Inspired by the classic Tamagotchi and wellness apps like Finch, it turns exhausting daily health routines into an engaging, rewarding adventure.

### 🐾 How it Works
- **Nurture through Self-Care**: Kids take care of their friendly pet "Finny" by taking care of themselves. Actions like drinking water, taking medicine, and deep breathing directly impact Finny's happiness and growth.
- **Empathetic AI Companion**: Powered by **Google Gemini**, Finny isn't just a bot—he's a friend who listens, understands emotions, and provides character-driven motivation.
- **On-Chain Rewards**: Completing health goals earns **$HLT (HealtoCoin)** tokens on the **Solana** blockchain, which can be spent in the Mascot Shop for virtual treats and toys.

---

## ✨ Features

- 🎙️ **Voice Interaction**: Chat naturally with Finny using child-friendly voice synthesis powered by **ElevenLabs**.
- 🎯 **Daily Health Goals**: Simple, achievable tasks for hydration, rest, medication, and emotional check-ins.
- 💰 **Web3 Economy**: Real SPL token rewards ($HLT) on Solana Devnet for real-world health achievements.
- 👨‍👩‍👧 **Parent Mode**: Secure access for parents to review chat history and track their child's wellness journey.
- 📊 **Health Journey**: Beautifully visualized progress logs stored securely in **MongoDB Atlas**.
- 🛒 **Mascot Shop**: Spend earned tokens on premium items for your virtual pet.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Lucide Icons
- **Backend**: Python (FastAPI), Uvicorn
- **AI & ML**: Google Gemini 2.5 Flash, ElevenLabs TTS
- **Blockchain**: Solana (Devnet), SPL Token
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: Docker, Vultr (Backend), Vercel (Frontend)

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.11+
- MongoDB Atlas account
- Gemini API Key
- ElevenLabs API Key

### Backend Setup
1. `cd backend`
2. `python -m venv .venv`
3. `source .venv/bin/activate` (Mac/Linux) or `.venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Create a `.env` file (see `.env.example`) and fill in your keys.
6. `python main.py`

### Frontend Setup
1. In the root directory: `npm install`
2. `npm run dev`
3. Open `http://localhost:3000` in your browser.

---

## 🏗️ Project Structure
- `/backend`: FastAPI server, AI logic, and Solana integration.
- `/components`: Modular React components for the Shop, Voice UI, and Stats.
- `/utils`: Common utility functions for both backend and frontend.
- `App.tsx`: The heart of the Healtogochi experience.

---

## 🎨 Design Philosophy
Healtogochi is built to be a safe, joyful space. We prioritize:
1. **Safety**: Every interaction is designed with children in mind.
2. **Empathy**: AI responses are warm, short, and supportive.
3. **Incentivization**: Moving from "I have to" to "I want to" through gamification.

---

## 🏆 Hackathon Details
This project was built for **Hack the Coast 2026**.
For a deep dive into our challenges, accomplishments, and what we learned, see [ABOUT.md](./ABOUT.md).

---

*Built with ❤️ for every child who deserves a friend who makes wellness feel like winning.*

# Healtogochi 🐾

> **Helping chronically ill children maintain physical and emotional wellbeing through engaging gameplay.**

---

## Inspiration

Every day, millions of chronically ill children face exhausting routines — medications, hydration schedules, rest periods, and emotional check-ins. For kids, these tasks feel overwhelming, isolating, and boring. Parents struggle to motivate their children to stick to wellness habits. Traditional health apps? They're built for adults, not kids.

We asked ourselves: *What if self-care felt like playing a game instead of following doctor's orders?*

Inspired by the beloved **Tamagotchi** toys from our childhood, we envisioned a digital pet companion that kids could nurture — not by feeding virtual snacks, but by **taking care of themselves**. Drink water? Your pet gets happier. Take your medicine? Your pet grows stronger. Talk about your feelings? Your pet gives you a hug.

The magic happens when **wellness becomes play**.

---

## What it does

Healtogochi is an AI-powered virtual pet companion designed specifically for chronically ill children. Here's how it works:

🐾 **Virtual Pet Companion** — Kids nurture a friendly pet named "Finny" who responds to their wellness actions

🎯 **Health Goals** — Daily self-care tasks like drinking water, taking medicine, deep breathing, stretching, and emotional check-ins

🎙️ **Voice Interaction** — Finny talks WITH kids using natural, empathetic voice powered by AI — not robotic text responses

💰 **Real Crypto Rewards** — Completing tasks earns **$HLT (HealtoCoin)** tokens on Solana blockchain — real, verifiable rewards kids can see on-chain

🛒 **In-App Shop** — Spend $HLT to buy virtual treats and accessories for their pet

👨‍👩‍👧 **Parent Mode** — Parents can review all conversations to ensure safety and track their child's wellness journey

📊 **Health Journey** — Visual progress tracking over time, with data stored securely for future reference

---

## How we built it

### Frontend
- **React + Vite + TypeScript** — Fast, responsive single-page application
- **TailwindCSS** — Beautiful, mobile-first UI with animations
- **Web Speech API** — Voice input for natural conversation

### Backend
- **Python FastAPI** — High-performance REST API
- **Gemini API** — Empathetic AI conversation engine with custom child-friendly persona
- **ElevenLabs** — Natural text-to-speech for Finny's voice
- **MongoDB Atlas** — Persistent storage for health logs, chat history, and tasks

### Blockchain
- **Solana Devnet** — Custom $HLT SPL token for rewards
- **Treasury Wallet** — Backend-managed token distribution
- **On-Chain Balance** — Real-time balance verification displayed in-app

### The $HLT Token
- **Mint Address**: `BvEYVcFZqVZnfpJUdFXXRstUGwFUqUGMch4NYRWfUgEV`
- **Decimals**: 6
- **Supply**: 1,000,000 $HLT

---

## Challenges we ran into

**1. SPL Token Library Breaking Changes**
The `spl-token` Python library had undocumented API changes. Functions like `initialize_mint` and `create_associated_token_account` had completely different signatures than the documentation suggested. We spent hours debugging `ImportError` and `TypeError` exceptions.

*Solution*: Used Python's `inspect.signature()` to reverse-engineer the correct function parameters.

**2. Custodial Wallet Design**
For a kids' app, requiring Phantom wallet connections wasn't practical. We needed a way to give kids real blockchain rewards without complex wallet setups.

*Solution*: Implemented a custodial model where the treasury wallet manages tokens on behalf of users. The backend handles all transaction signing.

**3. Child-Safe AI Responses**
Gemini is powerful but needed careful guardrails to ensure responses were age-appropriate, short, and encouraging without being clinical.

*Solution*: Crafted detailed system prompts that define Finny's personality, vocabulary, and response length limits.

**4. Voice Latency**
Kids expect instant gratification. Streaming audio from ElevenLabs while keeping the UI responsive was challenging.

*Solution*: Optimistic UI updates combined with background audio streaming.

---

## Accomplishments that we're proud of

✅ **Created a custom SPL token on Solana** — Kids earn real blockchain tokens for completing health goals

✅ **Built a genuinely empathetic AI companion** — Finny listens, encourages, and celebrates with kids

✅ **Designed for safety** — Parent Mode lets guardians review all conversations

✅ **Made wellness feel rewarding** — The token economy creates tangible incentives for self-care

✅ **Mobile-responsive UI** — Works beautifully on phones where kids actually use it

✅ **End-to-end integration** — Gemini + ElevenLabs + Solana + MongoDB all working together seamlessly

---

## What we learned

🧠 **AI can be a friend, not just a tool** — With the right persona design, AI companions can provide genuine emotional support to children

⛓️ **Blockchain for good exists** — Solana's low fees and fast transactions make micro-rewards practical and magical for kids

🎤 **Voice changes everything** — The way you say something matters as much as what you say. A warm voice builds trust.

📊 **Health data tells stories** — Persistent logging transforms casual play into meaningful health insights for parents and doctors

👶 **Design for kids is hard** — Every interaction needs to be simple, encouraging, and safe

---

## What's next for Healtogochi

🔗 **Phantom Wallet Integration** — Let parents connect real wallets for token transfers

🏅 **NFT Achievements** — Mint milestone badges as collectible NFTs

👨‍⚕️ **Doctor Dashboard** — Share health logs with healthcare providers

👥 **Multiplayer Mode** — Kids can see their friends' pets and cheer each other on

� **Multi-language Support** — Expand to help children globally

📱 **Native Mobile App** — iOS and Android apps for better performance

---

*Built with ❤️ at Hack the Coast 2026*

*Because every child deserves a friend who makes wellness feel like winning.*

# Vidora - Safe & Spam-Free Video Conferencing Platform  

**Vidora** is an intelligent and secure video conferencing platform that focuses on **spam-free**, **toxic-free**, and **AI-moderated** communication.  
It is built to ensure **safe real-time collaboration** using advanced moderation techniques, contextual AI checks, and host-controlled meeting environments.

---

## Overview  

Vidora combines **real-time WebRTC communication**, **Socket.io-based signaling**, and **AI-powered content moderation** to create a platform that’s both **lightweight** and **intelligent**.  

Unlike conventional conferencing systems, Vidora integrates **multi-layer spam detection**, **NLP-based toxicity scoring**, and **adaptive cooldown management** to protect users from message floods, profanity, and unwanted spam bots.

---

## Core Technical Features  

###  Real-Time Architecture  
- **Frontend:** React.js + WebRTC + Socket.io-Client  
- **Backend:** Node.js (Express + Socket.io)  
- **Transport Layer:** WebSockets (event-driven full-duplex communication)  
- **Database:** MongoDB (optional persistence layer)  
- **AI API:** Google Perspective API for NLP-based content analysis  

---

## 🛡️ Safety & Moderation System  

Vidora employs **13+ independent moderation and safety layers**, combining both **AI and rule-based filters** for comprehensive protection.  

| Layer | Description | Technology / Logic Used |
|:------|:-------------|:------------------------|
| **1. Room Mode Control** | Host can switch between `normal` and `restricted` modes. | Socket-level flag management |
| **2. Per-User Message Tracking** | Tracks last message timestamp and count per user to enforce limits. | In-memory object map |
| **3. Message Rate Limiting** | Restricts messages if sent too frequently. | Custom time-window throttle |
| **4. Duplicate Message Detection** | Blocks repeated messages (e.g. “hi hi hi”). | Exact match check |
| **5. Fuzzy Similarity Detection** | Prevents near-duplicate spam using similarity ratio. | Levenshtein distance / string-similarity |
| **6. Profanity & Slur Filtering** | Detects and blocks offensive words in English & Hindi. | Custom profanity dictionary + regex |
| **7. AI Toxicity Analysis** | Uses NLP to detect toxicity, insult, threat, or spam. | Google Perspective API |
| **8. Spam Pattern Recognition** | Detects repeated short words or emojis. | Token length + pattern analysis |
| **9. Temporary Cooldown Enforcement** | Applies message send cooldown on repeated violations. | Timer-based blocking system |
| **10. User Warning Feedback** | Sends visible UI alerts (e.g. “Please slow down”, “Toxic message blocked”). | Socket event emission |
| **11. Time-Window Cleanup** | Removes stale user data to reduce memory leaks. | Interval cleanup logic |
| **12. Safe Broadcasting** | Only valid messages broadcasted to room members. | Conditional emit in `socketManager.js` |
| **13. Frontend Cooldown Timer** | Disables chat input temporarily after spam detection. | React state-driven countdown |

 **Result:** A spam-free, toxicity-resistant, high-integrity chat system within a live video environment.

---

## AI Moderation Layer  

### Integrated API  
**Google Perspective API**  
- Parameters analyzed:  
  - `TOXICITY`  
  - `INSULT`  
  - `SPAM`  
  - `THREAT`  
- Confidence scoring thresholds applied before accepting/rejecting messages.  

### Example Logic  
If `toxicity > 0.8` or `spam > 0.5`, message is auto-blocked and cooldown applied.  

---

## System Architecture Diagram  




---

## Tech Stack  

| Category | Technologies Used |
|:----------|:------------------|
| **Frontend** | React.js, WebRTC, Socket.io-Client, Material UI |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database (optional)** | MongoDB / Mongoose |
| **AI Moderation** | Google Perspective API |
| **Algorithms / Libraries** | `string-similarity`, `bad-words`, custom regex filter |
| **Security Layers** | Rate limiting, input sanitization, isolated rooms, no broadcast leaks |

---

## 🗂️ Folder Structure  




---

## Installation  

### 1. Clone Repository  
```bash
git clone https://github.com/kasaudhanshivam/Vidora.git
cd Vidora
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create .env file:
```bash
PORT=8000
PERSPECTIVE_API_KEY=your_api_key_here
```

Run server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
npm start
```

Visit:

Frontend → http://localhost:5173

Backend → http://localhost:5000

## Future Enhancements

Vidora is designed with scalability and extensibility in mind.  
Below are the planned upgrades and advanced modules to further strengthen its safety, reliability, and usability:
  
- **Admin Moderation Dashboard** — Real-time dashboard for monitoring rooms, reviewing flagged content, and banning abusive users.  
- **Meeting Recording & Replay Module** — Record sessions with optional AI transcription and replay functionality.  
- **Dockerized Deployment with Nginx Proxy** — Containerized architecture for scalable, production-grade deployment.  
- **Toxicity & Usage Analytics** — Insights into user behavior, AI moderation performance, and chat safety metrics.

---

## Contributing

Contributions are always welcome!  

If you’d like to add new features or fix bugs:
1. **Fork** the repository  
2. **Create a new branch** (`git checkout -b feature-name`)  
3. **Commit your changes** (`git commit -m "Added new feature"`)  
4. **Push to your branch** (`git push origin feature-name`)  
5. **Open a Pull Request**

---

## 💙 Developed By

**Shivam Kasaudhan**  
If you like this project, don’t forget to **⭐ star the repo** on GitHub!  
_Code, Create, Caffeinate — and share the love._
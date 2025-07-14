
# Rephrase.AI – Bridging Communication Gaps in Remote Work

_AI-powered real-time rephrasing tool to improve digital communication tone and clarity_

---

## 📝 Project Overview

**Rephrase.AI** is a **Human-Centered AI system** designed to improve remote workplace communication.  
It detects abrupt or unclear messages in real-time and suggests polite, clear, and professional rephrasings.

The goal is to **reduce misunderstandings**, minimize stress from short or harsh digital messages, and improve team dynamics—without replacing human intent.

---

## 💡 Key Features

- **Real-Time AI Rephrasing:** Detects tone and suggests improvements.
- **Context-Aware Suggestions:** Handles "fix this" → "Could you take a look at this when you get a chance?"
- **Frontend Integration:** Works inside messaging platforms like Slack and Chrome extensions.
- **Human-in-the-loop:** Users can accept, modify, or ignore suggestions.
- **Tone Analytics:** Collects data on tone distribution for HR insights.
- **Multi-Platform Ready:** Easily extensible to other chat apps (e.g., Microsoft Teams).

---

## 📊 Problem Statement

Remote communication tools like Slack and Teams often lead to:
- **Miscommunication due to tone loss**
- **Stress from abrupt or unclear messages**
- **Cultural misunderstandings**

**Rephrase.AI bridges this gap by softening and clarifying communication without removing user control.**

---

## ⚙️ System Architecture

```
+--------------------+        +----------------+       +-------------------+
|   Frontend (JS)    | <----> | Node.js Server | <-->  |  FastAPI Server    |
| (Chrome Extension) |        | (Message Relay)|       | (OpenAI Rephrasing)|
+--------------------+        +----------------+       +-------------------+
                                            |
                                            |
                                    +---------------+
                                    | PostgreSQL DB |
                                    | (Tone Logs)   |
                                    +---------------+
```

---

## 🖥️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/TEJA0811/Rephrse.AI.git
```

### 2️⃣ Start the Python (FastAPI) Server

```bash
cd pythonp
uvicorn main:app --reload
```

### 3️⃣ Start the Node.js Server

```bash
cd hcai_pro/new_hcai_test_project/teams-rephrase-app/backend
node server.js
```

### 4️⃣ Setup Ngrok for URL Mapping

```bash
ngrok http 3000
```

Copy the **ngrok HTTPS URL**.

### 5️⃣ Configure Chrome Extension

- Go to `polite-extension/content.js`
- Replace the placeholder URL with your **ngrok URL**.
- Load the extension into Chrome:
  - Open **chrome://extensions**
  - Enable **Developer Mode**
  - Click **Load Unpacked** and select the `polite-extension` folder.

---

## 🧪 Example Rephrasings

| **Original**       | **Rephrased Suggestion**                     |
|-------------------|----------------------------------------------|
| "Fix this"         | "Could you take a look at this when you get a chance?" |
| "Do it now"        | "Please prioritize this task."               |
| "You must"         | "It would be necessary to..."                |
| "This is wrong"    | "This might need adjustment."                |
| "Why didn’t you"   | "Could you share more context?"              |

---

## 📈 Analytics

- **Tone tracking**: Neutral / Angry / Normal tags stored per message.
- **Dashboards**: Track weekly & monthly communication tone trends.
- **Use Case:** HR teams can monitor communication health without storing raw messages.

---

## 🧪 Evaluation

- **44 users** participated in a survey.
- **86.4%** found the tool's purpose **very clear**.
- **75%** rated it **very effective** in softening abrupt messages.
- **72.7%** said messages were **more polite and easier to interpret**.

---

## 🚀 Future Extensions

- Support for **Microsoft Teams**, **Email Plugins**, etc.
- More **personalized suggestions**
- Optional **grammar correction**

---

## 📂 Project Structure

```
Rephrse.AI/
├── pythonp/                # FastAPI server for AI rephrasing
├── hcai_pro/
│   └── new_hcai_test_project/
│       └── teams-rephrase-app/
│           └── backend/    # Node.js server
├── polite-extension/       # Chrome Extension for Slack
├── .env.example             # Sample env file (no keys included)
└── README.md                # (You are here)
```

---

## 🔒 Ethical AI & Privacy

- **Human-Centered AI**: Users maintain full control.
- **No raw messages stored**: Only tone metadata is logged.
- **Opt-in rephrasing**: No automatic message alteration.

---

## 🧑‍💻 Authors

- **Tejas Marasandra Parameshwaraiah** – [tejas.marasandra@st.ovgu.de](mailto:tejas.marasandra@st.ovgu.de)  
- **Gokul Kanna Ramesh** – [gokul.ramesh@st.ovgu.de](mailto:gokul.ramesh@st.ovgu.de)  
- **Mohammad Jaffar Allah Bakash** – [mohammad.allah@st.ovgu.de](mailto:mohammad.allah@st.ovgu.de)

---

## 📄 License

_This project is for academic and research purposes._  
**Contact the authors for usage or collaboration inquiries.**

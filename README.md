# VitalAI - Next-Gen Health Intelligence 🧬

VitalAI is an elite, full-stack health and fitness platform designed to calculate ultra-precise, 3-phase macro diet plans based on physical user parameters. Featuring a spectacular 3D Glassmorphism UI and a powerful Python backend, the system instantly transforms data into actionable conditioning protocols.

## ✨ Premium Features
- **3D Glassmorphism UI:** Stunning frosted-glass aesthetics with `-10px` float hover animations and custom neon accents inspired by leading Silicon Valley design practices.
- **Custom Loading Architecture:** Bespoke `@keyframes` CSS dumbbell animations rendered dynamically while the backend AI synthesizes macro data.
- **Advanced Mock AI Engine:** Categorizes food into strict "STRICTLY EAT" and "STRICTLY AVOID" lists spread dynamically across Breakfast, Lunch, and Dinner.
- **Automated Communication Layer:** Gracefully integrated with **Twilio SMS** and **SMTP Email** APIs to automatically text and email users their diet generation alerts the second a plan is completed.
- **Live Editable Profile Modal:** Users can adjust physical parameters (Age, Weight, Goals) on the fly via an absolute-positioned dark modal that syncs directly with the database using isolated `GET/POST` requests.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Vanilla CSS Modules, Lucide React (Icons).
- **Backend**: Python 3, Flask, Flask-CORS, PyJWT (Authentication).
- **Database**: SQLite (Local embedded storage for massive speed).
- **Integrations**: Twilio (SMS wrapper), SMTPLib (Email Notifications).

## 🚀 Installation & Setup

### 1. Initialize the Backend
The backend utilizes Python Flask to power the authentication engine and the mock AI.
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```
*The backend will safely bind to `http://localhost:5000` and automatically construct the `vital_ai.db` SQLite database.*

### 2. Initialize the Frontend
The frontend utilizes the ultra-fast Vite build tool.
```bash
cd frontend
npm install
npm run dev
```
*The frontend will hot-reload on `http://localhost:5173`. Navigate there to view the architecture!*

## 🔒 Security Configuration
To securely unleash the live email and text notifications, manually override the mock strings in your `backend/.env` file with your physical API keys:
```env
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```
*(If left blank, the application will cleverly fall back to "mock mode" and route the alerts to the terminal instead of crashing).*

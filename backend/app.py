import os
import sqlite3
import datetime
import jwt
import smtplib
from email.mime.text import MIMEText
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'vital_ai_super_secret_key_123')

DB_PATH = 'vital_ai.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            phone TEXT,
            created_at TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS health_profiles (
            user_email TEXT PRIMARY KEY,
            age INTEGER,
            weight REAL,
            height REAL,
            gender TEXT,
            activity_level TEXT,
            health_goals TEXT,
            health_conditions TEXT,
            updated_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- NOTIFICATION SERVICES --- #

def send_email_notification(to_email, subject, body):
    sender = os.environ.get('SMTP_EMAIL')
    password = os.environ.get('SMTP_PASSWORD')
    server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    port = int(os.environ.get('SMTP_PORT', 587))
    
    if sender == 'your_email@gmail.com' or not sender:
        print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        return

    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = f"VitalAI <{sender}>"
        msg['To'] = to_email

        with smtplib.SMTP(server, port) as s:
            s.starttls()
            s.login(sender, password)
            s.send_message(msg)
            print(f"[REAL EMAIL] Sent successfully to {to_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {e}")

def send_sms_notification(to_phone, message):
    sid = os.environ.get('TWILIO_ACCOUNT_SID')
    token = os.environ.get('TWILIO_AUTH_TOKEN')
    t_phone = os.environ.get('TWILIO_PHONE_NUMBER')

    if sid == 'your_account_sid' or not sid:
        print(f"[MOCK SMS] To: {to_phone} | Msg: {message}")
        return

    try:
        client = Client(sid, token)
        msg = client.messages.create(
            body=message,
            from_=t_phone,
            to=to_phone
        )
        print(f"[REAL SMS] Sent successfully to {to_phone}. ID: {msg.sid}")
    except Exception as e:
        print(f"[SMS ERROR] Failed to send text: {e}")

# --- AI ENGINE & API --- #

def generate_ai_diet_plan(prompt):
    return {
        "summary": "Elite conditioning phase: High protein, complex carb distribution.",
        "daily_calories": 2400,
        "water_intake_liters": 3.5,
        "meals": {
            "breakfast": {
                "eat": ["4 egg whites, 1 whole egg", "1 cup oatmeal with blueberries", "Black coffee"],
                "avoid": ["Sugary cereals", "Excessive dairy", "Fruit juices"]
            },
            "lunch": {
                "eat": ["200g grilled chicken", "Quinoa salad with olive oil", "Steamed asparagus"],
                "avoid": ["Heavy dressings", "Fried foods", "Refined grains"]
            },
            "dinner": {
                "eat": ["Baked Atlantic salmon", "Sweet potato", "Broccoli"],
                "avoid": ["Heavy red meats", "Late-night carbs", "High-sodium sauces"]
            }
        },
        "exercise": ["45 mins hypertrophy training", "20 mins HIIT cardio"]
    }

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")
            if len(parts) == 2:
                token = parts[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_db_connection()
            current_user = conn.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
            conn.close()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        if not current_user:
            return jsonify({'message': 'User not found!'}), 401

        return f(dict(current_user), *args, **kwargs)
    return decorated

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', 'User')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    
    if user:
        conn.close()
        return jsonify({'message': 'User already exists!'}), 409

    hashed_password = generate_password_hash(password)
    try:
        conn.execute('INSERT INTO users (email, password, name, phone, created_at) VALUES (?, ?, ?, ?, ?)',
                     (email, hashed_password, name, phone, datetime.datetime.utcnow().isoformat()))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'Database error'}), 500
    conn.close()

    if email:
        send_email_notification(email, "Welcome to VitalAI!", f"Hi {name},\n\nYour account has been created successfully. Set up your health profile to get your personalized AI diet plan!")
    if phone:
        send_sms_notification(phone, f"Welcome to VitalAI, {name}! Your account is ready.")

    return jsonify({'message': 'Registered successfully. Please log in.'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (data.get('email'),)).fetchone()
    conn.close()

    if user and check_password_hash(user['password'], data.get('password')):
        token = jwt.encode({'email': user['email'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'name': user['name']})
    return jsonify({'message': 'Invalid credentials'}), 401
    
@app.route('/api/profile', methods=['GET', 'POST'])
@token_required
def manage_profile(current_user):
    conn = get_db_connection()
    
    if request.method == 'POST':
        data = request.get_json()
        health_conditions = data.get('health_conditions', '')
        if isinstance(health_conditions, list):
             health_conditions = ", ".join(health_conditions)

        conn.execute('''
            INSERT INTO health_profiles (user_email, age, weight, height, gender, activity_level, health_goals, health_conditions, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_email) DO UPDATE SET 
                age=excluded.age, weight=excluded.weight, height=excluded.height, 
                gender=excluded.gender, activity_level=excluded.activity_level, 
                health_goals=excluded.health_goals, health_conditions=excluded.health_conditions, 
                updated_at=excluded.updated_at
        ''', (current_user['email'], data.get('age'), data.get('weight'), data.get('height'), data.get('gender'), data.get('activity_level'), data.get('health_goals'), health_conditions, datetime.datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Profile updated successfully!'})
    else:
        profile = conn.execute('SELECT * FROM health_profiles WHERE user_email = ?', (current_user['email'],)).fetchone()
        conn.close()
        return jsonify(dict(profile) if profile else {})

@app.route('/api/ai/recommendation', methods=['GET'])
@token_required
def get_recommendation(current_user):
    conn = get_db_connection()
    profile = conn.execute('SELECT * FROM health_profiles WHERE user_email = ?', (current_user['email'],)).fetchone()
    conn.close()
    
    if not profile:
        return jsonify({'message': 'Complete profile setup first to get AI recommendations.'}), 400
        
    prompt = f"User profile: {profile['age']}yo {profile['gender']}, {profile['weight']}kg, goals: {profile['health_goals']}."
    diet_plan = generate_ai_diet_plan(prompt)
    
    # Trigger AI Notifications
    if current_user['email']:
        send_email_notification(current_user['email'], "Your Weekly VitalAI Diet Plan is Ready!", f"Good news! We've generated your {diet_plan['daily_calories']} kcal diet profile. Check the dashboard to see your meals and workouts.")
    if current_user['phone']:
        send_sms_notification(current_user['phone'], f"VitalAI Notification: Your {diet_plan['daily_calories']} kcal diet plan is active! Drink {diet_plan['water_intake_liters']}L of water today.")
    
    return jsonify(diet_plan)

@app.route('/api/ai/chat', methods=['POST'])
@token_required
def chat(current_user):
    data = request.get_json()
    return jsonify({"reply": f"I see you're asking about '{data.get('query', '')}'. Keep pushing towards your goals!"})

@app.route('/api/ai/public_chat', methods=['POST'])
def public_chat():
    data = request.get_json()
    return jsonify({"reply": f"As your public VitalAI Assistant, regarding '{data.get('query', '')}', I recommend drinking plenty of water and consulting a doctor for serious concerns. Create an account for personalized diet plans!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

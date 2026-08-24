from datetime import datetime, timezone
from pathlib import Path
import hashlib
import os
import secrets
import smtplib
import sqlite3
from email.message import EmailMessage

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "eduverse.db"

def load_dotenv():
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip().strip('"').strip("'"))

load_dotenv()
app = FastAPI(title="EduVerse API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])

COURSES = [
    {"id": 1, "title": "HTML & CSS", "category": "Programming", "price": 0, "original_price": 0, "lesson_list": [{"title": "Semantic HTML foundations", "topic": "Structure pages with meaningful elements and accessible landmarks."}, {"title": "Responsive layouts with Flexbox", "topic": "Build flexible layouts that adapt to phones, tablets, and desktops."}, {"title": "CSS Grid and reusable components", "topic": "Create consistent visual systems with modern CSS."}, {"title": "Accessibility and forms", "topic": "Make forms and interfaces easier for everyone to use."}]},
    {"id": 2, "title": "JavaScript", "category": "Programming", "price": 29, "original_price": 49, "discount": 40, "promo_ends": "2026-09-07T23:59:59+00:00", "lesson_list": [{"title": "JavaScript essentials", "topic": "Understand variables, functions, arrays, and modern syntax."}, {"title": "DOM events and interaction", "topic": "Make a web page respond to real user actions."}, {"title": "Async requests with Fetch", "topic": "Connect browser interfaces to APIs and live data."}, {"title": "Build a complete browser app", "topic": "Combine your skills into a polished project."}]},
    {"id": 3, "title": "Python", "category": "Programming", "price": 39, "original_price": 39, "lesson_list": [{"title": "Python syntax and data types", "topic": "Write readable Python programs with confidence."}, {"title": "Functions and modules", "topic": "Organize code into reusable, testable pieces."}, {"title": "Working with files and APIs", "topic": "Read data and communicate with online services."}, {"title": "Build a Python automation tool", "topic": "Automate a useful everyday workflow."}]},
    {"id": 4, "title": "Artificial Intelligence", "category": "Technology", "price": 59, "original_price": 89, "discount": 34, "promo_ends": "2026-09-07T23:59:59+00:00", "lesson_list": [{"title": "AI and machine learning basics", "topic": "Learn the ideas behind modern intelligent systems."}, {"title": "Preparing useful datasets", "topic": "Clean and shape data for reliable models."}, {"title": "Neural network concepts", "topic": "Understand how networks learn patterns."}, {"title": "Ship a responsible AI prototype", "topic": "Build a thoughtful prototype with clear limits."}]},
    {"id": 5, "title": "UI / UX Design", "category": "Design", "price": 0, "original_price": 0, "lesson_list": [{"title": "Design thinking and user research", "topic": "Discover what people actually need from a product."}, {"title": "Wireframes and information architecture", "topic": "Plan clear flows before adding visual detail."}, {"title": "Visual systems and typography", "topic": "Use type, spacing, and color with intention."}, {"title": "Prototype and test a user flow", "topic": "Turn ideas into testable product experiences."}]},
    {"id": 6, "title": "Data Science", "category": "Data", "price": 79, "original_price": 99, "discount": 20, "promo_ends": "2026-09-07T23:59:59+00:00", "lesson_list": [{"title": "Data science workflow", "topic": "Move from a question to a defensible answer."}, {"title": "Python data analysis", "topic": "Inspect, transform, and summarize datasets."}, {"title": "Visualize insights clearly", "topic": "Choose charts that make patterns easy to see."}, {"title": "Build a predictive model", "topic": "Train and evaluate a practical first model."}]},
    {"id": 7, "title": "Cyber Security", "category": "Security", "price": 45, "original_price": 45, "lesson_list": [{"title": "Security principles and threats", "topic": "Recognize common risks and how they affect users."}, {"title": "Authentication and access control", "topic": "Protect accounts with sound identity practices."}, {"title": "Web security essentials", "topic": "Understand the most important application defenses."}, {"title": "Create a security checklist", "topic": "Turn knowledge into a repeatable review process."}]},
    {"id": 8, "title": "Digital Marketing", "category": "Business", "price": 25, "original_price": 50, "discount": 50, "promo_ends": "2026-09-07T23:59:59+00:00", "lesson_list": [{"title": "Audience and content strategy", "topic": "Plan useful content for a specific audience."}, {"title": "Search engine fundamentals", "topic": "Help the right people discover your work."}, {"title": "Social campaign planning", "topic": "Build campaigns with a clear message and goal."}, {"title": "Measure campaign performance", "topic": "Use meaningful metrics to improve future campaigns."}]},
]

LESSON_CONTENT = {
    1: [
        "Learn how semantic elements describe page structure, improve accessibility, and help browsers understand your content.",
        "Practice building flexible rows and columns with Flexbox, including alignment, spacing, wrapping, and responsive breakpoints.",
        "Use Grid tracks, areas, and reusable CSS classes to create consistent page layouts that are easy to maintain.",
        "Create accessible labels, controls, focus states, and validation patterns for forms that work for every learner."
    ],
    2: [
        "Work with variables, primitive values, arrays, objects, functions, and modern JavaScript syntax through small exercises.",
        "Select DOM elements, listen for events, and update the interface in response to clicks, typing, and form submissions.",
        "Use Fetch, promises, async functions, and error handling to request data from an API and keep users informed.",
        "Plan a browser app, connect its interface to data, and organize the code into a complete working project."
    ],
    3: [
        "Explore Python variables, strings, numbers, collections, conditionals, and loops by writing readable programs.",
        "Define functions with clear parameters and return values, then split related behavior into reusable modules.",
        "Read and write files safely and make HTTP requests while handling missing data and unexpected responses.",
        "Combine input, business logic, and file or API data to automate a useful everyday task with Python."
    ],
    4: [
        "Compare artificial intelligence, machine learning, and deep learning while learning how models find patterns in examples.",
        "Clean, label, split, and document data so a model can learn from representative and reliable examples.",
        "Understand layers, weights, activation functions, training, and evaluation without treating neural networks as magic.",
        "Design a small AI prototype with measurable goals, transparent limits, and responsible handling of user data."
    ],
    5: [
        "Learn to frame a design problem, identify user needs, and turn research observations into useful product insights.",
        "Arrange content and navigation into clear flows, then sketch wireframes that communicate structure before styling.",
        "Build a visual system with type scales, spacing rules, color roles, and reusable components.",
        "Create a clickable prototype, test a realistic task, and use feedback to improve the experience."
    ],
    6: [
        "Turn a broad question into a data workflow with a clear hypothesis, useful sources, and measurable outcomes.",
        "Load, inspect, clean, transform, and summarize tabular data with practical Python analysis techniques.",
        "Choose effective charts, label them clearly, and present patterns without overstating what the data proves.",
        "Prepare features, train a baseline model, evaluate its results, and communicate uncertainty in the prediction."
    ],
    7: [
        "Identify assets, threats, vulnerabilities, and likely impacts using core security principles and threat modeling.",
        "Apply password hashing, multi-factor authentication, roles, and least-privilege access to protect accounts.",
        "Review common web risks such as injection, cross-site scripting, and insecure configuration with defensive examples.",
        "Create a repeatable security checklist covering code, dependencies, accounts, data, monitoring, and response."
    ],
    8: [
        "Define a target audience, clarify their needs, and create a content plan with a consistent message and purpose.",
        "Learn how search engines discover pages and improve useful content with clear structure, language, and metadata.",
        "Plan a social campaign with a hook, creative formats, publishing schedule, audience, and measurable goal.",
        "Track meaningful conversion and engagement metrics, interpret results, and use them to improve the next campaign."
    ]
}

for course in COURSES:
    for lesson, content in zip(course["lesson_list"], LESSON_CONTENT[course["id"]]):
        lesson["content"] = content
    course["lessons"] = len(course["lesson_list"])
    course["type"] = "Free" if course["price"] == 0 else "Paid"

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

class AuthRequest(BaseModel):
    name: str = ""
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    password: str

def initialize_database():
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                email TEXT PRIMARY KEY,
                token_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

initialize_database()

def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000).hex()

def hash_reset_token(token):
    return hashlib.sha256(token.encode()).hexdigest()

def send_email(recipient, subject, body):
    host = os.getenv("SMTP_HOST")
    if not host:
        return False
    message = EmailMessage()
    message["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "noreply@eduverse.local"))
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)
    try:
        port = int(os.getenv("SMTP_PORT", "587"))
        username = os.getenv("SMTP_USER")
        password = os.getenv("SMTP_PASSWORD")
        if os.getenv("SMTP_USE_SSL", "false").lower() == "true":
            with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                if username and password:
                    server.login(username, password)
                server.send_message(message)
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.starttls()
                if username and password:
                    server.login(username, password)
                server.send_message(message)
    except (OSError, smtplib.SMTPException):
        return False
    return True

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/courses")
def courses():
    return COURSES

@app.post("/api/signup", status_code=201)
def signup(request: AuthRequest):
    if len(request.name.strip()) < 2 or len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Use a name and a password with at least 8 characters.")
    salt = secrets.token_hex(16)
    try:
        with sqlite3.connect(DATABASE_PATH) as connection:
            connection.execute(
                "INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
                (request.name.strip(), request.email.lower(), hash_password(request.password, salt), salt, datetime.now(timezone.utc).isoformat())
            )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with that email already exists.")
    return {"message": "Account created. You can now log in.", "name": request.name.strip()}

@app.post("/api/login")
def login(request: AuthRequest):
    with sqlite3.connect(DATABASE_PATH) as connection:
        user = connection.execute("SELECT name, password_hash, salt FROM users WHERE email = ?", (request.email.lower(),)).fetchone()
    if not user or not secrets.compare_digest(hash_password(request.password, user[2]), user[1]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return {"message": f"Welcome back, {user[0]}!", "name": user[0]}

@app.post("/api/forgot-password")
def forgot_password(request: PasswordResetRequest):
    email = request.email.lower()
    with sqlite3.connect(DATABASE_PATH) as connection:
        user = connection.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
        if not user:
            return {"message": "If an account exists, a reset code has been created."}
        previous_token = connection.execute("SELECT token_hash FROM password_reset_tokens WHERE email = ?", (email,)).fetchone()
        token = f"{secrets.randbelow(1000000):06d}"
        while previous_token and secrets.compare_digest(hash_reset_token(token), previous_token[0]):
            token = f"{secrets.randbelow(1000000):06d}"
        expires_at = datetime.now(timezone.utc).timestamp() + 900
        connection.execute(
            "INSERT OR REPLACE INTO password_reset_tokens (email, token_hash, expires_at) VALUES (?, ?, ?)",
            (email, hash_reset_token(token), str(expires_at))
        )
    email_sent = send_email(email, "Your EduVerse password reset code", f"Your EduVerse password reset code is {token}. It expires in 15 minutes.")
    response = {"message": "Reset code sent to your email. Use it below to choose a new password." if email_sent else "Email is not configured. Use the local reset code below.", "email_sent": email_sent}
    if not email_sent:
        response["reset_token"] = token
    return response

@app.post("/api/reset-password")
def reset_password(request: PasswordResetConfirm):
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Use a password with at least 8 characters.")
    email = request.email.lower()
    with sqlite3.connect(DATABASE_PATH) as connection:
        reset = connection.execute("SELECT token_hash, expires_at FROM password_reset_tokens WHERE email = ?", (email,)).fetchone()
        if not reset or float(reset[1]) < datetime.now(timezone.utc).timestamp() or not secrets.compare_digest(hash_reset_token(request.token), reset[0]):
            raise HTTPException(status_code=400, detail="That reset code is invalid or expired.")
        salt = secrets.token_hex(16)
        connection.execute("UPDATE users SET password_hash = ?, salt = ? WHERE email = ?", (hash_password(request.password, salt), salt, email))
        connection.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
    return {"message": "Password reset successfully. You can now log in."}

@app.post("/api/contact", status_code=201)
def contact(message: ContactMessage):
    if not message.name.strip() or not message.message.strip():
        raise HTTPException(status_code=400, detail="Name and message are required.")
    received_at = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute(
            "INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
            (message.name.strip(), message.email.lower(), message.message.strip(), received_at)
        )
    recipient = os.getenv("CONTACT_EMAIL")
    email_sent = bool(recipient) and send_email(recipient, f"EduVerse contact message from {message.name.strip()}", f"From: {message.name.strip()} <{message.email}>\n\n{message.message.strip()}")
    return {"message": "Thanks. Your message has been sent." if email_sent else "Thanks. Your message has been received.", "received_at": received_at, "email_sent": email_sent}

app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="website")

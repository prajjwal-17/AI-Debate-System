from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Allows serving audio files
from pydantic import BaseModel
from gtts import gTTS
import uuid
import os

from ai_engine import detect_fallacies, steelman_argument
from moderator import start_debate, generate_next_turn, active_sessions

# Create an audio folder if it doesn't exist
os.makedirs("audio", exist_ok=True)

app = FastAPI(title="DebateForge Autonomous API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the 'audio' folder to the web
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# --- Helper Function for Audio ---
def generate_audio(text: str, persona: str) -> str:
    """Converts text to speech and returns the URL to the MP3 file."""
    # Give Pro and Con slightly different accents so you can tell them apart!
    # 'com' is standard US, 'co.uk' is British
    tld_accent = "com" if persona == "Pro" else "co.uk" 
    
    tts = gTTS(text=text, lang="en", tld=tld_accent)
    filename = f"{uuid.uuid4()}.mp3"
    filepath = f"audio/{filename}"
    tts.save(filepath)
    
    return f"http://localhost:8000/audio/{filename}"

# ... (Keep your Pydantic Models the same) ...
class StartRequest(BaseModel):
    topic: str
    pro_persona: str = "The Professor" # Default values
    con_persona: str = "The Aggressor"
class NextRequest(BaseModel):
    session_id: str
class InterruptRequest(BaseModel):
    session_id: str
    user_argument: str
    target_persona: str

# --- Updated API Endpoints ---

@app.post("/api/debate/start")
async def api_start_debate(request: StartRequest):
    """Creates a new debate room with specific personas and fires the opening argument."""
    session_id = str(uuid.uuid4())
    
    # Call the updated start_debate function
    first_turn = start_debate(session_id, request.topic, request.pro_persona, request.con_persona)
    
    # Generate audio for the first turn (Option 2 Audio)
    audio_url = generate_audio(first_turn["text"], first_turn["speaker"])
    first_turn["audio_url"] = audio_url 
    
    return {
        "session_id": session_id,
        "topic": request.topic,
        "pro_character": request.pro_persona,
        "con_character": request.con_persona,
        "first_turn": first_turn
    }

@app.post("/api/debate/next")
async def api_next_turn(request: NextRequest):
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    turn_data = generate_next_turn(request.session_id)
    
    # Generate audio for this turn
    if "text" in turn_data:
        audio_url = generate_audio(turn_data["text"], turn_data["speaker"])
        turn_data["audio_url"] = audio_url
        
    return turn_data

@app.post("/api/debate/interrupt")
async def api_interrupt(request: InterruptRequest):
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    session = active_sessions[request.session_id]
    fallacies = detect_fallacies(request.user_argument)
    steelmanned_text = steelman_argument(request.user_argument)
    session.add_message("User", request.user_argument)
    session.current_turn = request.target_persona
    
    return {
        "status": "Interrupted Successfully",
        "fallacies_detected": fallacies,
        "steelmanned_version": steelmanned_text,
        "next_speaker": session.current_turn
    }

from ai_engine import judge_debate
import json

@app.get("/api/personas/stats")
async def get_leaderboard():
    """Frontend calls this to get data for the Bragging Flashcards."""
    with open("leaderboard.json", "r") as f:
        data = json.load(f)
    return data

@app.post("/api/debate/judge")
async def api_judge_debate(request: NextRequest): # Reusing NextRequest since it just needs session_id
    """Ends the debate, triggers the AI Judge, and updates the flashcards."""
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    session = active_sessions[request.session_id]
    
    # Convert the history array into a readable string for the judge
    transcript = "\n".join([f"{msg['speaker']} ({session.characters.get(msg['speaker'], 'User')}): {msg['text']}" for msg in session.history])
    
    # Let the AI decide the winner
    result = judge_debate(transcript)
    
    # Update the Leaderboard Flashcards!
    if result["winner"] in ["Pro", "Con"]:
        winning_character = session.characters[result["winner"]]
        
        with open("leaderboard.json", "r") as f:
            leaderboard = json.load(f)
            
        # Add a win and update the brag quote
        if winning_character in leaderboard:
            leaderboard[winning_character]["wins"] += 1
            leaderboard[winning_character]["last_brag"] = result["brag"]
            
        with open("leaderboard.json", "w") as f:
            json.dump(leaderboard, f)
            
    return {
        "verdict": result,
        "winning_character": session.characters.get(result.get("winner"), "None")
    }
import json
import os
from typing import List, Dict
from ai_engine import query_ollama

active_sessions = {}
LEADERBOARD_FILE = "leaderboard.json"

# --- The 4 Distinct Personas ---
PERSONAS = {
    "The Professor": "You are highly analytical, use big vocabulary, and speak like an Oxford academic.",
    "The Aggressor": "You are ruthless, fiery, and use sharp, biting sarcasm to mock your opponent.",
    "The Philosopher": "You are calm, existential, and constantly question the deeper meaning of the topic.",
    "The Troll": "You are dismissive, use internet slang, and try to annoy your opponent while still making logical points."
}

# Initialize leaderboard file if it doesn't exist
if not os.path.exists(LEADERBOARD_FILE):
    initial_data = {name: {"wins": 0, "last_brag": "I'm ready for my first victim."} for name in PERSONAS.keys()}
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(initial_data, f)

class DebateSession:
    def __init__(self, session_id: str, topic: str, pro_persona: str = "The Professor", con_persona: str = "The Aggressor"):
        self.session_id = session_id
        self.topic = topic
        self.history: List[Dict[str, str]] = [] 
        self.is_paused = False 
        self.current_turn = "Pro"
        
        # Map Pro and Con to their chosen characters
        self.characters = {
            "Pro": pro_persona if pro_persona in PERSONAS else "The Professor",
            "Con": con_persona if con_persona in PERSONAS else "The Aggressor"
        }

    def get_llm_messages(self, stance: str) -> List[Dict[str, str]]:
        character_name = self.characters[stance]
        personality = PERSONAS[character_name]
        
        system_msg = (
            f"You are {character_name}. {personality} The topic is '{self.topic}'. "
            f"Your strict stance is {stance}. Review the debate history and provide "
            f"a concise, 1-paragraph argument. Directly attack the opponent's flaws in your unique voice."
        )
        
        messages = [{"role": "system", "content": system_msg}]
        for entry in self.history:
            role = "assistant" if entry["speaker"] == stance else "user"
            messages.append({"role": role, "content": entry["text"]})
            
        return messages

    def add_message(self, speaker: str, text: str):
        self.history.append({"speaker": speaker, "text": text})

# ... Keep your existing start_debate and generate_next_turn functions exactly as they are below this ...
# Phase 2: The Autonomous Loop Logic
# Phase 2: The Autonomous Loop Logic
def start_debate(session_id: str, topic: str, pro_persona: str, con_persona: str):
    """Initializes a new debate and generates the opening statement."""
    session = DebateSession(session_id, topic, pro_persona, con_persona)
    active_sessions[session_id] = session
    
    # Pro Persona makes the opening statement
    messages = session.get_llm_messages("Pro")
    response = query_ollama(messages)
    
    session.add_message("Pro", response)
    session.current_turn = "Con" # Hand the mic to Con
    
    return {"speaker": "Pro", "text": response, "history": session.history}

def generate_next_turn(session_id: str):
    """Triggers the next AI to speak based on whose turn it is."""
    session = active_sessions.get(session_id)
    
    if not session:
        return {"error": "Session not found."}
    
    if session.is_paused:
        return {"status": "paused", "message": "Debate is paused."}

    stance = session.current_turn
    messages = session.get_llm_messages(stance)
    
    response = query_ollama(messages)
    session.add_message(stance, response)
    
    session.current_turn = "Pro" if stance == "Con" else "Con"
    
    return {"speaker": stance, "text": response, "history": session.history}

def generate_next_turn(session_id: str):
    """Triggers the next AI to speak based on whose turn it is."""
    session = active_sessions.get(session_id)
    
    if not session:
        return {"error": "Session not found."}
    
    if session.is_paused:
        return {"status": "paused", "message": "Debate is paused for user intervention."}

    stance = session.current_turn
    messages = session.get_llm_messages(stance)
    
    # Call the LLM with the full context
    response = query_ollama(messages)
    session.add_message(stance, response)
    
    # Swap turns for the next loop
    session.current_turn = "Pro" if stance == "Con" else "Con"
    
    return {"speaker": stance, "text": response, "history": session.history}
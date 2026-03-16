import requests
import json

# We use the chat endpoint to separate System instructions from User input
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3" # Make sure this matches the model you pulled

def query_ollama(messages, require_json=False):
    """Helper function to communicate with Ollama."""
    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.3 # Low temperature stops the AI from looping/hallucinating
        }
    }
    
    # Force Ollama to output valid JSON for the fallacy detector
    if require_json:
        payload["format"] = "json"

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()["message"]["content"]
    except requests.exceptions.RequestException as e:
        return f"Error connecting to AI: {e}"

def generate_rebuttal(topic, stance, user_argument):
    """Generates a counter-argument based on the assigned stance."""
    system_prompt = f"You are a highly competitive, logical debater. The topic is: '{topic}'. Your strict stance is: {stance}. Provide a concise, forceful, and logical 1-paragraph counter-argument to the user's latest point. Do not be overly polite."
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_argument}
    ]
    return query_ollama(messages)

def detect_fallacies(user_argument):
    """Analyzes the user's argument for logical fallacies and returns JSON."""
    system_prompt = """Analyze the user's argument for logical fallacies. 
    Use ONLY this taxonomy: Straw Man, Ad Hominem, False Dichotomy, Slippery Slope, Red Herring, or None.
    Respond ONLY in strict JSON format like this:
    {"fallacy": "Name of Fallacy or None", "explanation": "One short sentence explaining why."}"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_argument}
    ]
    # We pass require_json=True to force the model into JSON mode
    raw_response = query_ollama(messages, require_json=True)
    
    try:
        # Parse it into a Python dictionary
        return json.loads(raw_response)
    except json.JSONDecodeError:
        return {"fallacy": "Error", "explanation": "Failed to parse AI response into JSON."}

def steelman_argument(user_argument):
    """Reconstructs the user's argument into its strongest, most logical form."""
    system_prompt = "You are an expert logician. Take the user's argument, strip away any emotional language, hyperbole, or weak logic, and reconstruct it into its most bulletproof, rigorous, and charitable form. Output ONLY the strengthened argument."
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_argument}
    ]
    return query_ollama(messages)

def judge_debate(transcript_text):
    """Reads the debate history, picks a winner, and generates a brag quote."""
    system_prompt = """You are an impartial, expert debate judge. Read the following debate transcript.
    Decide who won: "Pro" or "Con". 
    Then, write a 1-sentence reason why they won.
    Finally, write a 1-sentence 'brag' quote from the winner's perspective (e.g., "I absolutely dismantled their argument with pure logic!").
    
    Respond ONLY in strict JSON format like this:
    {"winner": "Pro or Con", "reason": "They had better evidence.", "brag": "I crushed their silly argument!"}"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": transcript_text}
    ]
    
    raw_response = query_ollama(messages, require_json=True)
    try:
        return json.loads(raw_response)
    except json.JSONDecodeError:
        return {"winner": "Tie", "reason": "Too close to call.", "brag": "It was a legendary battle of wits."}
from fastapi import APIRouter, Depends
import requests
from routes.overload import get_overload
import os
from dotenv import load_dotenv

router = APIRouter(
    prefix="/llm",
    tags=["LLM Recommendations"]
)
load_dotenv()
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY") 
MODEL_NAME = "llama3-8b-8192"

def call_llm(prompt: str):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"GROQ API Error {response.status_code}: {response.text}")

    try:
        result = response.json()
        content = result['choices'][0]['message']['content']
        #print("Full LLM Output here :\n", content)
    except KeyError:
        raise Exception(f"Unexpected response format: {result}")

    
    # Split the content into recommendations and explanation
    parts = content.split("Explanation:", 1)
        
    recommendations = []
    explanation = None
        
    if len(parts) > 0:
        # Extract recommendations (assuming they are numbered)
         rec_part = parts[0]
         # Split by numbered items (1., 2., etc.)
         recommendations = [line.strip() for line in rec_part.split('\n') if line.strip().startswith(('1.', '2.', '3.', '-', '*'))]
            
    if len(parts) > 1:
         explanation = parts[1].strip()
        
    return {
            "recommendations": recommendations,
            "explanation": explanation,
            } 

@router.post("/recommendation")
def get_recommendations(overload_output: dict = Depends(get_overload)):
    prompt = f"""
    Current hospital overload risk: {overload_output['risk']}
    Days to overload: {overload_output['days_to_overload']}
    Critical resources under pressure: {", ".join(overload_output['critical_resources']) if overload_output['critical_resources'] else "None"}.
    Outbreak disease: dengue

    Provide the response in the following format:

    1. First recommendation  
    2. Second recommendation  
    3. Third recommendation  

    Explanation: (3–4 lines)
    Why these steps are critical based on the current risk.
    """


    llm_response = call_llm(prompt)

    return {
        "recommendations": llm_response["recommendations"],
        "explanation": llm_response["explanation"]
    }

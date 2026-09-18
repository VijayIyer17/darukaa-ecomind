import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Explicitly load environment variables so the API key is found
load_dotenv()

# Use the exact model we know works for your account
chat_llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0.4,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

def generate_chat_response(history: list) -> str:
    # 1. Set the AI's Core Instructions
    messages = [
        SystemMessage(content=(
            "You are Darukaa EcoMind, an expert AI environmental scientist. "
            "Your goal is to help users assess their land's ecological health. "
            "To run a full assessment, you need 6 variables: Region, Soil pH, Organic Carbon (%), "
            "Rainfall pattern, Land Use, and Water Availability. "
            "If the user states a problem (e.g., 'my biodiversity is declining'), warmly acknowledge it "
            "and ask a clarifying question to gather 1 or 2 missing variables at a time. Keep it conversational. "
            "Once you have all 6 variables, instruct the user to run the Full Assessment."
        ))
    ]
    
    # 2. Load the SQLite History into LangChain Memory
    for msg in history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.message))
        elif msg.role == "ai":
            messages.append(AIMessage(content=msg.message))
            
    # 3. Generate the contextual response
    response = chat_llm.invoke(messages)
    
    # 4. Extract plain string from Gemini's list format to prevent SQLite crash
    if isinstance(response.content, list):
        text_reply = "".join([block.get("text", "") for block in response.content if isinstance(block, dict)])
        return text_reply
        
    return str(response.content)
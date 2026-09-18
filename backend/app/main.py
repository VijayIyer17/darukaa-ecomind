from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.models.schemas import EnvironmentalInput, AssessmentResponse, ChatRequest, ChatResponse
from app.services.assessor import analyze_environment
from app.database import get_db, ChatMessage
from app.services.chat_agent import generate_chat_response

load_dotenv()

app = FastAPI(title="Darukaa EcoMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/assess", response_model=AssessmentResponse)
def assess_environment(data: EnvironmentalInput):
    """Evaluates environmental metrics and returns AI-driven, evidence-backed recommendations."""
    return analyze_environment(data)

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
    """Handles conversational memory and identifies missing environmental metrics."""
    
    # 1. Save User Message to SQLite
    user_msg = ChatMessage(session_id=request.session_id, role="user", message=request.message)
    db.add(user_msg)
    db.commit()

    # 2. Retrieve Full Conversation History for this Session (includes the message just saved)
    history = db.query(ChatMessage).filter(ChatMessage.session_id == request.session_id).order_by(ChatMessage.timestamp.asc()).all()
    
    # 3. Feed History to Gemini
    ai_reply_text = generate_chat_response(history)

    # 4. Save AI Response to SQLite
    ai_msg = ChatMessage(session_id=request.session_id, role="ai", message=ai_reply_text)
    db.add(ai_msg)
    db.commit()

    return ChatResponse(reply=ai_reply_text)
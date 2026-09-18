from pydantic import BaseModel
from typing import List

# What the user sends to the API
class EnvironmentalInput(BaseModel):
    region: str
    soil_ph: float
    organic_carbon: float
    rainfall: str
    land_use: str
    water_availability: str

# Structured recommendation format required by the challenge
class Recommendation(BaseModel):
    action: str
    reasoning: str
    impacted_metrics: List[str]
    time_horizon: str

# What the API returns to the frontend
class AssessmentResponse(BaseModel):
    risk_level: str
    recommendations: List[Recommendation]
    confidence: float
    evidence_used: List[str]
    
    
    # Add these at the bottom of your existing schemas.py file

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.models.schemas import EnvironmentalInput, AssessmentResponse

# Ensure environment variables are loaded first
load_dotenv()

# Setup Paths and DB
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "knowledge_base", "vector_store"))

# Initialize Gemini Embeddings (Swapped from HuggingFace to save RAM)
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
vector_store = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)

def analyze_environment(data: EnvironmentalInput) -> AssessmentResponse:
    # 1. Semantic Search for Evidence
    search_query = f"Region: {data.region}, Soil pH: {data.soil_ph}, Organic Carbon: {data.organic_carbon}%, Rainfall: {data.rainfall}, Land Use: {data.land_use}, Water: {data.water_availability}"
    docs = vector_store.similarity_search(search_query, k=3)
    
    evidence_text = "\n\n".join([doc.page_content for doc in docs])
    extracted_sources = [doc.page_content for doc in docs]

    # 2. Initialize Gemini with Structured Output Enforcement
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",  # <--- Upgrade to the active 3.x series model
        temperature=0.1,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    structured_llm = llm.with_structured_output(AssessmentResponse)

    # 3. The AI Environmental Scientist Prompt
    prompt = f"""
    You are an expert AI Environmental Scientist.
    Analyze the user's environmental conditions and provide a high-level ecological risk assessment.
    
    CRITICAL INSTRUCTIONS:
    - You must base your recommendations strictly on the "Retrieved Scientific Evidence".
    - Connect multiple variables (e.g., how low organic carbon AND low rainfall combine to impact habitat diversity).
    - Provide 2 to 3 actionable, non-obvious recommendations.
    
    User Conditions:
    {search_query}
    
    Retrieved Scientific Evidence:
    {evidence_text}
    """

    # 4. Generate JSON and inject raw evidence
    result = structured_llm.invoke(prompt)
    result.evidence_used = extracted_sources
    
    return result
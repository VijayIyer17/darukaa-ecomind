import os
from langchain_community.document_loaders import TextLoader, PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, "..", "knowledge_base", "raw_pdfs")
DB_DIR = os.path.join(BASE_DIR, "..", "knowledge_base", "vector_store")

def build_vector_store():
    print("Loading documents...")
    documents = []
    
    # Load Text files
    for file in os.listdir(KNOWLEDGE_BASE_DIR):
        if file.endswith(".txt"):
            loader = TextLoader(os.path.join(KNOWLEDGE_BASE_DIR, file), encoding="utf-8")
            documents.extend(loader.load())
            
    # Load PDFs (if you add any later)
    pdf_loader = PyPDFDirectoryLoader(KNOWLEDGE_BASE_DIR)
    documents.extend(pdf_loader.load())

    print(f"Loaded {len(documents)} document files.")

    print("Chunking text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    print("Initializing embedding model (all-MiniLM-L6-v2)...")
    # Lightweight, fast, and excellent for semantic search
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Building ChromaDB vector store...")
    vector_store = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=DB_DIR
    )
    
    print(f"Successfully ingested and saved vector database to {DB_DIR}")

if __name__ == "__main__":
    build_vector_store()
    
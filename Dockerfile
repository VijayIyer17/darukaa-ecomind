FROM python:3.12.3

# Set working directory
WORKDIR /code

# Install dependencies
COPY backend/requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ /code/

# Hugging Face Spaces uses port 7860 by default
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
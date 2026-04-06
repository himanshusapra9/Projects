FROM python:3.11-slim
WORKDIR /app
ENV PYTHONPATH=/app

# Build context is project root; requirements live next to backend/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

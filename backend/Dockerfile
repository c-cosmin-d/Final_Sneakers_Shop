# backend/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system deps (optional but safe)
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the whole backend code into the image
COPY . .

# Env vars (overridable from docker-compose)
ENV DB_HOST=db \
    DB_PORT=3306 \
    DB_USER=sneaker_user \
    DB_PASSWORD=sneaker_pass \
    DB_NAME=sneaker_shop

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

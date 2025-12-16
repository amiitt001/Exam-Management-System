FROM python:3.10-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run contract: listen on $PORT
ENV PORT=8080
EXPOSE 8080

# Use gunicorn in production; respect Cloud Run $PORT
ENTRYPOINT ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT:-8080}"]

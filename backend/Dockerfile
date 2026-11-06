FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY music_engine ./music_engine
RUN useradd --create-home --uid 10001 appuser && \
    mkdir -p /app/data/generated && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "music_engine.main:app", "--host", "0.0.0.0", "--port", "8000"]

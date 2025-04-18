FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    clang-tidy \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Semgrep
RUN pip install semgrep

# Install Snyk
RUN curl -Lo ./snyk "https://github.com/snyk/snyk/releases/latest/download/snyk-linux" \
    && chmod +x ./snyk \
    && mv ./snyk /usr/local/bin/

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create upload directory
RUN mkdir -p /tmp/code-analysis-uploads && chmod -R 777 /tmp/code-analysis-uploads

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
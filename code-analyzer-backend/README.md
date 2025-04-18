python -m venv venv
source venv/bin/activate  # Trên Linux/Mac
venv\Scripts\activate     # Trên Windows

pip install fastapi uvicorn pydantic python-multipart pytest pyyaml

thoat khoi moi truowng
deactivate

# Code Analysis Web App

An integrated web application for analyzing code with multiple security and quality tools: Semgrep, Snyk, and ClangTidy.

## Features

- Upload and analyze code with multiple static analysis tools
- Configure and customize analysis rules
- View combined results from all tools
- Filter and sort findings
- Detailed reports on security vulnerabilities and code quality issues

## Architecture

The application is split into two main components:

1. **Backend API** - FastAPI-based Python service
   - Handles file uploads
   - Interacts with code analysis tools
   - Provides RESTful endpoints

2. **Frontend UI** - React-based web interface
   - User-friendly interface for uploading code
   - Configuration of analysis tools
   - Results visualization and filtering

## Prerequisites

- Python 3.8+
- Node.js 16+
- Semgrep
- Snyk CLI
- ClangTidy

## Installation

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/code-analysis-webapp.git
cd code-analysis-webapp
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create `.env` file from example
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the backend
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

## Docker Setup (Alternative)

1. Build and run with Docker Compose
```bash
docker-compose up -d
```

## Usage

1. Access the web interface at http://localhost:3000
2. Upload code files to analyze
3. Configure analysis tools as needed
4. Run analysis
5. View and filter results

## API Documentation

API documentation is available at http://localhost:8000/api/docs when the backend is running.

## License

MIT

## Contributors

- Your Name - Initial work
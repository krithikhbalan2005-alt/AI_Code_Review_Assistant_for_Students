# AI Code Review Backend

This is the Node.js Express backend for the Student Code Review Assistant. It acts as a bridge between the frontend application and the Gemini API, keeping the API key secure.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your actual Gemini API Key:
   ```bash
   cp .env.example .env
   # Edit .env to set GEMINI_API_KEY=your_actual_key
   ```

3. Start the server:
   - For production / standard startup:
     ```bash
     npm start
     ```
   - For development auto-reload:
     ```bash
     npm run dev
     ```

The server will run on `http://localhost:5000` (or the PORT defined in `.env`).

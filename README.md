# AI-Powered Code Review and Learning Assistant for Students

An interactive assistant that helps computer science students submit coding assignments (via pasting text or local file uploading) and receive detailed, beginner-friendly reviews. The system analyzes bugs, syntactical mistakes, style improvements, security vulnerabilities, execution complexity (Time & Space), and formats the results into an interactive dashboard and a local, downloadable PDF report.

All developer technologies, databases (Firebase, Firestore), and API systems are fully masked inside the user-facing interface, highlighting secure local parsing and user data privacy.

---

## Workspace Structure

- `frontend/`: React single-page application built with Vite, Tailwind CSS, React Router DOM, and jsPDF.
- `backend/`: Node.js Express server acting as a secure gateway for the Gemini API.
- `firestore.rules`: Security configuration for Cloud Firestore, protecting records and history data on a per-user UID basis.

---

## Setup & Running Guide

### 1. Firestore Security Configuration

Apply the security rules inside the `firestore.rules` file to your Firebase console project. It secures:
- User metadata details in `/users/{userId}`.
- Submissions, reports, and history documents.
- Restricts actions so that users can only interact with documents where their authenticated UID matches the document's `userId`.

### 2. Run the Express Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Setup your environment:
   - Copy `.env.example` to `.env`
   - Set `GEMINI_API_KEY` to your Google Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_gemini_api_key
     PORT=5000
     ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   The backend server will launch on `http://localhost:5000`.

### 3. Run the Vite Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm run dev
   ```
   The React application will run on `http://localhost:5173`.

---

## Development and Security Rules

1. **Local FileReader API**: Code files uploaded locally are read on the client side in the browser and filled into the text editor. They are never uploaded to any cloud storage bucket, ensuring zero extra cloud costs and total storage privacy.
2. **Key Security**: The Gemini AI API key resides entirely in the backend environment. The client makes a proxy call to the Express `/api/review-code` endpoint.
3. **Internal Firebase**: Firebase branding and collection details are completely hidden. The application is mapped to use user-friendly text like:
   - "Secure login"
   - "Your data is private"
   - "Ready to use"
   - "Something went wrong. Please try again."

# AI Code Review Frontend

This is the Vite React frontend for the Student Code Review Assistant. It is styled with Tailwind CSS, utilizing React Router DOM, Lucide Icons, and jsPDF.

## Features

- **Personalized Student Dashboard**: View review history log, stats, and scores.
- **Local File Upload**: Read files locally using the `FileReader` API (no cloud file uploads are executed).
- **Interactive Review Report**: Shows bugs, security concerns, optimization metrics, and visual score indicator.
- **Local PDF Exports**: Generates vector PDF reports instantly on the client side using `jsPDF`.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

The application will run on `http://localhost:5173`. Make sure the Express backend is running on `http://localhost:5000` to support code analysis.


# DreamSpace AI Designer - Setup Guide

This project consists of a React frontend and a Node.js/Express/MongoDB backend.

## 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local installation or MongoDB Atlas account)
- **Google Gemini API Key** (Obtained from [Google AI Studio](https://aistudio.google.com/))

## 2. Local Installation

1. **Extract/Download** the project files to a folder.
2. **Open a Terminal** in that folder.
3. **Install dependencies**:
   ```bash
   npm install
   ```

## 3. Configuration

Create a `.env` file in the root directory and fill in your details:
```env
API_KEY=YOUR_GEMINI_API_KEY
MONGODB_URI=mongodb://localhost:27017/dreamspace
JWT_SECRET=some_secret_key
PORT=5000
```

## 4. Running the Application

### Start the Backend
The backend handles user registration and login via MongoDB.
```bash
npm run backend
```
*The server will start at `http://localhost:5000`*

### Start the Frontend
In a **new** terminal tab, run the following:
```bash
npm run dev
```
*The app will be available at `http://localhost:5173`*

## 5. Connecting to MongoDB
- If you are using **MongoDB Atlas**, replace the `MONGODB_URI` in `.env` with the connection string provided by Atlas (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`).
- Ensure your IP address is whitelisted in the Atlas Network Access settings.

## 6. Using the App
1. **Register**: Create a new account.
2. **Specs**: Upload a photo of your room and enter dimensions.
3. **Planner**: Drag and drop furniture on the 2D canvas.
4. **3D View**: Click "Export to 3D View" to see Gemini's photorealistic rendering of your design.

# Atmos - AI-Enabled Air Quality App

Atmos is an intelligent mobile application designed to provide real-time air quality insights using advanced AI analysis.

## Project Structure

This project is a monorepo containing both the frontend and backend of the application:

-   **frontend/**: A React Native Expo application (TypeScript).
-   **backend/**: The backend services for the application.

## Getting Started

### 1. Start the Backend
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### 2. Start the Frontend
Open a **new** terminal in the `frontend` folder:
```bash
cd frontend
npm install
npx expo start
```
-   Scan the QR code with your phone (Expo Go app) or press `a` for Android Emulator / `i` for iOS Simulator.

# SafeBeacon

SafeBeacon is a comprehensive safety application designed to provide emergency assistance and location tracking. It consists of a Spring Boot backend and a React Native (Expo) mobile application.

## Project Structure

- **backend/**: Spring Boot application (Java 17).
- **mobile/**: React Native application (Expo).

## Setup Instructions

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL
- Expo Go app (for mobile testing)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Update `.env` with your database credentials and API keys.
4.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```

### Mobile Setup

1.  Navigate to the mobile directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Update `.env` with your API URL (use your computer's IP address).
5.  Start the app:
    ```bash
    npx expo start -c
    ```

## Features

- **Emergency Alerts**: Send SOS alerts with location.
- **Real-time Tracking**: Share live location with trusted contacts.
- **Authentication**: Secure login with Google OAuth.

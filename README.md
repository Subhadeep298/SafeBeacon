# SafeBeacon - Personal Safety & Guardian Network 🛡️

**SafeBeacon** is a comprehensive personal safety application designed to provide peace of mind through real-time connectivity and location intelligence. It empowers users to build a trusted network of "Guardians" who can monitor their safety status and location in real-time.

## 📖 About The Project

In an emergency, every second counts. SafeBeacon bridges the gap between distress and assistance by creating a seamless, persistent link between a user and their trusted contacts. Unlike standard location sharing, SafeBeacon is built specifically for safety, offering dedicated features for emergency tracking, background monitoring, and secure bidirectional relationships.

The system consists of a high-performance **Spring Boot backend** that handles secure data transmission and a responsive **React Native mobile application** that serves as the user's safety command center.

## 🚀 Key Features

### **Guardian Network**
*   **Trust-Based Connection**: Link securely with friends and family using unique 6-digit verification codes.
*   **Bidirectional Safety**: Users can act as both a "Protector" (Guardian) and a "Protectee" simultaneously.
*   **Privacy-First Design**: Relationships require explicit mutual consent.

### **Real-Time Location Intelligence**
*   **Live Streaming**: Instantaneous location updates via WebSocket technology (STOMP) for immediate tracking.
*   **Background Monitoring**: "Always-on" safety layer that updates the user's location every minute, even when the app is in the background or the phone is locked.
*   **Last Known Location**: Smart persistence that records the user's last valid coordinates and timestamp, ensuring Guardians have critical data even if the user goes offline.

### **Secure Identity**
*   **OAuth2 Integration**: Seamless and secure login using Google Accounts.
*   **JWT Security**: Enterprise-grade token-based authentication (JSON Web Tokens) ensures all data is encrypted and secure.

## 🛠️ Technology Stack

SafeBeacon is built using a modern, scalable, and type-safe stack:

### **Mobile Application (Frontend)**
*   **React Native**: Cross-platform mobile development framework.
*   **TypeScript**: Ensures type safety and code reliability.
*   **Expo**: Managed workflow for rapid development and deployment.
*   **React Navigation**: Robust routing and screen management.
*   **React Native Maps**: Native map components for high-performance tracking.
*   **Axios & StompJS**: Advanced networking for REST APIs and WebSocket streams.

### **Backend Infrastructure**
*   **Java 17 & Spring Boot 3**: The core service layer providing robustness and speed.
*   **Spring Security**: Handles complex authentication flows and OAuth2 integration.
*   **PostgreSQL**: Reliable relational database for managing user relationships and persistent location history.
*   **Spring Websockets**: Manages real-time bidirectional communication channels.
*   **Docker**: Containerization for consistent database environments.
*   **Maven**: Dependency management and build automation.

## 🔍 How It Works

1.  **Secure Login**: Users authenticate securely via Google, establishing a persistent session.
2.  **Network Building**: A user shares their unique "Guardian Code". A friend enters this code to become their Guardian.
3.  **Active Protection**:
    *   The app runs a background service that wakes up every 60 seconds to fetch accurate GPS coordinates.
    *   Data is securely transmitted to the backend via an authenticated WebSocket channel.
4.  **Monitoring**: Guardians can view a live dashboard showing the real-time location and status of everyone they are protecting, updated instantly.

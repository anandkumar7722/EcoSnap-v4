
# EcoSnap - Smart Waste Classification & Tracking

EcoSnap is a Next.js application designed to help users classify waste, track their environmental impact, and engage in eco-friendly practices. It features AI-powered waste classification, a detailed waste tracking dashboard, gamified reduction challenges, a community reuse marketplace, and more.

## Core Features

-   **AI-Powered Waste Categorization**: Upload photos to classify waste (e.g., plastic, e-waste, biowaste) using Genkit and Google AI.
-   **Waste Tracking Dashboard**: Visualize waste trends by type, quantity, and time with interactive charts.
-   **Gamified Reduction Challenges**: Participate in eco-friendly missions, track progress, earn badges, and compete on a leaderboard.
-   **Nearby Recycling Centers & Schedules**: Find local recycling centers using embedded Google Maps and view (placeholder) collection schedules.
-   **Community Reuse Marketplace**: Donate, exchange, or sell used goods.
-   **AI Eco-Planner Assistant**: Get recommendations for eco-friendly products and event planning.
-   **Leaderboard System**: Rank users based on waste reduction performance.
-   **IoT Smart Bin Integration (Conceptual)**: Backend logic for monitoring smart bin fill levels (requires separate IoT device and data pipeline setup). A Firebase Cloud Function (`rtdbUpdateBinNotifyOnFillLevelChange` described in `src/lib/firebaseFunctions.ts`) handles automatic updates to a bin's notification status based on its fill level in Firebase Realtime Database.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **UI**: React, ShadCN UI Components
-   **Styling**: Tailwind CSS
-   **Generative AI**: Genkit (with Google AI - Gemini)
-   **Charting**: Recharts
-   **State Management**: React Context API, Local Storage
-   **Forms**: React Hook Form, Zod
-   **Database (for production)**: Firebase Firestore (conceptualized, setup required for full persistence beyond local storage)
-   **Authentication (for production)**: Firebase Authentication (conceptualized for user accounts)
-   **Backend Logic (for production)**: Firebase Cloud Functions (example provided for IoT Smart Bin integration)
-   **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)
-   A Firebase project (for deploying database, auth, and cloud functions in a production-like environment).
-   API Keys:
    -   Gemini API Key (for Genkit AI features).
    -   Google Maps API Key (Optional: for full Google Maps JavaScript API features if you choose to implement beyond the basic Embed API).

### Environment Variables Setup

1.  **Copy the example environment file**:
    Your project uses a `.env` file for environment variables. For local development, you can directly edit this file or create a `.env.local` for overrides (which should be gitignored).
    ```bash
    # If .env.local does not exist, you might create it:
    # cp .env .env.local 
    ```
2.  **Update `.env` or `.env.local`**:
    Open the file and fill in your API keys:
    ```env
    # Firebase Configuration (replace with your actual Firebase project config)
    # These are used by src/lib/firebase.ts
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_if_using_firebase_services
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

    # Google Services
    # For embedded maps, API key is optional for basic search but recommended for full features.
    # For full JS API features (if implemented later), this key would be necessary.
    # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

    # Genkit (Google AI - Gemini)
    # REQUIRED for AI features to work.
    GEMINI_API_KEY=your_gemini_api_key 
    ```
    **Important**: If using `.env.local`, ensure it's in your `.gitignore` to keep your API keys private. The `GEMINI_API_KEY` is crucial for the AI-powered waste classification and the AI assistant.

## Development

This project is configured to run in a Docker container for a consistent development environment with live reloading.

### Using Docker for Development

1.  **Build and run the development container**:
    From the project root directory, execute:
    ```bash
    docker-compose up --build
    ```
    This command will:
    -   Build the Docker image using `Dockerfile.dev`.
    -   Start a container based on this image.
    -   Mount your local project directory into the container, so code changes are reflected.
    -   Forward port 9002 from the container to your host machine.
    -   Use environment variables from the `.env` file.

2.  **Access the application**:
    Open your browser and navigate to `http://localhost:9002`.

3.  **Live Reloading**:
    When you save changes to files in the `src` directory, the Next.js development server inside the Docker container should automatically rebuild and refresh your browser.

### Without Docker (Local Node.js)

If you prefer to run directly on your host machine (ensure Node.js and npm/yarn are installed):

1.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Set up environment variables**:
    Ensure your `.env` file (or `.env.local`) has the necessary API keys (especially `GEMINI_API_KEY`).

3.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

## Project Structure Highlights

-   `/.env`: Base environment variables (can be committed if they are non-sensitive defaults or placeholders).
-   `/public/`: Static assets (images, fonts, etc.).
    -   `/public/assets/images/`: Contains images used for categories (e.g., `cardboard.png`, `ewaste.png`).
-   `/src/`: Main application source code.
    -   `/src/ai/`: Genkit AI flows and configuration.
        -   `/src/ai/flows/`: Specific AI agent logic (e.g., `classify-waste.ts`, `eco-planner-assistant.ts`).
        -   `/src/ai/genkit.ts`: Genkit global instance and plugin setup.
    -   `/src/app/`: Next.js App Router pages and layouts.
        -   Contains subdirectories for each page/route (e.g., `dashboard`, `history`, `login`).
        -   `globals.css`: Global styles and Tailwind CSS theme variables.
        -   `layout.tsx`: Root layout for the application.
        -   `page.tsx`: Homepage component.
    -   `/src/components/`: Reusable React components.
        -   `/src/components/layout/`: Layout components like `header.tsx`.
        -   `/src/components/ui/`: ShadCN UI components.
    -   `/src/hooks/`: Custom React hooks (e.g., `useToast.ts`).
    -   `/src/lib/`: Utility functions, type definitions, and Firebase integration.
        -   `firebase.ts`: Firebase app initialization (uses environment variables).
        -   `firebaseFunctions.ts`: Example backend logic that could be adapted for Firebase Cloud Functions (e.g., `rtdbUpdateBinNotifyOnFillLevelChange`).
        -   `storage.ts`: Local storage helper functions.
        -   `types.ts`: TypeScript type definitions for data structures.
        -   `utils.ts`: General utility functions (like `cn` for class names).
-   `Dockerfile`: For building the production Docker image.
-   `Dockerfile.dev`: For building the development Docker image.
-   `docker-compose.yml`: Configures the Docker development environment.
-   `next.config.ts`: Next.js configuration.
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Key API Keys and Setup

-   **Firebase**: If you plan to use Firebase services like Firestore, Authentication, or deploy the Realtime Database listener function, you'll need to create a Firebase project and get its configuration (apiKey, authDomain, etc.) to put into your environment variables file.
-   **Gemini API Key**: **Required** for the Genkit AI features (waste classification, AI assistant). Obtain this from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to your environment variables file as `GEMINI_API_KEY`.
-   **Google Maps API Key (Optional but Recommended for full features)**: For the "Recycling Centers & Schedules" feature, the embedded map uses Google Maps Embed API. While basic search might work without a key, full functionality and higher usage limits require an API key. If you add one, store it as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment variables file.

## Deployment

### Production Docker Image

The `Dockerfile` in the project root is configured for building an optimized production image of the Next.js application.
```bash
docker build -t ecosnap-app .
# When running, ensure all necessary environment variables are passed:
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
  -e GEMINI_API_KEY=your_gemini_key \
  # ... (other required env vars) \
  ecosnap-app
```

### Firebase Cloud Functions (for IoT Smart Bin)

The example backend logic for the IoT Smart Bin integration (`rtdbUpdateBinNotifyOnFillLevelChange` in `src/lib/firebaseFunctions.ts`) is designed to be deployed as a Firebase Cloud Function that listens to changes in your Firebase Realtime Database.
Refer to the comments in `src/lib/firebaseFunctions.ts` and the official Firebase documentation for detailed deployment steps.

## Contributing

(Add guidelines for contributing if this is an open project).

---

This README provides a comprehensive guide to getting started with EcoSnap. Feel free to expand it with more details specific to your project's evolution.

    

# EcoSnap - Smart Waste Classification & Tracking

EcoSnap is a Next.js application designed to help users classify waste, track their environmental impact, and engage in eco-friendly practices. It features AI-powered waste classification, a detailed waste tracking dashboard, gamified reduction challenges, a community reuse marketplace, and more.

## Core Features

-   **AI-Powered Waste Categorization**: Upload photos to classify waste (e.g., plastic, e-waste, biowaste, specific plastic types) using Genkit and Google AI (Gemini). Includes a fallback mechanism for missing images using placeholders.
-   **Waste Tracking Dashboard**: Visualize waste trends by type, quantity, and time with interactive charts (Recharts). Includes filters for date range and waste type, and summary statistics. Features a placeholder section for IoT Smart Bin monitoring.
-   **Gamified Reduction Challenges**: Participate in eco-friendly missions, track progress (placeholder data), earn badges (bronze, silver, gold, diamond tiers), and compete on a leaderboard. UI components and data structures are in place.
-   **Nearby Recycling Centers & Schedules**: Find local recycling centers using embedded Google Maps (via iframe) and view (placeholder) local collection schedules. Users can input their location to fetch schedules and manage notification preferences (UI only).
-   **Community Reuse Marketplace**: Donate, exchange, or sell used goods. Features a list of specific plastic categories for logging. (Currently placeholder item listings).
-   **AI Eco-Planner Assistant**: Get recommendations for eco-friendly products and event planning via an AI chatbot interface using Genkit.
-   **Leaderboard System**: Rank users based on waste reduction performance (currently uses placeholder data).
-   **User Authentication**: Simple login and signup UI (frontend only, no backend authorization yet) with form validation.
-   **IoT Smart Bin Integration (Conceptual)**:
    *   Backend logic example (`rtdbUpdateBinNotifyOnFillLevelChange` in `src/lib/firebaseFunctions.ts`) demonstrates how a Firebase Cloud Function can monitor smart bin fill levels in Firebase Realtime Database and update a `notify` status.
    *   The Waste Tracking Dashboard includes a placeholder card for displaying Smart Bin data.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **UI**: React, ShadCN UI Components
-   **Styling**: Tailwind CSS
-   **Generative AI**: Genkit (with Google AI - Gemini, e.g., `gemini-1.5-flash-latest`)
-   **Charting**: Recharts
-   **State Management**: React Context API, Local Storage for client-side persistence (e.g., user data, history, settings).
-   **Forms**: React Hook Form, Zod for validation.
-   **Database (Conceptual for Production)**: Firebase Firestore (for user profiles, waste entries, challenges, marketplace items). Firebase Realtime Database (for IoT smart bin data).
-   **Authentication (Conceptual for Production)**: Firebase Authentication.
-   **Backend Logic (Conceptual for Production)**: Firebase Cloud Functions (example provided for IoT Smart Bin integration).
-   **Containerization**: Docker, Docker Compose (for development and production builds).

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)
-   A Firebase project:
    *   To obtain Firebase configuration keys for client-side SDK initialization.
    *   (Optional, for full backend) For deploying Firestore, Realtime Database, Authentication, and Cloud Functions.
-   API Keys:
    *   **Gemini API Key**: **Required** for Genkit AI features. Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey).
    *   **Google Maps API Key (Optional for Basic Embed)**: The embedded map for recycling centers uses Google Maps Embed API, which can work for basic searches without a key. For full features, higher usage limits, or if you switch to the Maps JavaScript API, a key is recommended/required.

### Environment Variables Setup

1.  **Copy the example environment file (if needed)**:
    Your project uses a `.env` file for environment variables. For local development, you can directly edit this file or create a `.env.local` for overrides. **It is highly recommended to use `.env.local` for your secret API keys and add `.env.local` to your `.gitignore` file.**
    ```bash
    # If .env.local does not exist, you might create it:
    # cp .env .env.local 
    ```
2.  **Update `.env` or (preferably) `.env.local`**:
    Open the file and fill in your API keys and Firebase configuration:
    ```env
    # Firebase Configuration (replace with your actual Firebase project config)
    # These are used by src/lib/firebase.ts
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id # Optional

    # Genkit (Google AI - Gemini)
    # REQUIRED for AI features (waste classification, AI assistant).
    GEMINI_API_KEY=your_actual_gemini_api_key 

    # Google Maps API Key (Optional for basic map embeds)
    # Recommended for full features if you expand map usage beyond the current Embed API.
    # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    ```
    **Important**: Ensure your `GEMINI_API_KEY` is correctly set for the AI features to function. After editing environment files, you **must restart your development server** for the changes to take effect.

## Development

This project is configured to run in a Docker container for a consistent development environment with live reloading.

### Using Docker for Development (Recommended)

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
    -   Use environment variables from the `.env` file (Docker Compose automatically loads it).
    -   The `WATCHPACK_POLLING=true` environment variable is set in `docker-compose.yml` to help ensure file changes are detected reliably in Docker.

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
    # yarn install
    ```

2.  **Set up environment variables**:
    Ensure your `.env` file (or preferably `.env.local`) has the necessary API keys (especially `GEMINI_API_KEY`) and Firebase configuration.

3.  **Run the development server**:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

## Project Structure Highlights

-   `/.env`: Base environment variables (commit only if non-sensitive defaults; use `.env.local` for secrets).
-   `/public/`: Static assets (images, fonts, etc.).
    -   `/public/assets/images/`: Contains images used for categories (e.g., `cardboard.png`, `ewaste.png`).
-   `/src/`: Main application source code.
    -   `/src/ai/`: Genkit AI flows and configuration.
        -   `/src/ai/flows/`: Specific AI agent logic (e.g., `classify-waste.ts`, `eco-planner-assistant.ts`).
        -   `/src/ai/genkit.ts`: Genkit global instance and plugin setup.
    -   `/src/app/`: Next.js App Router pages and layouts.
        -   Contains subdirectories for each page/route (e.g., `dashboard`, `history`, `login`).
        -   `globals.css`: Global styles and Tailwind CSS theme variables (including map embed styles).
        -   `layout.tsx`: Root layout for the application.
        -   `page.tsx`: Homepage component.
    -   `/src/components/`: Reusable React components.
        -   `/src/components/layout/`: Layout components like `header.tsx`.
        -   `/src/components/ui/`: ShadCN UI components.
        -   `/src/components/auth-form.tsx`: Login/Signup form.
        -   `/src/components/image-upload.tsx`: Component for image capture/selection.
    -   `/src/hooks/`: Custom React hooks (e.g., `useToast.ts`, `useMobile.ts`).
    -   `/src/lib/`: Utility functions, type definitions, and Firebase integration.
        -   `firebase.ts`: Firebase app initialization (uses environment variables).
        -   `firebaseFunctions.ts`: Example backend logic for potential Firebase Cloud Functions (e.g., `rtdbUpdateBinNotifyOnFillLevelChange`).
        -   `storage.ts`: Local storage helper functions.
        -   `types.ts`: TypeScript type definitions for data structures.
        -   `utils.ts`: General utility functions (like `cn` for class names).
-   `Dockerfile`: For building the production Docker image.
-   `Dockerfile.dev`: For building the development Docker image.
-   `docker-compose.yml`: Configures the Docker development environment using `Dockerfile.dev`.
-   `next.config.ts`: Next.js configuration.
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Key API Keys and Setup Details

-   **Firebase**:
    *   Client-side configuration (e.g., `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) is needed in your `.env` or `.env.local` for the Firebase JS SDK to initialize in the browser (see `src/lib/firebase.ts`).
    *   For actual backend database persistence, authentication, and Cloud Functions, you would need to set up these services in your Firebase project console.
-   **Gemini API Key (`GEMINI_API_KEY`)**:
    *   **Required** for the Genkit AI features (waste classification, AI assistant).
    *   Obtain this from [Google AI Studio](https://makersuite.google.com/app/apikey).
    *   Store it in your `.env` or `.env.local` file. Genkit uses this server-side, so it does *not* need the `NEXT_PUBLIC_` prefix.
-   **Google Maps API Key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)**:
    *   Currently, the app uses the Google Maps Embed API, which may work for basic searches without a key.
    *   If you want more advanced map features (like full JavaScript API control, directions, Places API) or encounter usage limits, you'll need to enable the relevant APIs in Google Cloud Console and get an API key. Store it with the `NEXT_PUBLIC_` prefix.

## Deployment

### Production Docker Image

The `Dockerfile` in the project root is configured for building an optimized production image of the Next.js application.
1.  **Build the image**:
    ```bash
    docker build -t ecosnap-app .
    ```
2.  **Run the container**:
    When running, ensure all necessary environment variables (those used server-side like `GEMINI_API_KEY`, and those used client-side like `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) are passed to the container.
    ```bash
    docker run -p 3000:3000 \
      -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
      -e NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key \
      # ... (add all NEXT_PUBLIC_ and server-side variables like GEMINI_API_KEY) \
      -e GEMINI_API_KEY=your_gemini_api_key \
      ecosnap-app
    ```

### Firebase Cloud Functions (for IoT Smart Bin)

The example backend logic for the IoT Smart Bin integration (`rtdbUpdateBinNotifyOnFillLevelChange` in `src/lib/firebaseFunctions.ts`) is designed to be deployed as a Firebase Cloud Function that listens to changes in your Firebase Realtime Database.
Refer to the comments in `src/lib/firebaseFunctions.ts` and the official Firebase documentation for detailed deployment steps for Cloud Functions.

## Contributing

(Add guidelines for contributing if this is an open project. For example:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
)
---

This README provides a comprehensive guide to getting started with EcoSnap. Feel free to expand it with more details specific to your project's evolution.

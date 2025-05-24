
# EcoSnap - Smart Waste Classification & Tracking

EcoSnap is a Next.js application designed to help users classify waste, track their environmental impact, and engage in eco-friendly practices. It features AI-powered waste classification, a detailed waste tracking dashboard, gamified reduction challenges, a community reuse marketplace, and more.

## Core Features

-   **AI-Powered Waste Categorization**: Upload photos to classify waste into specific categories (e.g., cardboard, paper, plasticPete, ewaste, biowaste, metal, other) using Genkit and Google AI (Gemini).
-   **Waste Tracking Dashboard**: 
    *   Visualizes general waste trends by type, quantity, and time with interactive charts (Recharts) using live data from Firebase Firestore.
    *   Includes filters for date range and waste type, and summary statistics (total waste, recycled ratio).
    *   Features a dedicated section for **E-Waste Smart Bin Monitoring** with simulated real-time line, pie, and bar charts for e-waste volume, category distribution, and monthly collection.
    *   Includes a section for **General Smart Bin Monitoring** displaying live status (ID, location, fill level, battery, last updated, notification status) of connected smart bins from Firebase Realtime Database.
    *   Displays a live fill-level trend chart for a specific bin (`bin1/fill_level_history`) from Firebase Realtime Database.
-   **Gamified Reduction Challenges**: Participate in eco-friendly missions, track progress (placeholder data), earn badges (bronze, silver, gold, diamond tiers based on score), and compete on a leaderboard. UI components and data structures are in place.
-   **Nearby Recycling Centers & Schedules**: 
    *   Find local recycling centers using an embedded Google Maps iframe that updates based on user search or geolocation.
    *   View (placeholder) local collection schedules based on user-inputted location.
    *   Manage notification preferences for schedules (UI only).
-   **Community Reuse Marketplace**: Donate, exchange, or sell used goods. Features a list of items with images (using local asset paths) and descriptions (currently placeholder item listings).
-   **AI Eco-Planner Assistant**: Get recommendations for eco-friendly products and event planning via an AI chatbot interface using Genkit. Includes display of source links if provided by the AI.
-   **Leaderboard System**: Rank users based on waste reduction performance (currently uses placeholder data).
-   **User Authentication**: Simple login and signup UI (frontend only, using local storage for session persistence) with form validation (including show/hide password).
-   **User Profile & Progress**:
    *   Tracks user score, CO₂ managed, and items classified by category.
    *   Displays user level (Bronze, Silver, Gold, Diamond) with a progress bar and badge.
-   **Historical Classification Log**: Users can view a history of their classified items with images, categories, confidence, and points earned. Includes accordion section with detailed "5 Rs" (Reduce, Reuse, Recycle, Educate, Support) tips for various waste categories.
-   **IoT Smart Bin Integration (Conceptual & Implemented for RTDB Display)**:
    *   **Realtime Database Structure**: Expects bin data under `/bins/{binId}` in Firebase Realtime Database, including `fill_level`, `notify`, `location`, `battery_level`, `last_updated`, and `lastEmptied`. Also monitors `/bin1/fill_level_history`.
    *   **Backend Logic Example**: `rtdbUpdateBinNotifyOnFillLevelChange` in `src/lib/firebaseFunctions.ts` demonstrates how a Firebase Cloud Function can monitor smart bin fill levels in Firebase Realtime Database and update a `notify` status.
    *   **Dashboard Display**: The Waste Tracking Dashboard fetches and displays this RTDB data in real-time.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **UI**: React, ShadCN UI Components
-   **Styling**: Tailwind CSS
-   **Generative AI**: Genkit (with Google AI - Gemini, e.g., `gemini-1.5-flash-latest`)
-   **State Management (Client-side)**: React Context API, Local Storage for client-side persistence (e.g., user data, history, settings).
-   **Forms**: React Hook Form, Zod for validation.
-   **Database**: 
    *   Firebase Firestore (for user profiles, general waste entries, challenges, marketplace items).
    *   Firebase Realtime Database (for IoT smart bin data like `/bins` and `/bin1/fill_level_history`).
-   **Authentication**: Firebase Authentication (client-side integration, backend rules for user-specific data).
-   **Charting**: Recharts
-   **Backend Logic (Conceptual for Production/Example Provided)**: Firebase Cloud Functions (example provided for IoT Smart Bin integration with Realtime Database).
-   **Containerization**: Docker, Docker Compose (for development and production builds).

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)
-   A Firebase project:
    *   Set up Firestore Database (Native mode).
    *   Set up Realtime Database.
    *   Enable Firebase Authentication (e.g., Email/Password).
    *   Obtain Firebase configuration keys for client-side SDK initialization.
-   API Keys:
    *   **Gemini API Key**: **Required** for Genkit AI features. Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey).
    *   **Google Maps API Key (Optional for Basic Embed)**: The embedded map for recycling centers uses Google Maps Embed API, which can work for basic searches without a key. For full features, higher usage limits, or if you switch to the Maps JavaScript API, a key is recommended/required.

### Environment Variables Setup

1.  **Create `.env.local` (Recommended for Secrets)**:
    It is highly recommended to create a `.env.local` file in the project root for your secret API keys and Firebase configuration. This file is gitignored by default in most Next.js projects (ensure it is in your `.gitignore`).
    ```bash
    # If .env.local does not exist, create it:
    # touch .env.local
    ```
    You can copy the contents from the `.env` file as a template.

2.  **Update `.env` or (preferably) `.env.local`**:
    Open the file and fill in your API keys and Firebase configuration:
    ```env
    # Firebase Configuration (replace with your actual Firebase project config)
    # These are used by src/lib/firebase.ts
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url # For Realtime Database
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id # Optional, for Analytics

    # Genkit (Google AI - Gemini)
    # REQUIRED for AI features (waste classification, AI assistant). Store in .env.local
    GEMINI_API_KEY=your_actual_gemini_api_key 

    # Google Maps API Key (Optional for basic map embeds)
    # Recommended for full features if you expand map usage.
    # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    ```
    **Important**: 
    - Ensure your `GEMINI_API_KEY` is correctly set for the AI features to function.
    - Ensure your Firebase config (especially `NEXT_PUBLIC_FIREBASE_DATABASE_URL` for Realtime Database and `NEXT_PUBLIC_FIREBASE_PROJECT_ID` for Firestore) is correct.
    - After editing environment files, you **must restart your development server** for the changes to take effect.

## Development

This project is configured to run in a Docker container for a consistent development environment with live reloading.

### Using Docker for Development (Recommended)

1.  **Ensure `.env` or `.env.local` is Populated**:
    Make sure your `.env` file (or preferably `.env.local` for secrets) has all the necessary API keys (especially `GEMINI_API_KEY`) and Firebase configuration as listed above. The `docker-compose.yml` file is configured to load these.

2.  **Build and run the development container**:
    From the project root directory, execute:
    ```bash
    docker-compose up --build
    ```
    This command will:
    -   Build the Docker image using `Dockerfile.dev`.
    -   Start a container based on this image.
    -   Mount your local project directory into the container, so code changes are reflected.
    -   Forward port 9002 from the container to your host machine.
    -   Use environment variables from the `.env` file (Docker Compose automatically loads it). `.env.local` will override `.env`.
    -   The `WATCHPACK_POLLING=true` environment variable is set in `docker-compose.yml` to help ensure file changes are detected reliably in Docker.

3.  **Access the application**:
    Open your browser and navigate to `http://localhost:9002`.

4.  **Live Reloading**:
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
    -   `/public/assets/images/`: Contains images used for categories (e.g., `cardboard.png`, `ewaste.png`, `bronze-badge.png`).
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
        -   `firebase.ts`: Firebase app initialization (uses environment variables for Auth, Firestore, Realtime Database, Analytics).
        -   `firebaseFunctions.ts`: Example backend logic for potential Firebase Cloud Functions (e.g., `rtdbUpdateBinNotifyOnFillLevelChange` for IoT Smart Bin).
        -   `storage.ts`: Local storage helper functions.
        -   `types.ts`: TypeScript type definitions for data structures.
        -   `utils.ts`: General utility functions (like `cn` for class names).
-   `Dockerfile`: For building the production Docker image.
-   `Dockerfile.dev`: For building the development Docker image.
-   `docker-compose.yml`: Configures the Docker development environment using `Dockerfile.dev`.
-   `next.config.ts`: Next.js configuration (includes `placehold.co` and `picsum.photos` for remote image patterns).
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Key API Keys and Setup Details

-   **Firebase**:
    *   Client-side configuration (e.g., `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) is needed in your `.env` or `.env.local` for the Firebase JS SDK to initialize in the browser (see `src/lib/firebase.ts`).
    *   For actual backend database persistence (Firestore, Realtime Database), authentication, and Cloud Functions, you need to set up these services in your Firebase project console and ensure your security rules are configured appropriately.
-   **Gemini API Key (`GEMINI_API_KEY`)**:
    *   **Required** for the Genkit AI features (waste classification, AI assistant).
    *   Obtain this from [Google AI Studio](https://makersuite.google.com/app/apikey).
    *   Store it in your `.env` or `.env.local` file. Genkit uses this server-side, so it does *not* need the `NEXT_PUBLIC_` prefix. This key also needs to be passed as a build argument when building the production Docker image.
-   **Google Maps API Key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)**:
    *   The app uses the Google Maps Embed API, which may work for basic searches without a key.
    *   For advanced map features or higher usage limits, a key is recommended. Store it with the `NEXT_PUBLIC_` prefix if used. This also needs to be passed as a build argument for production Docker images.

## Deployment

### Production Docker Image

The `Dockerfile` in the project root is configured for building an optimized production image of the Next.js application.

1.  **Build the image with build arguments**:
    The `Dockerfile` expects certain environment variables to be available during the build process (e.g., for pre-rendering pages that might use them). Pass these as `--build-arg`.
    For **PowerShell**:
    ```powershell
    docker build `
      --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY" `
      --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN" `
      --build-arg NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DATABASE_URL" `
      --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID" `
      --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET" `
      --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID" `
      --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID" `
      --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" `
      --build-arg GEMINI_API_KEY="YOUR_GEMINI_API_KEY" `
      -t ecosnap-app .
    ```
    For **Bash (Linux/macOS)**:
    ```bash
    docker build \
      --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY" \
      --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN" \
      --build-arg NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DATABASE_URL" \
      --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID" \
      --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET" \
      --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID" \
      --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID" \
      --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" \
      --build-arg GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
      -t ecosnap-app .
    ```
    *(Replace `"YOUR_..."` placeholders with your actual values)*

2.  **Run the container**:
    When running, pass the same environment variables using the `-e` flag. These are needed at runtime.
    For **PowerShell**:
    ```powershell
    docker run -p 3000:3000 `
      -e NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY" `
      -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN" `
      -e NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DATABASE_URL" `
      -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID" `
      -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET" `
      -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID" `
      -e NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID" `
      -e NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" `
      -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" `
      ecosnap-app
    ```
    For **Bash (Linux/macOS)**:
    ```bash
    docker run -p 3000:3000 \
      -e NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY" \
      -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN" \
      -e NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DATABASE_URL" \
      -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID" \
      -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET" \
      -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID" \
      -e NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID" \
      -e NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" \
      -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
      ecosnap-app
    ```
    Access the application at `http://localhost:3000`.

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

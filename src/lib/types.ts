export interface ClassificationRecord {
  id: string;
  imageDataUri: string;
  category: string; // Will now be 'recyclable', 'compostable', or 'non-recyclable'
  confidence: number;
  timestamp: number;
}

// For Gamified Reduction Challenges
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  badgeIcon?: string; // Lucide icon name or path to SVG for the badge
  criteria: {
    type: 'classification_count' | 'login_streak' | 'share_app' | 'custom'; // Type of challenge
    categoryGoal?: 'recyclable' | 'compostable' | 'non-recyclable'; // Specific category for classification challenges
    countGoal?: number; // Number of items to classify, days for streak etc.
    customLogic?: string; // Identifier for custom challenge logic if needed
  };
}

export interface UserChallengeProgress {
  challengeId: string;
  currentProgress: number;
  completed: boolean;
  completedAt?: number;
}

// For Community Reuse Marketplace
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  itemCategory: 'clothing' | 'electronics' | 'furniture' | 'books' | 'food' | 'other'; // Category of the item itself
  imageDataUri?: string; // Optional image of the item
  postedAt: number;
  // For simplicity, we might not implement full user accounts in a client-side app.
  // This could be a simple name or an ID if we had user context.
  postedBy: string; 
  status: 'available' | 'reserved' | 'taken';
  location?: string; // General location (e.g., city or postal code)
  contactInfo?: string; // How to contact the poster (e.g. "Reply via app" if messaging was implemented, or masked email)
}

// For Leaderboard System
export interface UserProfile { // Basic user profile, even if local
  id: string; // Could be a locally generated UUID
  displayName: string;
  avatar?: string; // data URI or link to an image
  score: number;
  // Extended stats for leaderboard details
  totalRecyclable: number;
  totalCompostable: number;
  totalNonRecyclable: number;
  challengesCompleted: number;
}

// Data structure for storing user game/app data
export interface UserEcoData {
  profile: UserProfile;
  challengeProgress: UserChallengeProgress[];
  // Classification history is already stored separately under 'ecoSnapHistory'
}

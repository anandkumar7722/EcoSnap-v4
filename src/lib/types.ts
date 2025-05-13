export type WasteCategory = 'ewaste' | 'plastic' | 'biowaste' | 'cardboard' | 'paper' | 'glass' | 'other';

export interface ClassificationRecord {
  id: string;
  imageDataUri: string;
  category: WasteCategory;
  confidence: number;
  timestamp: number;
  points?: number;
}

// For Gamified Reduction Challenges
export interface Challenge {
  id:string;
  title: string;
  description: string;
  points: number;
  badgeIcon?: string; // Lucide icon name or path to SVG for the badge
  currentProgress?: number; // Added for UI display
  targetProgress?: number; // Added for UI display
  completed?: boolean; // Added for UI display
  criteria: {
    type: 'classification_count' | 'login_streak' | 'share_app' | 'custom' | 'specific_category_count'; // Type of challenge
    categoryGoal?: WasteCategory; // Specific category for classification challenges
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

// For Leaderboard System & User Data
export interface UserProfile {
  id: string;
  displayName: string;
  avatar?: string; // data URI or link to an image
  score: number; // Total points
  targetScore?: number; // Target points for progress bar
  co2Managed: number; // CO2 managed in Kg

  // Counts for new categories
  totalEwaste: number;
  totalPlastic: number;
  totalBiowaste: number;
  totalCardboard: number;
  totalPaper: number;
  totalGlass: number;
  totalOther: number;
  
  itemsClassified: number; // Overall count of all items
  challengesCompleted: number;
}

// Data structure for storing user game/app data (consolidated)
export interface UserEcoData {
  profile: UserProfile;
  challengeProgress: UserChallengeProgress[];
  // Classification history is stored separately under 'ecoSnapHistory'
}

// For the "Let's recycle" quick log section
export interface QuickLogItem {
  id: WasteCategory;
  name: string;
  imageUrl: string;
  points: number;
  dataAiHint: string;
}

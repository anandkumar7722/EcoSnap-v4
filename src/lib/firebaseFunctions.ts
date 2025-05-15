
/**
 * @fileOverview Example backend logic for EcoSnap.
 * These functions illustrate how you might handle data updates in Firestore.
 * They can be adapted for Firebase Cloud Functions or Next.js API Routes/Server Actions.
 *
 * IMPORTANT: This is example pseudo-code / TypeScript logic.
 * Full Firebase Admin SDK setup, triggers, and error handling are omitted for brevity.
 * You would need to deploy these as actual Firebase Cloud Functions with appropriate triggers
 * (e.g., onWrite to Firestore collections) or integrate into your Next.js backend.
 */

import type { WasteEntry, UserProfile, Challenge, UserChallengeProgress, WasteCategory } from './types';
// In a real Firebase Functions environment, you'd use:
// import * as admin from 'firebase-admin';
// admin.initializeApp();
// const db = admin.firestore();

// Placeholder for Firestore interaction (replace with actual Firebase Admin SDK calls)
const db = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => Promise.resolve({ exists: false, data: () => undefined as any }),
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve(),
    }),
    where: (field: string, op: any, value: any) => ({
      get: async () => Promise.resolve({ empty: true, docs: [] as any[] }),
    }),
  }),
};

const WASTE_POINTS_MAP: Record<WasteCategory, number> = {
  ewaste: 20,
  plastic: 10,
  biowaste: 5,
  organic: 5,
  cardboard: 15,
  paper: 15,
  glass: 8,
  metal: 18,
  other: 2,
};

/**
 * Example: Updates user points and waste stats when a new waste entry is created.
 * Trigger: Firestore onWrite to `/wasteEntries/{entryId}`
 */
export async function onWasteEntryCreate(newEntry: WasteEntry, userId: string): Promise<void> {
  if (!userId || !newEntry) {
    console.error('User ID or waste entry missing.');
    return;
  }

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error(`User ${userId} not found.`);
    // Optionally create a basic user profile here if it's the first entry
    return;
  }

  const userProfile = userDoc.data() as UserProfile;
  const pointsEarned = (WASTE_POINTS_MAP[newEntry.type] || 0) * newEntry.quantity; // Or more complex logic based on unit

  const updates: Partial<UserProfile> = {
    score: (userProfile.score || 0) + pointsEarned,
    itemsClassified: (userProfile.itemsClassified || 0) + 1, // or + newEntry.quantity if unit is 'items'
  };

  const categoryKey = `total${newEntry.type.charAt(0).toUpperCase() + newEntry.type.slice(1)}` as keyof UserProfile;
  if (categoryKey in userProfile) {
    updates[categoryKey] = ((userProfile[categoryKey] as number) || 0) + newEntry.quantity;
  }


  try {
    await userRef.update(updates);
    console.log(`User ${userId} profile updated with ${pointsEarned} points.`);

    // After updating points, check for challenge completions
    await checkAllUserChallenges(userId, newEntry);
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

/**
 * Example: Checks and updates progress for all active challenges for a user.
 * Can be called after a new waste entry or other relevant user actions.
 */
export async function checkAllUserChallenges(userId: string, relevantEntry?: WasteEntry): Promise<void> {
  const challengesSnapshot = await db.collection('challenges').where('isActive', '==', true).get();
  if (challengesSnapshot.empty) {
    return;
  }

  for (const challengeDoc of challengesSnapshot.docs) {
    const challenge = challengeDoc.data() as Challenge;
    const progressRef = db.collection('userChallengeProgress').doc(`${userId}_${challenge.id}`);
    const progressDoc = await progressRef.get();
    let userProgressData: UserChallengeProgress;

    if (progressDoc.exists) {
      userProgressData = progressDoc.data() as UserChallengeProgress;
      if (userProgressData.completed) continue; // Skip already completed challenges
    } else {
      // Create new progress doc if it doesn't exist
      userProgressData = {
        challengeId: challenge.id,
        userId: userId,
        currentProgress: 0,
        targetValue: challenge.targetValue,
        completed: false,
        startedAt: Date.now(),
        lastUpdatedAt: Date.now(),
      };
    }

    let progressMadeThisAction = 0;
    if (challenge.type === 'log_specific_item_count' && relevantEntry?.type === challenge.categoryGoal) {
      progressMadeThisAction = relevantEntry.quantity; // Or 1 if unit is 'items' and quantity is count
    }
    // Add logic for other challenge types: 'reduce_category_by_percentage', 'daily_login', etc.
    // This would involve fetching historical data for percentage challenges.

    if (progressMadeThisAction > 0) {
      userProgressData.currentProgress += progressMadeThisAction;
      userProgressData.lastUpdatedAt = Date.now();

      if (userProgressData.currentProgress >= userProgressData.targetValue) {
        userProgressData.completed = true;
        userProgressData.completedAt = Date.now();
        
        // Award points and badge from challenge
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userProfile = userDoc.data() as UserProfile;
          const newScore = (userProfile.score || 0) + challenge.points;
          const newBadges = [...(userProfile.badges || [])];
          if (challenge.badgeName && !newBadges.includes(challenge.badgeName)) {
            newBadges.push(challenge.badgeName);
          }
          await userRef.update({ 
            score: newScore, 
            challengesCompleted: (userProfile.challengesCompleted || 0) + 1,
            badges: newBadges
          });
          console.log(`Challenge ${challenge.id} completed by user ${userId}. Points and badge awarded.`);
        }
      }
      await progressRef.set(userProgressData, { merge: true });
    }
  }
}

/**
 * Example: To be run daily to check for login streaks or reset weekly challenges.
 * Trigger: Firebase Scheduled Function (e.g., daily at midnight)
 */
export async function dailyChallengeMaintenance(): Promise<void> {
  // Logic for daily login challenges:
  // - Iterate users, check last login, update streak.
  // Logic for weekly challenge resets:
  // - Find weekly challenges that ended, mark them inactive or archive progress.
  // - Create new instances of recurring weekly challenges.
  console.log('Daily challenge maintenance run.');
}


/**
 * @fileOverview Example backend logic for EcoSnap.
 * These functions illustrate how you might handle data updates in Firestore or Realtime Database.
 * They are intended to be adapted for Firebase Cloud Functions or Next.js API Routes/Server Actions.
 *
 * IMPORTANT: This is example pseudo-code / TypeScript logic.
 * Full Firebase Admin SDK setup, triggers, and error handling are omitted for brevity
 * unless explicitly shown for a particular function.
 * You would need to deploy these as actual Firebase Cloud Functions with appropriate triggers
 * (e.g., onWrite to Firestore collections or Realtime Database paths) or integrate
 * into your Next.js backend.
 */

import type { WasteEntry, UserProfile, Challenge, UserChallengeProgress, WasteCategory } from './types';

// For Cloud Function deployment, you would uncomment and use these:
// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// if (admin.apps.length === 0) {
//   admin.initializeApp();
// }

// Placeholder for Firestore interaction (replace with actual Firebase Admin SDK calls in a real Cloud Function)
const firestoreDb = {
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
  ewaste: 100,
  plastic: 50,
  biowaste: 60,
  cardboard: 80,
  paper: 70,
  glass: 30,
  metal: 40,
  organic: 60,
  other: 10,
  plasticOther: 20,
  plasticPete: 55,
  plasticHdpe: 55,
  plasticPp: 45,
  plasticPs: 15,
};


/**
 * Example Firestore Function: Updates user points and waste stats when a new waste entry is created.
 * Trigger: Firestore onWrite to `/wasteEntries/{entryId}`
 */
export async function onWasteEntryCreate(newEntry: WasteEntry, userId: string): Promise<void> {
  if (!userId || !newEntry) {
    console.error('User ID or waste entry missing.');
    return;
  }

  const userRef = firestoreDb.collection('users').doc(userId); // In a real function: admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error(`User ${userId} not found.`);
    return;
  }

  const userProfile = userDoc.data() as UserProfile;
  const pointsEarned = (WASTE_POINTS_MAP[newEntry.type] || WASTE_POINTS_MAP.other) * newEntry.quantity;

  const updates: Partial<UserProfile> = {
    score: (userProfile.score || 0) + pointsEarned,
    itemsClassified: (userProfile.itemsClassified || 0) + 1,
  };

  const categoryKey = `total${newEntry.type.charAt(0).toUpperCase() + newEntry.type.slice(1)}` as keyof UserProfile;
  if (categoryKey in userProfile) {
    updates[categoryKey] = ((userProfile[categoryKey] as number) || 0) + newEntry.quantity;
  } else if (newEntry.type.startsWith('plastic') && newEntry.type !== 'plastic') {
    // Handle specific plastic types if direct key doesn't exist
    updates.totalPlastic = (userProfile.totalPlastic || 0) + newEntry.quantity;
  } else {
    updates.totalOther = (userProfile.totalOther || 0) + newEntry.quantity;
  }


  try {
    await userRef.update(updates);
    console.log(`User ${userId} profile updated with ${pointsEarned} points.`);
    await checkAllUserChallenges(userId, newEntry);
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

/**
 * Example Firestore Function: Checks and updates progress for all active challenges for a user.
 */
export async function checkAllUserChallenges(userId: string, relevantEntry?: WasteEntry): Promise<void> {
  const challengesSnapshot = await firestoreDb.collection('challenges').where('isActive', '==', true).get();
  if (challengesSnapshot.empty) {
    return;
  }

  for (const challengeDoc of challengesSnapshot.docs) {
    const challenge = challengeDoc.data() as Challenge;
    const progressRef = firestoreDb.collection('userChallengeProgress').doc(`${userId}_${challenge.id}`);
    const progressDoc = await progressRef.get();
    let userProgressData: UserChallengeProgress;

    if (progressDoc.exists) {
      userProgressData = progressDoc.data() as UserChallengeProgress;
      if (userProgressData.completed) continue;
    } else {
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
      progressMadeThisAction = relevantEntry.quantity;
    }

    if (progressMadeThisAction > 0) {
      userProgressData.currentProgress += progressMadeThisAction;
      userProgressData.lastUpdatedAt = Date.now();

      if (userProgressData.currentProgress >= userProgressData.targetValue) {
        userProgressData.completed = true;
        userProgressData.completedAt = Date.now();
        
        const userRef = firestoreDb.collection('users').doc(userId);
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
 * Example Firestore Scheduled Function: To be run daily for maintenance.
 */
export async function dailyChallengeMaintenance(): Promise<void> {
  console.log('Daily challenge maintenance run.');
}


/**
 * ========================================================================
 * Firebase Realtime Database Cloud Function Example
 * ========================================================================
 * This function should be deployed as a Firebase Cloud Function.
 * It monitors the '/bins/{binId}' path in your Realtime Database.
 * When a bin's 'fill_level' is updated, it sets the 'notify' field.
 */

// For actual deployment, you would use firebase-functions and firebase-admin:
// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// if (admin.apps.length === 0) { admin.initializeApp(); }

// This is a TypeScript representation of the function.
// The actual trigger and context types come from 'firebase-functions'.
interface RTDBChangeSnapshot {
  before: { exists: () => boolean; val: () => any; ref: any /* admin.database.Reference */ };
  after: { exists: () => boolean; val: () => any; ref: any /* admin.database.Reference */ };
}
interface RTDBEventContext {
  params: { [key: string]: string };
}

export async function rtdbUpdateBinNotifyOnFillLevelChange(
  change: RTDBChangeSnapshot, // functions.Change<functions.database.DataSnapshot>
  context: RTDBEventContext   // functions.EventContext
): Promise<null | void> {
  const binId = context.params.binId;

  // If the bin data was deleted, do nothing.
  if (!change.after.exists()) {
    console.log(`Bin ${binId} (RTDB) deleted. No action needed.`);
    return null;
  }

  const binData = change.after.val();

  // Check if fill_level exists and is a number.
  if (typeof binData.fill_level !== 'number') {
    console.log(`Bin ${binId} (RTDB): fill_level is missing or not a number. Current value: ${binData.fill_level}.`);
    // If fill_level is invalid, ensure notify is false to prevent stale notifications.
    if (binData.notify !== false) {
      return change.after.ref.child('notify').set(false)
        .then(() => {
          console.log(`Bin ${binId} (RTDB): fill_level invalid, ensured notify is false.`);
          return null; // Explicitly return null for promise chain
        })
        .catch((error: Error) => {
          console.error(`Bin ${binId} (RTDB): Error setting notify to false due to invalid fill_level:`, error);
          return null; // Explicitly return null for promise chain
        });
    }
    return null;
  }

  const fillLevel: number = binData.fill_level;
  const currentNotifyStatus: boolean | undefined = binData.notify;
  let newNotifyStatus: boolean;

  if (fillLevel >= 90) {
    newNotifyStatus = true;
  } else {
    newNotifyStatus = false;
  }

  // Only update if the notify status needs to change.
  // This prevents infinite loops and unnecessary database writes.
  if (newNotifyStatus !== currentNotifyStatus) {
    try {
      await change.after.ref.child('notify').set(newNotifyStatus);
      console.log(`Bin ${binId} (RTDB): fill_level is ${fillLevel}%. Set notify to ${newNotifyStatus}.`);
    } catch (error) {
      console.error(`Bin ${binId} (RTDB): Error updating notify status for fill_level ${fillLevel}:`, error);
      // Depending on your retry strategy, you might re-throw the error to trigger retries.
    }
  } else {
    console.log(`Bin ${binId} (RTDB): fill_level is ${fillLevel}%. Notify status (${currentNotifyStatus === undefined ? 'undefined' : currentNotifyStatus}) is already correct or implies no change. No update needed.`);
  }
  return null; // Explicitly return null at the end of the function
}

/**
 * How to deploy rtdbUpdateBinNotifyOnFillLevelChange as a Cloud Function:
 *
 * 1. Ensure you have Firebase CLI installed and configured.
 * 2. In your Firebase project, initialize Cloud Functions: `firebase init functions`
 *    (Choose TypeScript if you prefer, then adapt this code).
 * 3. Place the actual `firebase-functions` and `firebase-admin` imports and initialization
 *    at the top of your `index.ts` (or `index.js`) file in the `functions` directory.
 * 4. Add the following export to your `functions/index.ts` (or `index.js`):
 *
 *    For JavaScript (functions/index.js):
 *    const admin = require('firebase-admin');
 *    const functions = require('firebase-functions');
 *    if (admin.apps.length === 0) { admin.initializeApp(); }
 *    // ... (copy the rtdbUpdateBinNotifyOnFillLevelChange function here, adjusting for JS if needed) ...
 *    exports.rtdbSmartBinNotifier = functions.database.ref('/bins/{binId}')
 *      .onWrite(rtdbUpdateBinNotifyOnFillLevelChange);
 *
 *    For TypeScript (functions/src/index.ts):
 *    import * as admin from 'firebase-admin';
 *    import * as functions from 'firebase-functions';
 *    if (admin.apps.length === 0) { admin.initializeApp(); }
 *    // ... (copy or import the rtdbUpdateBinNotifyOnFillLevelChange function here) ...
 *    export const rtdbSmartBinNotifier = functions.database.ref('/bins/{binId}')
 *      .onWrite(rtdbUpdateBinNotifyOnFillLevelChange);
 *
 * 5. Deploy your functions: `firebase deploy --only functions`
 */

  
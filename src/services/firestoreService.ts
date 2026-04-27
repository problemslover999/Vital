import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Routine, Message, UserProgress, UserGoal, HealthInsight, UserProfile } from '@/src/types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile
export async function ensureUserProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
    } else {
      await updateDoc(userRef, {
        lastActive: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Routines
export async function saveRoutine(routine: Routine) {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/routines/${routine.id}`;
  try {
    await setDoc(doc(db, path), {
      ...routine,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToRoutines(callback: (routines: Routine[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const colRef = collection(db, `users`, user.uid, 'routines');
  return onSnapshot(colRef, (snapshot) => {
    const routines = snapshot.docs.map(doc => doc.data() as Routine);
    callback(routines);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}/routines`);
  });
}

// Progress
export async function saveProgress(progress: UserProgress) {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/progress/${progress.date}`;
  try {
    await setDoc(doc(db, path), {
      ...progress,
      userId: user.uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRoutine(id: string) {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/routines/${id}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProgressHistory() {
  const user = auth.currentUser;
  if (!user) return [];

  const path = `users/${user.uid}/progress`;
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    // Return last 7 entries for the chart, reversed to chronological order
    return snapshot.docs.map(doc => doc.data() as UserProgress).slice(0, 7).reverse();
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Chat Messages
export async function saveChatMessage(message: Message) {
  const user = auth.currentUser;
  if (!user) return;

  const id = `${message.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  const path = `users/${user.uid}/messages/${id}`;
  try {
    await setDoc(doc(db, path), {
      ...message,
      userId: user.uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToMessages(callback: (messages: Message[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const colRef = collection(db, `users`, user.uid, 'messages');
  const q = query(colRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data() as Message);
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}/messages`);
  });
}

// Goals
export async function saveGoal(goal: UserGoal) {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/goals/${goal.id || goal.type}`;
  try {
    const data = { ...goal, userId: user.uid };
    await setDoc(doc(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToGoals(callback: (goals: UserGoal[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const colRef = collection(db, `users`, user.uid, 'goals');
  return onSnapshot(colRef, (snapshot) => {
    const goals = snapshot.docs.map(doc => doc.data() as UserGoal);
    callback(goals);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}/goals`);
  });
}

// Insights
export async function saveInsight(insight: HealthInsight) {
  const user = auth.currentUser;
  if (!user) return;

  const id = `${insight.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  const path = `users/${user.uid}/insights/${id}`;
  try {
    await setDoc(doc(db, path), { ...insight, userId: user.uid });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchLastInsight() {
  const user = auth.currentUser;
  if (!user) return null;

  const path = `users/${user.uid}/insights`;
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as HealthInsight;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Profile
export async function saveProfile(profile: UserProfile) {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/profile/data`;
  try {
    await setDoc(doc(db, path), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const path = `users/${user.uid}/profile/data`;
  try {
    const docSnap = await getDoc(doc(db, path));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

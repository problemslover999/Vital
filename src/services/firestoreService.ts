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
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Routine, Message, UserProgress } from '@/src/types';

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

export async function getProgress() {
  const user = auth.currentUser;
  if (!user) return [];

  const path = `users/${user.uid}/progress`;
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => doc.data() as UserProgress);
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

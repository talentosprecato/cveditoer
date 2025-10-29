

// FIX: Migrated from v9 to v8 API to fix module export errors.
// No specific imports needed from 'firebase/firestore' as the `db` object from firebase.ts will be used.
import { db, firebaseInitialized } from './firebase.ts';
import { CVData } from '../types.ts';

const firestoreNotConfiguredError = () => {
    return Promise.reject(new Error("L'applicazione non è configurata correttamente per il database. Contatta il supporto. (Firestore configuration is missing)."));
};

// Save CV data to Firestore
export const saveCVData = async (userId: string, data: CVData): Promise<void> => {
    if (!firebaseInitialized || !db) {
        await firestoreNotConfiguredError();
        return;
    }
    // FIX: Use v8 firestore methods.
    const cvDocRef = db.collection('cvs').doc(userId);
    await cvDocRef.set({ ...data }, { merge: true });
};

// Load CV data from Firestore
export const loadCVDataFromFirestore = async (userId: string): Promise<CVData | null> => {
    if (!firebaseInitialized || !db) {
        return firestoreNotConfiguredError();
    }
    // FIX: Use v8 firestore methods.
    const cvDocRef = db.collection('cvs').doc(userId);
    const docSnap = await cvDocRef.get();
    if (docSnap.exists) {
        return docSnap.data() as CVData;
    } else {
        return null; // No document found for this user
    }
};

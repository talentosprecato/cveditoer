

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    type Auth,
    type User
} from 'firebase/auth';

// Firebase configuration is now loaded from environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;

const firebaseInitialized = 
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId;

if (firebaseInitialized) {
    try {
        app = initializeApp(firebaseConfig);
        if (app && firebaseConfig.measurementId) {
           analytics = getAnalytics(app);
        }
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        facebookProvider = new FacebookAuthProvider();
    } catch (e) {
        console.error("Error initializing Firebase:", e);
        auth = null; // Ensure auth is null on failure
    }
} else {
    console.warn("Firebase configuration is missing from environment variables. Authentication will be disabled.");
}

const authNotConfiguredError = () => Promise.reject(new Error("L'applicazione non è configurata correttamente per l'autenticazione. Contatta il supporto. (Firebase configuration is missing)."));

export const signInWithGoogle = () => {
    if (!auth || !googleProvider) return authNotConfiguredError();
    return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = () => {
    if (!auth || !facebookProvider) return authNotConfiguredError();
    return signInWithPopup(auth, facebookProvider);
};

export const signUpWithEmail = (email: string, password: string) => {
    if (!auth) return authNotConfiguredError();
    return createUserWithEmailAndPassword(auth, email, password);
};

export const logInWithEmail = (email: string, password: string) => {
    if (!auth) return authNotConfiguredError();
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    if (!auth) return authNotConfiguredError();
    return signOut(auth);
};

// Listener for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!auth) {
        callback(null); // Immediately return "not logged in"
        return () => {}; // Return a dummy unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
};
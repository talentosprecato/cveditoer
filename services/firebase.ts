// FIX: Migrated from v9 to v8 API to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// User's Firebase project configuration from their screenshot.
// REMOVED: measurementId, as it's for Analytics which is not used and can cause init errors.
const firebaseConfig = {
    apiKey: "AIzaSyDgxzv-N-1hL130J03r9XBulBtszwskkA",
    authDomain: "veravox-cv-editor.firebaseapp.com",
    projectId: "veravox-cv-editor",
    storageBucket: "veravox-cv-editor.firebasestorage.app",
    messagingSenderId: "622659489873",
    appId: "1:622659489873:web:72d30bf1e1425897612870"
};

let app: firebase.app.App | null = null;
let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;
let firebaseInitialized = false;

// Initialize Firebase only if the config has been filled out.
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY") {
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        auth = app.auth();
        
        // Force persistence to 'local' (localStorage) to avoid "Operation not supported"
        // errors in sandboxed environments where IndexedDB (the default) might be blocked.
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .catch((error) => {
                 console.error("Firebase Auth: Error setting persistence", error);
            });

        db = app.firestore();
        firebaseInitialized = true;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase configuration is missing or invalid in services/firebase.ts. Authentication and database features will be disabled.");
}

export { app, auth, db, firebaseInitialized };
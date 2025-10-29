

// FIX: Migrated from v9 to v8 API to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, firebaseInitialized } from './firebase.ts';

let googleProvider: firebase.auth.GoogleAuthProvider | null = null;

if (firebaseInitialized) {
    // FIX: Use v8 provider instantiation.
    googleProvider = new firebase.auth.GoogleAuthProvider();
}


const authNotConfiguredError = () => Promise.reject(new Error("L'applicazione non è configurata correttamente per l'autenticazione. Contatta il supporto. (Firebase configuration is missing)."));

export const signInWithGoogle = () => {
    if (!auth || !googleProvider) return authNotConfiguredError();
    // Reverting to signInWithPopup. The "Operation not supported" error is likely due to
    // blocked IndexedDB, which is now fixed by setting persistence to localStorage.
    // If popups are also blocked, the user may need to allow them for this site.
    return auth.signInWithPopup(googleProvider);
};

export const logout = () => {
    if (!auth) return authNotConfiguredError();
    // FIX: Use v8 auth method.
    return auth.signOut();
};

// Listener for auth state changes
// FIX: Use v8 User type and auth method.
export const onAuthChange = (callback: (user: firebase.User | null) => void) => {
    if (!auth) {
        callback(null); // Immediately return "not logged in"
        return () => {}; // Return a dummy unsubscribe function
    }
    return auth.onAuthStateChanged(callback);
};
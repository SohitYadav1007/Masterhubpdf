import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDsGOOSOTc-w5mZOOJWI9v3PgRNuOCYtkY",
  authDomain: "masterhubpdf.firebaseapp.com",
  projectId: "masterhubpdf",
  storageBucket: "masterhubpdf.firebasestorage.app",
  messagingSenderId: "275794295237",
  appId: "1:275794295237:web:d6b8b2d41dbe85eba333ac",
  measurementId: "G-FP3JFE00DY"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const ADMIN_EMAIL = 'sohityadav0211@gmail.com';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (err) {
    if (['auth/popup-blocked','auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(err.code)) {
      try { await signInWithRedirect(auth, provider); return { user: null, error: null }; }
      catch (e) { return { user: null, error: e.message }; }
    }
    return { user: null, error: err.message };
  }
};
export const signOutUser = () => signOut(auth).catch(() => {});
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);
export const handleRedirectResult = () => getRedirectResult(auth).catch(() => null);

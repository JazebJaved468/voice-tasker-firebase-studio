// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project config values!
const firebaseConfig = {
  apiKey: "AIzaSyB-61DX6kNG0QqNx9dYGA4aDnvqAYwOCNQ",
  authDomain: "voice-tasker-a0ceb.firebaseapp.com",
  projectId: "voice-tasker-a0ceb",
  storageBucket: "voice-tasker-a0ceb.firebasestorage.app",
  messagingSenderId: "449412631452",
  appId: "1:449412631452:web:cbc1fe0bbea951f0f0d659",
  measurementId: "G-Y8R2WDWESV"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig); 
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);

export { app, db };

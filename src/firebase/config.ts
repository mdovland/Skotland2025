import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAAxYkWNWih_-yH2pH0-dfcMur0K1YKXIk",
  authDomain: "skotland2025.firebaseapp.com",
  databaseURL: "https://skotland2025-default-rtdb.firebaseio.com/",
  projectId: "skotland2025",
  storageBucket: "skotland2025.firebasestorage.app",
  messagingSenderId: "575760903060",
  appId: "1:575760903060:web:3c245b45c2cc3a93e77d81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export default app;
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAks4aZ_NyLAI67XsCmnllb2veZQso9Huc",
  authDomain: "hospital-d06dd.firebaseapp.com",
  projectId: "hospital-d06dd",
  storageBucket: "hospital-d06dd.firebasestorage.app",
  messagingSenderId: "834256897627",
  appId: "1:834256897627:web:c73192ac8a7b1be0cf617e",
  databaseURL: "https://hospital-d06dd-default-rtdb.firebaseio.com/",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export default app;

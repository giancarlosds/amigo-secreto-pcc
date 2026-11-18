import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNp_WZz3IFFlh41RfF45adDvLX1zcoPDU",
  authDomain: "amigo-secreto-pcc.firebaseapp.com",
  projectId: "amigo-secreto-pcc",
  storageBucket: "amigo-secreto-pcc.firebasestorage.app",
  messagingSenderId: "338296642948",
  appId: "1:338296642948:web:db5dc67d600bad92b691d1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);